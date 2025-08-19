import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { config } from './config';

// TypeScript types matching our Candid interface
export interface PreKeyBundle {
  user: Principal;
  kyber_pub: Uint8Array;
  ecdh_pub: Uint8Array;
  dilithium_pub: Uint8Array;
  signature: Uint8Array;
  created_at: bigint;
  expires_at: [bigint] | [];
  note: [string] | [];
}

export interface MessageEnvelope {
  id: string;
  sender: Principal;
  recipient: Principal;
  ciphertext: Uint8Array;
  ephemeral_pub: Uint8Array;
  signature: Uint8Array;
  algorithm: string;
  created_at: bigint;
  ttl_seconds: [bigint] | [];
}

// Actor interface matching our canister's methods
export interface ChatBackendActor {
  register: (bundle: PreKeyBundle) => Promise<string>;
  get_key_bundle: (user: Principal) => Promise<[PreKeyBundle] | []>;
  send_message: (envelope: MessageEnvelope) => Promise<void>;
  receive_messages: () => Promise<MessageEnvelope[]>;
}

// Candid IDL factory for our chat_backend canister
const idlFactory = ({ IDL }: any) => {
  const PreKeyBundle = IDL.Record({
    'user': IDL.Principal,
    'kyber_pub': IDL.Vec(IDL.Nat8),
    'ecdh_pub': IDL.Vec(IDL.Nat8),
    'dilithium_pub': IDL.Vec(IDL.Nat8),
    'signature': IDL.Vec(IDL.Nat8),
    'created_at': IDL.Nat64,
    'expires_at': IDL.Opt(IDL.Nat64),
    'note': IDL.Opt(IDL.Text),
  });

  const MessageEnvelope = IDL.Record({
    'id': IDL.Text,
    'sender': IDL.Principal,
    'recipient': IDL.Principal,
    'ciphertext': IDL.Vec(IDL.Nat8),
    'ephemeral_pub': IDL.Vec(IDL.Nat8),
    'signature': IDL.Vec(IDL.Nat8),
    'algorithm': IDL.Text,
    'created_at': IDL.Nat64,
    'ttl_seconds': IDL.Opt(IDL.Nat64),
  });

  return IDL.Service({
    'register': IDL.Func([PreKeyBundle], [IDL.Text], []),
    'get_key_bundle': IDL.Func([IDL.Principal], [IDL.Opt(PreKeyBundle)], ['query']),
    'send_message': IDL.Func([MessageEnvelope], [], []),
    'receive_messages': IDL.Func([], [IDL.Vec(MessageEnvelope)], []),
  });
};

// Create and configure the HTTP agent
function createAgent(): HttpAgent {
  const agent = new HttpAgent({ host: config.icHost });

  // Fetch root key for local development
  if (!config.isProduction) {
    agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key for local development:', err);
    });
  }

  return agent;
}

// Create the chat backend actor
export function createChatBackendActor(): ChatBackendActor {
  const agent = createAgent();

  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: config.chatBackendCanisterId,
  }) as ChatBackendActor;

  return actor;
}

// Singleton instance for convenience
let chatBackendActor: ChatBackendActor | null = null;

export function getChatBackendActor(): ChatBackendActor {
  if (!chatBackendActor) {
    chatBackendActor = createChatBackendActor();
  }
  return chatBackendActor;
}

// Helper function to reset the actor (useful for testing or authentication changes)
export function resetChatBackendActor(): void {
  chatBackendActor = null;
}

// Utility functions for working with the actor
export const chatBackend = {
  /**
   * Register a user's public key bundle
   */
  async register(bundle: Omit<PreKeyBundle, 'user'>): Promise<string> {
    const actor = getChatBackendActor();
    // The user field will be set by the canister based on the caller
    const fullBundle: PreKeyBundle = {
      ...bundle,
      user: Principal.anonymous(), // This will be overridden by the canister
    };
    return await actor.register(fullBundle);
  },

  /**
   * Get a user's public key bundle
   */
  async getKeyBundle(user: Principal): Promise<PreKeyBundle | null> {
    const actor = getChatBackendActor();
    const result = await actor.get_key_bundle(user);
    // Handle the Candid optional type: [PreKeyBundle] | []
    return Array.isArray(result) && result.length > 0 ? result[0]! : null;
  },

  /**
   * Send an encrypted message
   */
  async sendMessage(envelope: MessageEnvelope): Promise<void> {
    const actor = getChatBackendActor();
    return await actor.send_message(envelope);
  },

  /**
   * Receive all messages for the current user
   */
  async receiveMessages(): Promise<MessageEnvelope[]> {
    const actor = getChatBackendActor();
    return await actor.receive_messages();
  },
};

export default chatBackend;
