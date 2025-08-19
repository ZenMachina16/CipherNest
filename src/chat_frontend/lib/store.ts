/**
 * CipherNest Global State Management with Zustand
 * 
 * This store manages:
 * - User identity and cryptographic keys
 * - Active chat sessions with SecureSession instances
 * - Message history and UI state
 * - Connection status and error handling
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Principal } from '@dfinity/principal';
import { 
  SecureSession, 
  UserIdentity, 
  generateUserIdentity, 
  createPreKeyBundle,
  type RatchetMessage 
} from './crypto';
import { getChatBackendActor, type MessageEnvelope, type PreKeyBundle } from './actor';

// =============================================================================
// TYPES
// =============================================================================

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  isOwnMessage: boolean;
  isEncrypted: boolean;
  messageNumber?: number;
  error?: string;
  recipientPrincipal?: string;
}

export interface ChatSession {
  recipientPrincipal: string;
  session: SecureSession | null;
  messages: ChatMessage[];
  isInitialized: boolean;
  initError: string | null;
  lastActivity: number;
  isPolling: boolean;
  lastPolled: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  retryCount: number;
}

export interface UserState {
  identity: UserIdentity | null;
  isIdentityLoaded: boolean;
  registrationStatus: 'none' | 'pending' | 'registered' | 'error';
  registrationError: string | null;
}

// =============================================================================
// STORE INTERFACE
// =============================================================================

interface CipherNestStore {
  // User Identity Management
  user: UserState;
  
  // Chat Sessions
  sessions: Record<string, ChatSession>;
  activeSessionPrincipal: string | null;
  
  // Connection Status
  connection: ConnectionStatus;
  
  // UI State
  ui: {
    isMessageInputFocused: boolean;
    isEncrypting: boolean;
    lastErrorShown: string | null;
  };

  // Actions - User Identity
  generateUserIdentity: () => Promise<void>;
  registerUserKeys: () => Promise<void>;
  clearUserIdentity: () => void;

  // Actions - Chat Sessions
  initializeSession: (recipientPrincipal: string) => Promise<void>;
  sendMessage: (recipientPrincipal: string, content: string) => Promise<void>;
  pollMessages: (recipientPrincipal: string) => Promise<void>;
  setActiveSession: (recipientPrincipal: string | null) => void;
  clearSession: (recipientPrincipal: string) => void;
  
  // Actions - Connection
  setConnectionStatus: (status: Partial<ConnectionStatus>) => void;
  resetConnection: () => void;
  
  // Actions - UI
  setUIState: (state: Partial<CipherNestStore['ui']>) => void;
  
  // Utilities
  getActiveSession: () => ChatSession | null;
  getSessionByPrincipal: (principal: string) => ChatSession | null;
  addMessageToSession: (recipientPrincipal: string, message: ChatMessage) => void;
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useCipherNestStore = create<CipherNestStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        user: {
          identity: null,
          isIdentityLoaded: false,
          registrationStatus: 'none',
          registrationError: null,
        },
        
        sessions: {},
        activeSessionPrincipal: null,
        
        connection: {
          isConnected: false,
          isConnecting: false,
          lastError: null,
          retryCount: 0,
        },
        
        ui: {
          isMessageInputFocused: false,
          isEncrypting: false,
          lastErrorShown: null,
        },

        // User Identity Actions
        generateUserIdentity: async () => {
          try {
            set(state => ({
              user: { ...state.user, isIdentityLoaded: false }
            }));

            console.log('🔐 Generating user identity...');
            const identity = await generateUserIdentity(`user-${Date.now()}`);
            
            set(state => ({
              user: {
                ...state.user,
                identity,
                isIdentityLoaded: true,
                registrationStatus: 'none',
                registrationError: null,
              }
            }));

            console.log('✅ User identity generated successfully');
          } catch (error) {
            console.error('❌ Failed to generate user identity:', error);
            set(state => ({
              user: {
                ...state.user,
                isIdentityLoaded: true,
                registrationError: error instanceof Error ? error.message : 'Failed to generate identity'
              }
            }));
          }
        },

        registerUserKeys: async () => {
          const { user } = get();
          if (!user.identity) {
            throw new Error('No user identity available. Generate identity first.');
          }

          try {
            set(state => ({
              user: { ...state.user, registrationStatus: 'pending', registrationError: null }
            }));

            console.log('📤 Registering user keys with canister...');
            const actor = getChatBackendActor();
            const preKeyBundle = createPreKeyBundle(user.identity, 'CipherNest Web Client');
            
            const result = await actor.register({
              user: Principal.anonymous(), // Will be set by canister
              kyber_pub: preKeyBundle.kyber_pub,
              ecdh_pub: preKeyBundle.ecdh_pub,
              dilithium_pub: preKeyBundle.dilithium_pub,
              signature: preKeyBundle.signature,
              created_at: preKeyBundle.created_at,
              expires_at: preKeyBundle.expires_at,
              note: preKeyBundle.note,
            });

            set(state => ({
              user: { ...state.user, registrationStatus: 'registered' },
              connection: { ...state.connection, isConnected: true, lastError: null }
            }));

            console.log('✅ User keys registered:', result);
          } catch (error) {
            console.error('❌ Failed to register user keys:', error);
            set(state => ({
              user: {
                ...state.user,
                registrationStatus: 'error',
                registrationError: error instanceof Error ? error.message : 'Registration failed'
              }
            }));
          }
        },

        clearUserIdentity: () => {
          set(state => ({
            user: {
              identity: null,
              isIdentityLoaded: false,
              registrationStatus: 'none',
              registrationError: null,
            },
            sessions: {}, // Clear all sessions
            activeSessionPrincipal: null,
          }));
        },

        // Chat Session Actions
        initializeSession: async (recipientPrincipal: string) => {
          const { user } = get();
          if (!user.identity || user.registrationStatus !== 'registered') {
            throw new Error('User identity not registered. Register keys first.');
          }

          try {
            // Initialize session state
            set(state => ({
              sessions: {
                ...state.sessions,
                [recipientPrincipal]: {
                  recipientPrincipal,
                  session: null,
                  messages: [],
                  isInitialized: false,
                  initError: null,
                  lastActivity: Date.now(),
                  isPolling: false,
                  lastPolled: 0,
                }
              }
            }));

            console.log(`🔐 Initializing session with ${recipientPrincipal}...`);
            
            // Parse recipient principal
            const principal = Principal.fromText(recipientPrincipal);
            
            // Fetch recipient's key bundle
            console.log('📥 Fetching recipient key bundle...');
            const actor = getChatBackendActor();
            const recipientBundle = await actor.get_key_bundle(principal);
            
            if (!recipientBundle || recipientBundle.length === 0) {
              throw new Error('Recipient has not registered their keys yet. They need to open CipherNest first.');
            }

            const recipientKeys = recipientBundle[0];
            console.log('📋 Recipient key bundle received');

            // Create initial root key and initialize SecureSession
            const initialRootKey = crypto.getRandomValues(new Uint8Array(32));
            const session = new SecureSession(
              initialRootKey,
              user.identity.ecdhKeyPair,
              new Uint8Array(recipientKeys.ecdh_pub),
              true
            );

            // Update session state
            set(state => ({
              sessions: {
                ...state.sessions,
                [recipientPrincipal]: {
                  ...state.sessions[recipientPrincipal],
                  session,
                  isInitialized: true,
                  lastActivity: Date.now(),
                }
              }
            }));

            console.log(`✅ Session with ${recipientPrincipal} initialized`);
          } catch (error) {
            console.error(`❌ Failed to initialize session with ${recipientPrincipal}:`, error);
            set(state => ({
              sessions: {
                ...state.sessions,
                [recipientPrincipal]: {
                  ...state.sessions[recipientPrincipal],
                  initError: error instanceof Error ? error.message : 'Session initialization failed'
                }
              }
            }));
          }
        },

        sendMessage: async (recipientPrincipal: string, content: string) => {
          const { sessions } = get();
          const session = sessions[recipientPrincipal];
          
          if (!session?.session || !session.isInitialized) {
            throw new Error('Session not initialized');
          }

          try {
            set(state => ({ ui: { ...state.ui, isEncrypting: true } }));

            console.log('🔒 Encrypting message...');
            const ratchetMessage: RatchetMessage = await session.session.encrypt(content);
            
            // Create MessageEnvelope for canister
            const envelope: MessageEnvelope = {
              id: crypto.randomUUID(),
              sender: Principal.anonymous(), // Will be set by canister
              recipient: Principal.fromText(recipientPrincipal),
              ciphertext: ratchetMessage.ciphertext,
              ephemeral_pub: ratchetMessage.header.dhPublicKey,
              signature: new Uint8Array(64), // Would be actual signature in production
              algorithm: 'Kyber+ECDH+DoubleRatchet+AES256GCM',
              created_at: BigInt(Math.floor(Date.now() / 1000)),
              ttl_seconds: [BigInt(24 * 60 * 60)],
            };

            // Send to canister
            console.log('📤 Sending message to canister...');
            const actor = getChatBackendActor();
            await actor.send_message(envelope);

            // Add to local messages
            const message: ChatMessage = {
              id: envelope.id,
              content,
              timestamp: Date.now(),
              isOwnMessage: true,
              isEncrypted: true,
              messageNumber: ratchetMessage.header.messageNumber,
              recipientPrincipal,
            };

            get().addMessageToSession(recipientPrincipal, message);
            console.log('✅ Message sent successfully');
          } catch (error) {
            console.error('❌ Failed to send message:', error);
            
            // Add error message
            const errorMessage: ChatMessage = {
              id: `error-${Date.now()}`,
              content,
              timestamp: Date.now(),
              isOwnMessage: true,
              isEncrypted: false,
              error: error instanceof Error ? error.message : 'Failed to send message',
              recipientPrincipal,
            };
            
            get().addMessageToSession(recipientPrincipal, errorMessage);
          } finally {
            set(state => ({ ui: { ...state.ui, isEncrypting: false } }));
          }
        },

        pollMessages: async (recipientPrincipal: string) => {
          const { sessions } = get();
          const session = sessions[recipientPrincipal];
          
          if (!session?.session || !session.isInitialized) return;

          try {
            set(state => ({
              sessions: {
                ...state.sessions,
                [recipientPrincipal]: {
                  ...state.sessions[recipientPrincipal],
                  isPolling: true,
                }
              }
            }));

            console.log(`📥 Polling messages for ${recipientPrincipal}...`);
            const actor = getChatBackendActor();
            const envelopes = await actor.receive_messages();
            
            if (envelopes.length === 0) {
              console.log('📭 No new messages');
              return;
            }

            console.log(`📨 Received ${envelopes.length} new messages`);
            const newMessages: ChatMessage[] = [];

            // Decrypt each message
            for (const envelope of envelopes) {
              try {
                // Reconstruct RatchetMessage from MessageEnvelope
                const ratchetMessage: RatchetMessage = {
                  header: {
                    dhPublicKey: new Uint8Array(envelope.ephemeral_pub),
                    previousChainLength: 0,
                    messageNumber: 0,
                  },
                  ciphertext: new Uint8Array(envelope.ciphertext),
                };

                const decryptedContent = await session.session.decrypt(ratchetMessage);

                const message: ChatMessage = {
                  id: envelope.id,
                  content: decryptedContent,
                  timestamp: Number(envelope.created_at) * 1000,
                  isOwnMessage: false,
                  isEncrypted: true,
                  messageNumber: ratchetMessage.header.messageNumber,
                  recipientPrincipal,
                };

                newMessages.push(message);
                console.log(`✅ Decrypted message: ${decryptedContent.substring(0, 50)}...`);
              } catch (decryptError) {
                console.error('❌ Failed to decrypt message:', decryptError);
                
                const errorMessage: ChatMessage = {
                  id: `decrypt-error-${envelope.id}`,
                  content: '[Encrypted message - decryption failed]',
                  timestamp: Number(envelope.created_at) * 1000,
                  isOwnMessage: false,
                  isEncrypted: false,
                  error: 'Failed to decrypt message',
                  recipientPrincipal,
                };
                
                newMessages.push(errorMessage);
              }
            }

            // Add new messages to session
            if (newMessages.length > 0) {
              set(state => ({
                sessions: {
                  ...state.sessions,
                  [recipientPrincipal]: {
                    ...state.sessions[recipientPrincipal],
                    messages: [...state.sessions[recipientPrincipal].messages, ...newMessages],
                    lastActivity: Date.now(),
                  }
                }
              }));
            }
          } catch (error) {
            console.error(`❌ Failed to poll messages for ${recipientPrincipal}:`, error);
          } finally {
            set(state => ({
              sessions: {
                ...state.sessions,
                [recipientPrincipal]: {
                  ...state.sessions[recipientPrincipal],
                  isPolling: false,
                  lastPolled: Date.now(),
                }
              }
            }));
          }
        },

        setActiveSession: (recipientPrincipal: string | null) => {
          set({ activeSessionPrincipal: recipientPrincipal });
        },

        clearSession: (recipientPrincipal: string) => {
          set(state => {
            const newSessions = { ...state.sessions };
            delete newSessions[recipientPrincipal];
            return {
              sessions: newSessions,
              activeSessionPrincipal: state.activeSessionPrincipal === recipientPrincipal 
                ? null 
                : state.activeSessionPrincipal
            };
          });
        },

        // Connection Actions
        setConnectionStatus: (status: Partial<ConnectionStatus>) => {
          set(state => ({
            connection: { ...state.connection, ...status }
          }));
        },

        resetConnection: () => {
          set(state => ({
            connection: {
              isConnected: false,
              isConnecting: false,
              lastError: null,
              retryCount: 0,
            }
          }));
        },

        // UI Actions
        setUIState: (uiState: Partial<CipherNestStore['ui']>) => {
          set(state => ({
            ui: { ...state.ui, ...uiState }
          }));
        },

        // Utility Functions
        getActiveSession: () => {
          const { sessions, activeSessionPrincipal } = get();
          return activeSessionPrincipal ? sessions[activeSessionPrincipal] || null : null;
        },

        getSessionByPrincipal: (principal: string) => {
          const { sessions } = get();
          return sessions[principal] || null;
        },

        addMessageToSession: (recipientPrincipal: string, message: ChatMessage) => {
          set(state => ({
            sessions: {
              ...state.sessions,
              [recipientPrincipal]: {
                ...state.sessions[recipientPrincipal],
                messages: [...(state.sessions[recipientPrincipal]?.messages || []), message],
                lastActivity: Date.now(),
              }
            }
          }));
        },
      }),
      {
        name: 'ciphernest-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist user identity and basic session info (not SecureSession instances)
          user: {
            identity: state.user.identity,
            isIdentityLoaded: state.user.isIdentityLoaded,
            registrationStatus: state.user.registrationStatus,
            registrationError: state.user.registrationError,
          },
          // Don't persist sessions as they contain non-serializable SecureSession instances
          // Sessions will be re-initialized on app load
        }),
      }
    )
  )
);

// =============================================================================
// STORE HOOKS AND UTILITIES
// =============================================================================

// Convenience hooks for common patterns
export const useUserIdentity = () => useCipherNestStore(state => state.user);
export const useActiveSession = () => useCipherNestStore(state => state.getActiveSession());
export const useConnectionStatus = () => useCipherNestStore(state => state.connection);
export const useUIState = () => useCipherNestStore(state => state.ui);

// Session-specific hooks
export const useSessionMessages = (recipientPrincipal: string) => 
  useCipherNestStore(state => state.sessions[recipientPrincipal]?.messages || []);

export const useSessionStatus = (recipientPrincipal: string) => 
  useCipherNestStore(state => {
    const session = state.sessions[recipientPrincipal];
    return {
      isInitialized: session?.isInitialized || false,
      initError: session?.initError || null,
      isPolling: session?.isPolling || false,
      lastPolled: session?.lastPolled || 0,
    };
  });

// Action hooks
export const useCipherNestActions = () => {
  const store = useCipherNestStore();
  return {
    // User actions
    generateUserIdentity: store.generateUserIdentity,
    registerUserKeys: store.registerUserKeys,
    clearUserIdentity: store.clearUserIdentity,
    
    // Session actions
    initializeSession: store.initializeSession,
    sendMessage: store.sendMessage,
    pollMessages: store.pollMessages,
    setActiveSession: store.setActiveSession,
    clearSession: store.clearSession,
    
    // Connection actions
    setConnectionStatus: store.setConnectionStatus,
    resetConnection: store.resetConnection,
    
    // UI actions
    setUIState: store.setUIState,
  };
};

export default useCipherNestStore;
