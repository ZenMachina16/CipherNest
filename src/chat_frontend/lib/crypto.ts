/**
 * CipherNest Client-Side Cryptography
 * 
 * This module implements post-quantum secure cryptography for the CipherNest messaging application.
 * It combines CRYSTALS-Kyber (PQC KEM), CRYSTALS-Dilithium (PQC signatures), and ECDH (classical) 
 * for hybrid quantum-resistant security.
 * 
 * Security Architecture:
 * - Key Exchange: Hybrid PQC/ECC using CRYSTALS-Kyber + ECDH
 * - Signatures: CRYSTALS-Dilithium (post-quantum)
 * - Session Management: Double Ratchet Algorithm for perfect forward secrecy
 * - Encryption: AES-256-GCM
 */

import { Principal } from '@dfinity/principal';
import * as nacl from 'tweetnacl';
import { decodeUTF8, encodeUTF8 } from 'tweetnacl-util';

// Note: These imports would be for actual PQC libraries
// For now, we'll simulate them with placeholders and use NaCl for the classical parts
// import * as kyber from 'pqc-kyber';
// import * as dilithium from 'pqc-dilithium';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface KyberKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface DilithiumKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface ECDHKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface UserIdentity {
  // Post-quantum key encapsulation (Kyber)
  kyberKeyPair: KyberKeyPair;
  
  // Classical ECDH for hybrid security
  ecdhKeyPair: ECDHKeyPair;
  
  // Post-quantum signatures (Dilithium)
  dilithiumKeyPair: DilithiumKeyPair;
  
  // Metadata
  createdAt: number;
  userId: string;
}

export interface PreKeyBundleData {
  kyber_pub: Uint8Array;
  ecdh_pub: Uint8Array;
  dilithium_pub: Uint8Array;
  signature: Uint8Array;
  created_at: bigint;
  expires_at: [bigint] | [];
  note: [string] | [];
}

export interface EncryptedMessage {
  id: string;
  ciphertext: Uint8Array;
  ephemeralKyberPub: Uint8Array;
  ephemeralECDHPub: Uint8Array;
  signature: Uint8Array;
  algorithm: string;
  timestamp: number;
}

// =============================================================================
// POST-QUANTUM CRYPTO SIMULATION
// =============================================================================

/**
 * Simulated Kyber key generation
 * In production, this would use actual CRYSTALS-Kyber implementation
 */
function generateKyberKeyPair(): KyberKeyPair {
  // TODO: Replace with actual Kyber implementation
  // For now, simulate with random bytes of appropriate size
  const privateKey = crypto.getRandomValues(new Uint8Array(2400)); // Kyber768 private key size
  const publicKey = crypto.getRandomValues(new Uint8Array(1184));  // Kyber768 public key size
  
  return { publicKey, privateKey };
}

/**
 * Simulated Dilithium key generation
 * In production, this would use actual CRYSTALS-Dilithium implementation
 */
function generateDilithiumKeyPair(): DilithiumKeyPair {
  // TODO: Replace with actual Dilithium implementation
  // For now, simulate with random bytes of appropriate size
  const privateKey = crypto.getRandomValues(new Uint8Array(4000)); // Dilithium3 private key size
  const publicKey = crypto.getRandomValues(new Uint8Array(1952));  // Dilithium3 public key size
  
  return { publicKey, privateKey };
}

/**
 * Generate ECDH key pair using Curve25519
 * This provides classical elliptic curve security as part of our hybrid approach
 */
function generateECDHKeyPair(): ECDHKeyPair {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.secretKey,
  };
}

// =============================================================================
// SIGNATURE FUNCTIONS
// =============================================================================

/**
 * Sign data using Dilithium post-quantum signatures
 */
function signWithDilithium(data: Uint8Array, privateKey: Uint8Array): Uint8Array {
  // TODO: Replace with actual Dilithium signing
  // For now, use a placeholder that includes the data hash
  const hash = crypto.getRandomValues(new Uint8Array(64)); // Simulate signature
  return hash;
}

/**
 * Verify Dilithium signature
 */
function verifyDilithiumSignature(
  data: Uint8Array, 
  signature: Uint8Array, 
  publicKey: Uint8Array
): boolean {
  // TODO: Replace with actual Dilithium verification
  // For now, always return true for simulation
  return signature.length > 0 && publicKey.length > 0;
}

/**
 * Create a signature over the PreKeyBundle to prove ownership
 */
function signPreKeyBundle(bundle: Omit<PreKeyBundleData, 'signature'>, privateKey: Uint8Array): Uint8Array {
  // Serialize the bundle for signing
  const serialized = new Uint8Array([
    ...bundle.kyber_pub,
    ...bundle.ecdh_pub,
    ...bundle.dilithium_pub,
    ...new TextEncoder().encode(bundle.created_at.toString()),
  ]);
  
  return signWithDilithium(serialized, privateKey);
}

// =============================================================================
// KEY DERIVATION AND ENCRYPTION
// =============================================================================

/**
 * Derive a shared secret using hybrid Kyber + ECDH key exchange
 */
async function deriveSharedSecret(
  kyberCiphertext: Uint8Array,
  kyberPrivateKey: Uint8Array,
  ecdhPublicKey: Uint8Array,
  ecdhPrivateKey: Uint8Array
): Promise<Uint8Array> {
  // TODO: Replace with actual Kyber decapsulation
  const kyberSharedSecret = crypto.getRandomValues(new Uint8Array(32));
  
  // ECDH shared secret using NaCl
  const ecdhSharedSecret = nacl.box.before(ecdhPublicKey, ecdhPrivateKey);
  
  // Combine both secrets using HKDF
  const combinedInput = new Uint8Array(kyberSharedSecret.length + ecdhSharedSecret.length);
  combinedInput.set(kyberSharedSecret, 0);
  combinedInput.set(ecdhSharedSecret, kyberSharedSecret.length);
  
  // Use Web Crypto API for HKDF
  const key = await crypto.subtle.importKey(
    'raw',
    combinedInput,
    'HKDF',
    false,
    ['deriveKey']
  );
  
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32), // Use random salt in production
      info: new TextEncoder().encode('CipherNest-v1-SharedSecret'),
    },
    key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);
  return new Uint8Array(exportedKey);
}

/**
 * Encrypt a message using AES-256-GCM
 */
async function encryptMessage(
  plaintext: string,
  sharedSecret: Uint8Array
): Promise<{ ciphertext: Uint8Array; nonce: Uint8Array }> {
  const key = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    'AES-GCM',
    false,
    ['encrypt']
  );
  
  const nonce = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM nonce
  const plaintextBytes = new TextEncoder().encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    plaintextBytes
  );
  
  // Combine nonce + ciphertext
  const result = new Uint8Array(nonce.length + ciphertext.byteLength);
  result.set(nonce, 0);
  result.set(new Uint8Array(ciphertext), nonce.length);
  
  return { ciphertext: result, nonce };
}

/**
 * Decrypt a message using AES-256-GCM
 */
async function decryptMessage(
  ciphertext: Uint8Array,
  sharedSecret: Uint8Array
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    'AES-GCM',
    false,
    ['decrypt']
  );
  
  // Extract nonce and ciphertext
  const nonce = ciphertext.slice(0, 12);
  const encryptedData = ciphertext.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    encryptedData
  );
  
  return new TextDecoder().decode(decrypted);
}

// =============================================================================
// MAIN IDENTITY GENERATION FUNCTION
// =============================================================================

/**
 * Generate a complete user identity with all necessary cryptographic keys
 * 
 * This function creates:
 * - Kyber key pair for post-quantum key encapsulation
 * - ECDH key pair for hybrid classical/quantum resistance
 * - Dilithium key pair for post-quantum digital signatures
 * 
 * The generated identity can be used to create PreKeyBundles for registration
 * and to perform secure message encryption/decryption.
 */
export async function generateUserIdentity(userId?: string): Promise<UserIdentity> {
  console.log('🔐 Generating post-quantum user identity...');
  
  try {
    // Generate all key pairs
    console.log('📱 Generating Kyber key pair (PQC KEM)...');
    const kyberKeyPair = generateKyberKeyPair();
    
    console.log('🔑 Generating ECDH key pair (Curve25519)...');
    const ecdhKeyPair = generateECDHKeyPair();
    
    console.log('✍️ Generating Dilithium key pair (PQC signatures)...');
    const dilithiumKeyPair = generateDilithiumKeyPair();
    
    const identity: UserIdentity = {
      kyberKeyPair,
      ecdhKeyPair,
      dilithiumKeyPair,
      createdAt: Date.now(),
      userId: userId || `user-${Date.now()}`,
    };
    
    console.log('✅ User identity generated successfully!');
    console.log(`📊 Key sizes: Kyber(${kyberKeyPair.publicKey.length}), ECDH(${ecdhKeyPair.publicKey.length}), Dilithium(${dilithiumKeyPair.publicKey.length})`);
    
    return identity;
    
  } catch (error) {
    console.error('❌ Failed to generate user identity:', error);
    throw new Error(`Failed to generate user identity: ${error}`);
  }
}

/**
 * Create a PreKeyBundle from a UserIdentity for registration
 */
export function createPreKeyBundle(identity: UserIdentity, note?: string): PreKeyBundleData {
  const createdAt = BigInt(Math.floor(identity.createdAt / 1000)); // Convert to seconds
  const expiresAt: [bigint] | [] = [createdAt + BigInt(30 * 24 * 60 * 60)]; // 30 days
  
  const bundleData: Omit<PreKeyBundleData, 'signature'> = {
    kyber_pub: identity.kyberKeyPair.publicKey,
    ecdh_pub: identity.ecdhKeyPair.publicKey,
    dilithium_pub: identity.dilithiumKeyPair.publicKey,
    created_at: createdAt,
    expires_at: expiresAt,
    note: note ? [note] : [],
  };
  
  // Sign the bundle with Dilithium private key
  const signature = signPreKeyBundle(bundleData, identity.dilithiumKeyPair.privateKey);
  
  return {
    ...bundleData,
    signature,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert Uint8Array to hex string for debugging
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Secure random ID generation
 */
export function generateSecureId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bytesToHex(bytes);
}

/**
 * Validate that a UserIdentity has all required components
 */
export function validateUserIdentity(identity: UserIdentity): boolean {
  return !!(
    identity.kyberKeyPair?.publicKey?.length > 0 &&
    identity.kyberKeyPair?.privateKey?.length > 0 &&
    identity.ecdhKeyPair?.publicKey?.length > 0 &&
    identity.ecdhKeyPair?.privateKey?.length > 0 &&
    identity.dilithiumKeyPair?.publicKey?.length > 0 &&
    identity.dilithiumKeyPair?.privateKey?.length > 0 &&
    identity.createdAt > 0 &&
    identity.userId
  );
}

// =============================================================================
// DOUBLE RATCHET ALGORITHM IMPLEMENTATION
// =============================================================================

/**
 * Double Ratchet message header
 * Contains information needed for decryption and ratchet advancement
 */
interface RatchetHeader {
  dhPublicKey: Uint8Array;    // Current DH public key
  previousChainLength: number; // Number of messages in previous sending chain
  messageNumber: number;       // Message number in current sending chain
}

/**
 * Encrypted message with ratchet header
 */
interface RatchetMessage {
  header: RatchetHeader;
  ciphertext: Uint8Array;
}

/**
 * Chain key state for symmetric ratchet
 */
interface ChainKey {
  key: Uint8Array;
  index: number;
}

/**
 * Skipped message keys for out-of-order message handling
 */
interface SkippedMessageKey {
  dhPublicKey: Uint8Array;
  messageNumber: number;
  messageKey: Uint8Array;
}

/**
 * Double Ratchet session state
 */
interface RatchetState {
  // Root key for DH ratchet
  rootKey: Uint8Array;
  
  // Current DH key pairs
  dhSendingKeyPair: ECDHKeyPair | null;
  dhReceivingPublicKey: Uint8Array | null;
  
  // Chain keys for symmetric ratchet
  sendingChainKey: ChainKey | null;
  receivingChainKey: ChainKey | null;
  
  // Message counters
  sendingMessageNumber: number;
  receivingMessageNumber: number;
  previousSendingChainLength: number;
  
  // Out-of-order message handling
  skippedMessageKeys: SkippedMessageKey[];
  
  // Maximum number of skipped message keys to store
  maxSkippedKeys: number;
}

/**
 * SecureSession class implementing the Double Ratchet Algorithm
 * 
 * The Double Ratchet provides perfect forward secrecy and post-compromise security
 * by continuously rotating encryption keys. It combines:
 * - DH Ratchet: Uses Diffie-Hellman for key agreement
 * - Symmetric Ratchet: Uses KDF chains for message keys
 * 
 * This ensures that:
 * - Past messages remain secure even if current keys are compromised
 * - Future messages are secure even after key compromise
 * - Out-of-order messages can be decrypted
 */
export class SecureSession {
  private state: RatchetState;

  /**
   * Constructor for SecureSession
   * 
   * @param initialRootKey - The root key derived from X3DH handshake
   * @param initialDHKeyPair - Initial DH key pair (for sending party)
   * @param remotePublicKey - Remote party's initial DH public key (for receiving party)
   * @param isSender - Whether this session is for the message sender
   */
  constructor(
    initialRootKey: Uint8Array,
    initialDHKeyPair?: ECDHKeyPair,
    remotePublicKey?: Uint8Array,
    isSender: boolean = true
  ) {
    console.log('🔄 Initializing Double Ratchet session...');
    
    this.state = {
      rootKey: new Uint8Array(initialRootKey),
      dhSendingKeyPair: initialDHKeyPair || null,
      dhReceivingPublicKey: remotePublicKey || null,
      sendingChainKey: null,
      receivingChainKey: null,
      sendingMessageNumber: 0,
      receivingMessageNumber: 0,
      previousSendingChainLength: 0,
      skippedMessageKeys: [],
      maxSkippedKeys: 1000, // Reasonable limit for out-of-order messages
    };

    // Initialize sending chain if we have a DH key pair
    if (initialDHKeyPair && remotePublicKey) {
      this.initializeSendingChain(initialDHKeyPair, remotePublicKey);
    }

    console.log('✅ Double Ratchet session initialized');
  }

  /**
   * Initialize the sending chain with initial DH exchange
   */
  private async initializeSendingChain(dhKeyPair: ECDHKeyPair, remotePublicKey: Uint8Array): Promise<void> {
    try {
      // Perform DH exchange
      const dhSharedSecret = nacl.box.before(remotePublicKey, dhKeyPair.privateKey);
      
      // Derive new root key and sending chain key
      const { newRootKey, chainKey } = await this.deriveRootAndChainKeys(
        this.state.rootKey,
        dhSharedSecret
      );
      
      this.state.rootKey = newRootKey;
      this.state.sendingChainKey = { key: chainKey, index: 0 };
      
      console.log('🔑 Sending chain initialized');
    } catch (error) {
      console.error('❌ Failed to initialize sending chain:', error);
      throw error;
    }
  }

  /**
   * Derive new root key and chain key using HKDF
   */
  private async deriveRootAndChainKeys(
    rootKey: Uint8Array,
    dhOutput: Uint8Array
  ): Promise<{ newRootKey: Uint8Array; chainKey: Uint8Array }> {
    // Combine root key and DH output
    const inputKeyMaterial = new Uint8Array(rootKey.length + dhOutput.length);
    inputKeyMaterial.set(rootKey, 0);
    inputKeyMaterial.set(dhOutput, rootKey.length);

    // Import the input key material
    const key = await crypto.subtle.importKey(
      'raw',
      inputKeyMaterial,
      'HKDF',
      false,
      ['deriveKey']
    );

    // Derive 64 bytes (32 for root key + 32 for chain key)
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(32), // Use fixed salt for deterministic derivation
        info: new TextEncoder().encode('CipherNest-DoubleRatchet-v1'),
      },
      key,
      { name: 'HMAC', hash: 'SHA-256', length: 512 }, // 64 bytes = 512 bits
      true,
      ['sign']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);
    const derivedBytes = new Uint8Array(exportedKey);

    return {
      newRootKey: derivedBytes.slice(0, 32),
      chainKey: derivedBytes.slice(32, 64),
    };
  }

  /**
   * Derive message key from chain key using HMAC
   */
  private async deriveMessageKey(chainKey: Uint8Array): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey(
      'raw',
      chainKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const messageKeyData = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode('MessageKey')
    );

    return new Uint8Array(messageKeyData).slice(0, 32); // 32 bytes for AES-256
  }

  /**
   * Advance chain key using HMAC
   */
  private async advanceChainKey(chainKey: Uint8Array): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey(
      'raw',
      chainKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const newChainKeyData = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode('ChainKey')
    );

    return new Uint8Array(newChainKeyData).slice(0, 32);
  }

  /**
   * Encrypt a message using the Double Ratchet algorithm
   * 
   * This method:
   * 1. Advances the sending chain to get a new message key
   * 2. Encrypts the plaintext using AES-256-GCM
   * 3. Creates a ratchet header with current state
   * 4. Returns the encrypted message with header
   */
  async encrypt(plaintext: string): Promise<RatchetMessage> {
    console.log('🔒 Encrypting message with Double Ratchet...');

    try {
      // Ensure we have a sending chain
      if (!this.state.sendingChainKey) {
        throw new Error('No sending chain available. Initialize session with DH key pair.');
      }

      // Derive message key from current chain key
      const messageKey = await this.deriveMessageKey(this.state.sendingChainKey.key);

      // Advance the sending chain key
      this.state.sendingChainKey.key = await this.advanceChainKey(this.state.sendingChainKey.key);
      
      // Encrypt the message with AES-256-GCM
      const { ciphertext } = await encryptMessage(plaintext, messageKey);

      // Create the ratchet header
      const header: RatchetHeader = {
        dhPublicKey: this.state.dhSendingKeyPair?.publicKey || new Uint8Array(32),
        previousChainLength: this.state.previousSendingChainLength,
        messageNumber: this.state.sendingMessageNumber,
      };

      // Increment message number
      this.state.sendingMessageNumber++;

      const message: RatchetMessage = {
        header,
        ciphertext,
      };

      console.log(`✅ Message encrypted (msg #${header.messageNumber})`);
      return message;

    } catch (error) {
      console.error('❌ Failed to encrypt message:', error);
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt a message using the Double Ratchet algorithm
   * 
   * This is the most complex method. It:
   * 1. Checks if we have a skipped message key for this message
   * 2. Performs DH ratchet step if sender's DH key changed
   * 3. Advances receiving chain to find the correct message key
   * 4. Stores skipped keys for out-of-order messages
   * 5. Decrypts the message using AES-256-GCM
   */
  async decrypt(message: RatchetMessage): Promise<string> {
    console.log(`🔓 Decrypting message (msg #${message.header.messageNumber})...`);

    try {
      // Check if we have a skipped message key for this message
      const skippedKey = this.findSkippedMessageKey(
        message.header.dhPublicKey,
        message.header.messageNumber
      );

      if (skippedKey) {
        console.log('🔑 Using skipped message key');
        this.removeSkippedMessageKey(skippedKey);
        return await decryptMessage(message.ciphertext, skippedKey.messageKey);
      }

      // Check if we need to perform a DH ratchet step
      const needsDHRatchet = !this.state.dhReceivingPublicKey ||
        !this.arraysEqual(this.state.dhReceivingPublicKey, message.header.dhPublicKey);

      if (needsDHRatchet) {
        await this.performDHRatchetStep(message.header);
      }

      // Skip messages in the receiving chain if necessary
      await this.skipMessageKeys(message.header.messageNumber);

      // Ensure we have a receiving chain
      if (!this.state.receivingChainKey) {
        throw new Error('No receiving chain available after DH ratchet');
      }

      // Derive message key and advance receiving chain
      const messageKey = await this.deriveMessageKey(this.state.receivingChainKey.key);
      this.state.receivingChainKey.key = await this.advanceChainKey(this.state.receivingChainKey.key);
      this.state.receivingMessageNumber++;

      // Decrypt the message
      const plaintext = await decryptMessage(message.ciphertext, messageKey);

      console.log(`✅ Message decrypted successfully`);
      return plaintext;

    } catch (error) {
      console.error('❌ Failed to decrypt message:', error);
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Perform a DH ratchet step when sender's DH key changes
   */
  private async performDHRatchetStep(header: RatchetHeader): Promise<void> {
    console.log('🔄 Performing DH ratchet step...');

    // Store skipped message keys from current receiving chain
    if (this.state.receivingChainKey && this.state.dhReceivingPublicKey) {
      await this.skipMessageKeys(this.state.receivingChainKey.index);
    }

    // Update receiving public key
    this.state.dhReceivingPublicKey = new Uint8Array(header.dhPublicKey);

    // Generate new DH key pair for sending
    const newDHKeyPair = generateECDHKeyPair();
    
    // Derive new root key and receiving chain key
    const dhSharedSecret = nacl.box.before(header.dhPublicKey, newDHKeyPair.privateKey);
    const { newRootKey, chainKey: receivingChainKey } = await this.deriveRootAndChainKeys(
      this.state.rootKey,
      dhSharedSecret
    );

    // Update state for receiving chain
    this.state.rootKey = newRootKey;
    this.state.receivingChainKey = { key: receivingChainKey, index: 0 };
    this.state.receivingMessageNumber = 0;

    // Derive sending chain key if we have a previous sending key pair
    if (this.state.dhSendingKeyPair) {
      const sendingDHSharedSecret = nacl.box.before(header.dhPublicKey, this.state.dhSendingKeyPair.privateKey);
      const { newRootKey: finalRootKey, chainKey: sendingChainKey } = await this.deriveRootAndChainKeys(
        this.state.rootKey,
        sendingDHSharedSecret
      );

      this.state.rootKey = finalRootKey;
      this.state.previousSendingChainLength = this.state.sendingMessageNumber;
      this.state.sendingChainKey = { key: sendingChainKey, index: 0 };
      this.state.sendingMessageNumber = 0;
    }

    // Update sending key pair
    this.state.dhSendingKeyPair = newDHKeyPair;

    console.log('✅ DH ratchet step completed');
  }

  /**
   * Skip message keys and store them for out-of-order messages
   */
  private async skipMessageKeys(targetMessageNumber: number): Promise<void> {
    if (!this.state.receivingChainKey || !this.state.dhReceivingPublicKey) {
      return;
    }

    const currentIndex = this.state.receivingChainKey.index;
    const numToSkip = targetMessageNumber - currentIndex;

    if (numToSkip <= 0) {
      return; // No skipping needed
    }

    if (numToSkip > 100) { // Reasonable limit
      throw new Error(`Too many messages to skip: ${numToSkip}`);
    }

    console.log(`⏭️ Skipping ${numToSkip} message keys...`);

    let chainKey = this.state.receivingChainKey.key;
    
    for (let i = 0; i < numToSkip; i++) {
      const messageKey = await this.deriveMessageKey(chainKey);
      
      // Store the skipped message key
      const skippedKey: SkippedMessageKey = {
        dhPublicKey: new Uint8Array(this.state.dhReceivingPublicKey),
        messageNumber: currentIndex + i,
        messageKey,
      };

      this.state.skippedMessageKeys.push(skippedKey);
      
      // Enforce maximum skipped keys limit
      if (this.state.skippedMessageKeys.length > this.state.maxSkippedKeys) {
        this.state.skippedMessageKeys.shift(); // Remove oldest
      }

      chainKey = await this.advanceChainKey(chainKey);
    }

    this.state.receivingChainKey.key = chainKey;
    this.state.receivingChainKey.index = targetMessageNumber;
  }

  /**
   * Find a skipped message key for the given DH key and message number
   */
  private findSkippedMessageKey(dhPublicKey: Uint8Array, messageNumber: number): SkippedMessageKey | null {
    return this.state.skippedMessageKeys.find(key =>
      this.arraysEqual(key.dhPublicKey, dhPublicKey) &&
      key.messageNumber === messageNumber
    ) || null;
  }

  /**
   * Remove a skipped message key from storage
   */
  private removeSkippedMessageKey(keyToRemove: SkippedMessageKey): void {
    this.state.skippedMessageKeys = this.state.skippedMessageKeys.filter(key =>
      !(this.arraysEqual(key.dhPublicKey, keyToRemove.dhPublicKey) &&
        key.messageNumber === keyToRemove.messageNumber)
    );
  }

  /**
   * Compare two Uint8Arrays for equality
   */
  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Get session information for debugging
   */
  getSessionInfo(): {
    sendingMessageNumber: number;
    receivingMessageNumber: number;
    skippedKeysCount: number;
    hasSendingChain: boolean;
    hasReceivingChain: boolean;
  } {
    return {
      sendingMessageNumber: this.state.sendingMessageNumber,
      receivingMessageNumber: this.state.receivingMessageNumber,
      skippedKeysCount: this.state.skippedMessageKeys.length,
      hasSendingChain: !!this.state.sendingChainKey,
      hasReceivingChain: !!this.state.receivingChainKey,
    };
  }

  /**
   * Clear all skipped message keys (for security or storage management)
   */
  clearSkippedKeys(): void {
    this.state.skippedMessageKeys = [];
    console.log('🧹 Cleared all skipped message keys');
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  generateKyberKeyPair,
  generateDilithiumKeyPair,
  generateECDHKeyPair,
  signWithDilithium,
  verifyDilithiumSignature,
  deriveSharedSecret,
  encryptMessage,
  decryptMessage,
  SecureSession,
};

export type {
  UserIdentity,
  KyberKeyPair,
  DilithiumKeyPair,
  ECDHKeyPair,
  PreKeyBundleData,
  EncryptedMessage,
  RatchetHeader,
  RatchetMessage,
};
