use candid::CandidType;
use candid::Principal;
use serde::{Deserialize, Serialize};

/// PreKeyBundle corresponds to the Candid `PreKeyBundle` record.
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct PreKeyBundle {
    /// User principal
    pub user: Principal,
    /// Post-quantum public key (e.g. Kyber) - raw bytes
    pub kyber_pub: Vec<u8>,
    /// ECC / ECDH public key bytes (for hybrid key exchange)
    pub ecdh_pub: Vec<u8>,
    /// Signature public key (e.g. Dilithium)
    pub dilithium_pub: Vec<u8>,
    /// Signature over the bundle (signed by the corresponding signing key)
    pub signature: Vec<u8>,
    /// Unix timestamp (seconds) when the bundle was created
    pub created_at: u64,
    /// Optional expiration timestamp
    pub expires_at: Option<u64>,
    /// Optional human-readable metadata (e.g. device label)
    pub note: Option<String>,
}

/// MessageEnvelope corresponds to the Candid `MessageEnvelope` record.
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct MessageEnvelope {
    /// Message identifier (opaque text)
    pub id: String,
    /// Sender principal
    pub sender: Principal,
    /// Recipient principal
    pub recipient: Principal,
    /// Encrypted payload (AES-256-GCM ciphertext + tag) as bytes
    pub ciphertext: Vec<u8>,
    /// Ephemeral public key used to derive shared secret (raw bytes)
    pub ephemeral_pub: Vec<u8>,
    /// Signature over the envelope (signed by sender signing key)
    pub signature: Vec<u8>,
    /// String identifier for the hybrid algorithm used (e.g. "Kyber+ECDH+A256GCM")
    pub algorithm: String,
    /// Unix timestamp when message was created
    pub created_at: u64,
    /// Optional TTL in seconds (ephemeral message lifetime)
    pub ttl_seconds: Option<u64>,
}
