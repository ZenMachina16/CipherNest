use std::cell::RefCell;

use candid::Principal;
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};

use crate::types::{MessageEnvelope, PreKeyBundle};

thread_local! {
    /// Single-threaded canister state stored in stable structures.
    static STATE: RefCell<Option<State>> = RefCell::new(None);
}

pub struct State {
    /// Map from principal bytes -> serialized PreKeyBundle
    pub users: StableBTreeMap<Vec<u8>, Vec<u8>, DefaultMemoryImpl>,

    /// Map from principal bytes -> serialized Vec<MessageEnvelope>
    pub messages: StableBTreeMap<Vec<u8>, Vec<u8>, DefaultMemoryImpl>,
}

impl State {
    /// Initialize a new State backed by stable memory.
    pub fn new() -> Self {
        // DefaultMemoryImpl provides access to canister stable memory.
        let memory = DefaultMemoryImpl::default();

        // Namespaces are arbitrary byte prefixes used to separate maps in stable memory.
        let users = StableBTreeMap::new(b"users", memory.clone());
        let messages = StableBTreeMap::new(b"messages", memory);

        Self { users, messages }
    }

    /// Ensure the STATE is initialized and return a mutable reference to it.
    pub fn with<R>(f: impl FnOnce(&mut State) -> R) -> R {
        STATE.with(|cell| {
            let mut opt = cell.borrow_mut();
            if opt.is_none() {
                *opt = Some(State::new());
            }
            // It's safe to unwrap here because we ensured initialization above.
            let state = opt.as_mut().unwrap();
            f(state)
        })
    }

    fn key_from_principal(p: &Principal) -> Vec<u8> {
        p.as_slice().to_vec()
    }

    /// Insert or update a user's PreKeyBundle.
    pub fn put_user(&mut self, bundle: &PreKeyBundle) {
        let key = Self::key_from_principal(&bundle.user);
        if let Ok(serialized) = serde_json::to_vec(bundle) {
            let _ = self.users.insert(key, serialized);
        }
    }

    /// Retrieve a user's PreKeyBundle if present.
    pub fn get_user(&self, user: &Principal) -> Option<PreKeyBundle> {
        let key = Self::key_from_principal(user);
        self.users.get(&key).and_then(|bytes| serde_json::from_slice(&bytes).ok())
    }

    /// Append a message to the recipient's queue.
    pub fn push_message(&mut self, recipient: &Principal, env: &MessageEnvelope) {
        let key = Self::key_from_principal(recipient);

        // Load existing queue
        let mut queue: Vec<MessageEnvelope> = if let Some(bytes) = self.messages.get(&key) {
            serde_json::from_slice(&bytes).unwrap_or_default()
        } else {
            Vec::new()
        };

        queue.push(env.clone());

        if let Ok(serialized) = serde_json::to_vec(&queue) {
            let _ = self.messages.insert(key, serialized);
        }
    }

    /// Fetch and return the message queue for the given principal. Does not remove messages.
    pub fn get_messages(&self, principal: &Principal) -> Vec<MessageEnvelope> {
        let key = Self::key_from_principal(principal);
        if let Some(bytes) = self.messages.get(&key) {
            serde_json::from_slice(&bytes).unwrap_or_default()
        } else {
            Vec::new()
        }
    }

    /// Pop (remove) and return all messages for the principal.
    pub fn pop_messages(&mut self, principal: &Principal) -> Vec<MessageEnvelope> {
        let key = Self::key_from_principal(principal);
        if let Some(bytes) = self.messages.get(&key) {
            let msgs: Vec<MessageEnvelope> = serde_json::from_slice(&bytes).unwrap_or_default();
            let _ = self.messages.remove(&key);
            msgs
        } else {
            Vec::new()
        }
    }
}
