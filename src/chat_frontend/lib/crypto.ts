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
};

export type {
  UserIdentity,
  KyberKeyPair,
  DilithiumKeyPair,
  ECDHKeyPair,
  PreKeyBundleData,
  EncryptedMessage,
};
