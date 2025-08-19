# CipherNest - Post-Quantum Secure Messaging

A decentralized, post-quantum secure messaging application built on the Internet Computer (ICP) with ephemeral messaging and end-to-end encryption.

## 🔐 Features

- **Post-Quantum Cryptography**: Hybrid PQC/ECC using CRYSTALS-Kyber and ECDH
- **Perfect Forward Secrecy**: Double Ratchet Algorithm for session management
- **Ephemeral Messaging**: Messages auto-delete after 24 hours
- **Zero-Knowledge Architecture**: Canister cannot decrypt message contents
- **Modern UI**: Built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn/UI

## 📋 Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+, Debian 11+, or similar)
- **Memory**: At least 4GB RAM
- **Storage**: 2GB free disk space
- **Network**: Stable internet connection

### Required Software

1. **Node.js** (v18.0.0 or higher)
2. **npm** or **pnpm** (recommended)
3. **Rust** (latest stable version)
4. **DFX** (Internet Computer SDK)
5. **Git**

## 🚀 Quick Start Options

### Option 1: Automated Setup (Recommended)

```bash
# Clone and setup in one go
git clone <your-repository-url>
cd CipherNest
chmod +x setup.sh check-prerequisites.sh
./setup.sh
```

### Option 2: Check Prerequisites First

```bash
# Verify your system has everything needed
./check-prerequisites.sh

# If all good, run setup
./setup.sh
```

### Option 3: Using npm/pnpm Scripts

```bash
# After cloning the repository
pnpm setup        # Full automated setup
pnpm setup:clean  # Clean setup (resets everything)
pnpm dev:backend  # Start backend only
pnpm dev:frontend # Start frontend only
```

## 📋 Manual Installation Guide

### Step 1: Install System Dependencies

```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install essential build tools
sudo apt install -y curl wget git build-essential pkg-config libssl-dev
```

### Step 2: Install Node.js and pnpm

```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm (recommended package manager)
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Verify installations
node --version  # Should be v18.0.0 or higher
pnpm --version  # Should show pnpm version
```

### Step 3: Install Rust

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env

# Add WebAssembly target for IC canisters
rustup target add wasm32-unknown-unknown

# Verify Rust installation
rustc --version
cargo --version
```

### Step 4: Install DFX (Internet Computer SDK)

```bash
# Install DFX
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Add DFX to PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify DFX installation
dfx --version  # Should show DFX version
```

### Step 5: Clone and Setup Project

```bash
# Clone the repository
git clone <your-repository-url>
cd CipherNest

# Install frontend dependencies
cd src/chat_frontend
pnpm install

# Return to project root
cd ../..
```

## 🏃‍♂️ Running the Project

### Automated Method (Recommended)

```bash
# One command to rule them all
./setup.sh
```

### Using Package Scripts

```bash
pnpm setup        # Complete setup
pnpm dev         # Start frontend (after backend is deployed)
pnpm logs        # View backend logs
pnpm status      # Check canister status
pnpm stop        # Stop all services
pnpm clean       # Clean everything and start fresh
```

The application will be available at: **http://localhost:3000**

### Manual Step-by-Step Setup

#### Step 1: Start Internet Computer Local Replica

```bash
# Start DFX in the background
dfx start --background

# Verify the replica is running
dfx ping
```

#### Step 2: Deploy Backend Canister

```bash
# Deploy the chat backend canister
dfx deploy chat_backend

# Check deployment status
dfx canister status chat_backend
```

#### Step 3: Configure Frontend Environment

```bash
# Navigate to frontend directory
cd src/chat_frontend

# Get the backend canister ID
BACKEND_CANISTER_ID=$(dfx canister id chat_backend)

# Create environment configuration
cat > .env.local << EOF
# CipherNest Frontend Environment Variables
NEXT_PUBLIC_CHAT_BACKEND_CANISTER_ID=$BACKEND_CANISTER_ID
NODE_ENV=development
NEXT_PUBLIC_IC_HOST=http://localhost:4943
EOF

# Verify environment file
cat .env.local
```

#### Step 4: Install Frontend Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list --depth=0
```

#### Step 5: Start Frontend Development Server

```bash
# Start the development server
pnpm dev

# The application will be available at http://localhost:3000
```

## 🔧 Development Workflow

### Backend Development

```bash
# Build backend canister
dfx build chat_backend

# Deploy backend changes
dfx deploy chat_backend

# View backend logs
dfx canister logs chat_backend

# Run backend tests
cd src/chat_backend
cargo test
```

### Frontend Development

```bash
# Navigate to frontend directory
cd src/chat_frontend

# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

### Useful DFX Commands

```bash
# View all deployed canisters
dfx canister status --all

# Stop local replica
dfx stop

# Reset local state (WARNING: This deletes all data)
dfx start --clean

# Generate Candid interface
dfx generate chat_backend

# Call canister methods directly
dfx canister call chat_backend get_key_bundle '(principal "rdmx6-jaaaa-aaaaa-aaadq-cai")'
```

## 🧪 Testing the Application

### 1. Basic Functionality Test

1. **Open the application**: Navigate to http://localhost:3000
2. **Generate Identity**: The app should automatically generate cryptographic keys
3. **Navigate to Chat**: Click "Open Chats" and start a new conversation
4. **Test Messaging**: Send messages to see encryption/decryption in action

### 2. Multi-User Testing

```bash
# Open multiple browser windows/tabs
# Each tab will generate its own identity
# Test messaging between different identities
```

### 3. Backend Testing

```bash
# Test canister directly
dfx canister call chat_backend register '(record {
  user = principal "rdmx6-jaaaa-aaaaa-aaadq-cai";
  kyber_pub = vec {1;2;3};
  ecdh_pub = vec {4;5;6};
  dilithium_pub = vec {7;8;9};
  signature = vec {10;11;12};
  created_at = 1640995200;
  expires_at = null;
  note = null;
})'
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. DFX Start Fails

```bash
# Kill any existing DFX processes
pkill dfx
pkill replica

# Clean and restart
dfx start --clean
```

#### 2. Canister Deployment Fails

```bash
# Check if replica is running
dfx ping

# Rebuild and redeploy
dfx build --check
dfx deploy chat_backend --mode reinstall
```

#### 3. Frontend Connection Issues

```bash
# Verify canister ID is correct
dfx canister id chat_backend

# Check environment file
cat src/chat_frontend/.env.local

# Restart frontend server
cd src/chat_frontend
pnpm dev
```

#### 4. Port Already in Use

```bash
# Find and kill process using port 4943 (DFX)
sudo lsof -ti:4943 | xargs kill -9

# Find and kill process using port 3000 (Next.js)
sudo lsof -ti:3000 | xargs kill -9
```

#### 5. Permission Issues

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.pnpm

# Fix DFX permissions
sudo chown -R $(whoami) ~/.cache/dfinity
```

### Debug Mode

```bash
# Start DFX with verbose logging
dfx start --verbose

# Enable frontend debug logging
cd src/chat_frontend
NEXT_PUBLIC_DEBUG=true pnpm dev
```

## 📁 Project Structure

```
CipherNest/
├── src/
│   ├── chat_backend/          # Rust canister backend
│   │   ├── src/
│   │   │   ├── lib.rs         # Main canister logic
│   │   │   ├── state.rs       # State management
│   │   │   └── types.rs       # Type definitions
│   │   ├── Cargo.toml         # Rust dependencies
│   │   └── chat_backend.did   # Candid interface
│   │
│   ├── chat_frontend/         # Next.js frontend
│   │   ├── app/               # Next.js 14 app router
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities and stores
│   │   │   ├── actor.ts       # IC actor integration
│   │   │   ├── crypto.ts      # Cryptography implementation
│   │   │   ├── store.ts       # Zustand state management
│   │   │   └── config.ts      # Configuration
│   │   ├── package.json       # Node.js dependencies
│   │   └── .env.local         # Environment variables
│   │
│   └── crypto/                # Shared crypto primitives
│
├── dfx.json                   # DFX configuration
├── Cargo.toml                 # Workspace configuration
└── README.md                  # This file
```

## 🔒 Security Notes

### Development Environment

- **Local Only**: The development setup runs locally and is not exposed to the internet
- **Test Data**: Use only test data during development
- **Key Management**: Private keys are stored in browser localStorage (development only)

### Production Considerations

- **Real PQC Libraries**: Replace simulated crypto with actual CRYSTALS implementations
- **Secure Storage**: Implement proper key storage mechanisms
- **Authentication**: Add Internet Identity integration
- **Network Security**: Use HTTPS and proper certificate validation

## 📚 Additional Resources

### Documentation

- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [DFX Command Reference](https://internetcomputer.org/docs/current/references/dfx-reference/)
- [Candid Guide](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)

### Cryptography References

- [CRYSTALS-Kyber](https://pq-crystals.org/kyber/)
- [CRYSTALS-Dilithium](https://pq-crystals.org/dilithium/)
- [Double Ratchet Algorithm](https://signal.org/docs/specifications/doubleratchet/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are properly installed
4. Try the clean restart procedure

For additional help, please open an issue in the repository with:
- Your operating system and version
- Node.js and DFX versions
- Complete error messages
- Steps to reproduce the issue

---

**Happy coding with post-quantum secure messaging! 🚀🔐**