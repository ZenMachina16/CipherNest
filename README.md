# CipherNest


A secure, decentralized messaging platform built on the Internet Computer Protocol, featuring end-to-end encryption, automatic message expiration, and blockchain-powered security.

## Core Features

### Security & Encryption
- End-to-end encryption using multiple algorithms (P-256, P-384, P-521)
- Military-grade AES encryption for messages
- Digital signatures for message authenticity
- Automatic key rotation and management
- Message integrity verification

### Privacy
- Auto-deletion with 24-hour TTL (Time To Live)
- Zero-knowledge message storage
- Decentralized architecture
- Principal-based authentication
- No message metadata storage

### User Experience
- Modern, intuitive interface
- Real-time message delivery
- Security status visualization
- Message verification indicators
- Encryption strength monitoring

## Technical Architecture

### Backend (Internet Computer)
- Written in Motoko
- Canister-based architecture
- Trie data structure for efficient message storage
- Automated garbage collection for expired messages
- Principal-based access control

### Frontend (React)
- Modern React with Hooks
- Chakra UI components
- Framer Motion animations
- Real-time updates
- Responsive design

### Encryption Implementation
```typescript
// Available Encryption Algorithms
ENCRYPTION_ALGORITHMS = {
  ECDH_P384: 'P-384',  // Default
  ECDH_P256: 'P-256',  // Faster
  ECDH_P521: 'P-521'   // Maximum security
}

// Symmetric Encryption Options
SYMMETRIC_ALGORITHMS = {
  AES_GCM: 'AES-GCM',  // Default
  AES_CBC: 'AES-CBC'   // Alternative
}
```

### Message Structure
```typescript
type Message = {
    from: Principal;
    encryptedContent: Blob;
    publicKey: Blob;
    timestamp: Int;
    expiresAt: Int;
}

## Installation & Setup

### Prerequisites
- Node.js ≥ 16.0.0
- npm ≥ 7.0.0
- DFINITY SDK (dfx)

### Local Development Setup
1. Clone the repository and install dependencies:
```bash
git clone https://github.com/ZenMachina16/CipherNest.git
cd CipherNest
npm install
```

2. Start the Internet Computer replica:
```bash
dfx start --background
```

3. Deploy the canisters:
```bash
dfx deploy
```

4. Start the frontend development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Canister Interface: http://localhost:4943?canisterId={asset_canister_id}

## Security Features

### End-to-End Encryption Process
1. **Key Exchange**
   - ECDH (Elliptic Curve Diffie-Hellman) for key exchange
   - Multiple curve options (P-256, P-384, P-521)
   - Automatic key rotation every 24 hours

2. **Message Encryption**
   - AES-GCM/CBC for symmetric encryption
   - Salt-based key derivation (PBKDF2)
   - 100,000 iterations for key strengthening

3. **Message Integrity**
   - ECDSA signatures for authenticity
   - SHA-384 for message hashing
   - Automatic signature verification

4. **Privacy Features**
   - 24-hour message TTL
   - Automatic cleanup of expired messages
   - No plaintext storage on chain

## User Interface

### Landing Page
- Modern SaaS design
- Security feature showcase
- Real-time encryption demos
- Interactive security explanations

### Chat Interface
- Clean, modern design
- Real-time message updates
- Security status indicators
- Encryption strength visualization
- Message expiration countdown

### Security Dashboard
- Encryption algorithm selection
- Key strength indicators
- Message integrity status
- TTL monitoring
- Security level overview

## Environment Configuration

### Development
```env
DFX_NETWORK=local
CANISTER_ID_CHAT_BACKEND={your_canister_id}
VITE_HOST=http://localhost:4943
```

### Production
```env
DFX_NETWORK=ic
CANISTER_ID_CHAT_BACKEND={production_canister_id}
VITE_HOST=https://ic0.app
```

## Technical Requirements
- Browser with Web Crypto API support
- Internet Computer connectivity
- Modern JavaScript runtime
- Secure random number generation support
