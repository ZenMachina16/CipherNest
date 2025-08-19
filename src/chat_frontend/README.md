# CipherNest Frontend

Post-quantum secure messaging application frontend built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn/UI.

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in this directory with the following variables:

```bash
# Chat Backend Canister ID (required)
NEXT_PUBLIC_CHAT_BACKEND_CANISTER_ID=your-canister-id-here

# Development/Production environment
NODE_ENV=development

# Optional: Custom IC host (defaults to localhost:4943 for development)
# NEXT_PUBLIC_IC_HOST=http://localhost:4943
```

### Getting Your Canister ID

1. Deploy your backend canister first:
   ```bash
   cd ../../
   dfx deploy chat_backend
   ```

2. Get the canister ID:
   ```bash
   dfx canister id chat_backend
   ```

3. Copy the canister ID to your `.env.local` file.

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- **Post-quantum secure messaging** with hybrid PQC/ECC encryption
- **Ephemeral messaging** - messages auto-delete after 24 hours
- **Zero-knowledge architecture** - the canister cannot decrypt messages
- **Modern UI** with Tailwind CSS and Shadcn/UI components
- **TypeScript** for type safety
- **Internet Computer integration** via @dfinity/agent

## Architecture

- `lib/actor.ts` - Internet Computer canister actor and API client
- `lib/config.ts` - Configuration management
- `lib/utils.ts` - Utility functions
- `components/ui/` - Reusable UI components
- `app/` - Next.js 14 app router pages

## API Usage

```typescript
import chatBackend from '@/lib/actor';

// Register public keys
await chatBackend.register({
  kyber_pub: new Uint8Array([...]),
  ecdh_pub: new Uint8Array([...]),
  dilithium_pub: new Uint8Array([...]),
  signature: new Uint8Array([...]),
  created_at: BigInt(Date.now() / 1000),
  expires_at: [],
  note: [],
});

// Send a message
await chatBackend.sendMessage({
  id: 'unique-message-id',
  sender: Principal.fromText('...'),
  recipient: Principal.fromText('...'),
  ciphertext: new Uint8Array([...]),
  ephemeral_pub: new Uint8Array([...]),
  signature: new Uint8Array([...]),
  algorithm: 'Kyber+ECDH+A256GCM',
  created_at: BigInt(Date.now() / 1000),
  ttl_seconds: [BigInt(24 * 60 * 60)],
});

// Receive messages
const messages = await chatBackend.receiveMessages();
```

## Building for Production

```bash
npm run build
npm start
```

For production deployment, set `NODE_ENV=production` and update the canister ID to your mainnet canister ID.
