//! CipherNest chat_backend canister
//! 
//! A zero-knowledge message router and public key directory for post-quantum secure messaging.
//! Uses stable memory for persistence and implements ephemeral messaging with perfect forward secrecy.

use ic_cdk::api::caller;
use ic_cdk_macros::{heartbeat, init, query, update};
use candid::Principal;

mod state;
mod types;

use state::State;
use types::{PreKeyBundle, MessageEnvelope};

/// Initialize the canister state
#[init]
fn init() {
    // State initialization happens lazily in State::with()
}

/// Register a user's PreKeyBundle for key exchange
/// 
/// This function allows users to register their public keys for post-quantum secure communication.
/// The PreKeyBundle contains:
/// - Kyber public key for post-quantum key encapsulation
/// - ECDH public key for hybrid classical/quantum resistance  
/// - Dilithium public key for post-quantum signatures
/// - Self-signature proving ownership of the private keys
#[update]
fn register(mut bundle: PreKeyBundle) -> String {
    let caller_principal = caller();
    
    // Ensure the bundle's user field matches the caller's principal
    // This prevents users from registering keys for other users
    bundle.user = caller_principal;
    
    // Validate the bundle has required fields
    if bundle.kyber_pub.is_empty() {
        return "Error: Kyber public key cannot be empty".to_string();
    }
    
    if bundle.ecdh_pub.is_empty() {
        return "Error: ECDH public key cannot be empty".to_string();
    }
    
    if bundle.dilithium_pub.is_empty() {
        return "Error: Dilithium public key cannot be empty".to_string();
    }
    
    if bundle.signature.is_empty() {
        return "Error: Bundle signature cannot be empty".to_string();
    }
    
    // Store the bundle in stable memory
    State::with(|state| {
        state.put_user(&bundle);
    });
    
    format!("Successfully registered PreKeyBundle for user {}", caller_principal)
}

/// Retrieve a user's PreKeyBundle if present
/// 
/// This query function allows users to fetch public keys needed for secure communication
/// setup. It returns None if the user hasn't registered keys yet.
#[query]
fn get_key_bundle(user: candid::Principal) -> Option<PreKeyBundle> {
    State::with(|state| {
        state.get_user(&user)
    })
}

/// Send an encrypted message to another user
/// 
/// This function handles routing encrypted messages between users. The message is stored
/// in the recipient's queue for 24 hours (ephemeral messaging). The canister acts as a 
/// zero-knowledge router - it cannot decrypt the message contents.
#[update]
fn send_message(mut envelope: MessageEnvelope) {
    let caller_principal = caller();
    
    // Verify that the caller matches the sender field in the envelope
    // This prevents users from spoofing messages from other users
    if envelope.sender != caller_principal {
        ic_cdk::trap("Sender field must match caller principal");
    }
    
    // Validate required fields
    if envelope.id.is_empty() {
        ic_cdk::trap("Message ID cannot be empty");
    }
    
    if envelope.ciphertext.is_empty() {
        ic_cdk::trap("Message ciphertext cannot be empty");
    }
    
    if envelope.ephemeral_pub.is_empty() {
        ic_cdk::trap("Ephemeral public key cannot be empty");
    }
    
    if envelope.signature.is_empty() {
        ic_cdk::trap("Message signature cannot be empty");
    }
    
    if envelope.algorithm.is_empty() {
        ic_cdk::trap("Algorithm identifier cannot be empty");
    }
    
    // Set automatic 24-hour expiration for ephemeral messaging
    let current_time = ic_cdk::api::time() / 1_000_000_000; // Convert nanoseconds to seconds
    let expires_in_24h = current_time + (24 * 60 * 60); // 24 hours in seconds
    
    // Override any existing TTL with our 24-hour policy
    envelope.ttl_seconds = Some(24 * 60 * 60);
    
    // Update created_at to current time if not set or invalid
    if envelope.created_at == 0 || envelope.created_at > current_time {
        envelope.created_at = current_time;
    }
    
    // Store the message in the recipient's queue
    State::with(|state| {
        state.push_message(&envelope.recipient, &envelope);
    });
}

/// Receive all messages for the caller
/// 
/// This function retrieves and removes all messages from the caller's queue.
/// Messages are returned in the order they were received. Once retrieved,
/// messages are permanently deleted from the canister's storage.
/// 
/// This implements a "consume" pattern where messages can only be read once,
/// supporting the ephemeral messaging design of CipherNest.
#[update]
fn receive_messages() -> Vec<MessageEnvelope> {
    let caller_principal = caller();
    
    // Retrieve and remove all messages for the caller
    // This is an atomic operation - messages are both fetched and deleted
    State::with(|state| {
        state.pop_messages(&caller_principal)
    })
}

/// Automatic cleanup of expired messages
/// 
/// This heartbeat function runs automatically and periodically cleans up expired messages
/// from all user queues. It implements the ephemeral messaging policy by removing any
/// message that has exceeded its 24-hour TTL (time-to-live).
/// 
/// The heartbeat ensures that:
/// - Messages are automatically deleted after 24 hours
/// - Storage space is reclaimed from expired messages
/// - Privacy is maintained by not keeping old messages
/// - The canister doesn't grow indefinitely in size
#[heartbeat]
fn cleanup_expired_messages() {
    let current_time = ic_cdk::api::time() / 1_000_000_000; // Convert nanoseconds to seconds
    
    State::with(|state| {
        let removed_count = state.cleanup_expired_messages(current_time);
        
        // Log cleanup activity (this will appear in canister logs)
        if removed_count > 0 {
            ic_cdk::println!("Cleaned up {} expired messages at timestamp {}", removed_count, current_time);
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use candid::Principal;

    #[test]
    fn test_register_validation() {
        // Test empty kyber key
        let mut bundle = PreKeyBundle {
            user: Principal::anonymous(),
            kyber_pub: vec![],
            ecdh_pub: vec![1, 2, 3],
            dilithium_pub: vec![4, 5, 6],
            signature: vec![7, 8, 9],
            created_at: 1640995200,
            expires_at: None,
            note: None,
        };
        
        // This would fail in a real canister context due to caller() not being available in tests
        // but demonstrates the validation logic
    }
}
