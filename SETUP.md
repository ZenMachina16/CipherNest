# CipherNest Setup Guide

This guide will help you set up and run the CipherNest project locally.

## Prerequisites

Before running the setup script, make sure you have the following installed:

- **Node.js** (version 16.0.0 or higher)
- **npm** (version 7.0.0 or higher)
- **DFINITY SDK (dfx)** - Install from [https://internetcomputer.org/docs/current/developer-docs/setup/install/](https://internetcomputer.org/docs/current/developer-docs/setup/install/)

## Quick Start

### Option 1: Using the Setup Script (Recommended)

1. **Run the automated setup script:**
   ```bash
   ./setup.sh
   ```
   
   Or using npm:
   ```bash
   npm run setup
   ```

2. **The script will automatically:**
   - Check prerequisites
   - Install all dependencies
   - Start the dfx replica
   - Deploy canisters
   - Configure environment variables
   - Start the frontend development server

3. **Access the application:**
   - Frontend: http://localhost:3000
   - DFX Replica: http://localhost:4943

### Option 2: Manual Setup

If you prefer to set up manually:

1. **Install dependencies:**
   ```bash
   npm install
   cd src/chat_frontend && npm install && cd ../..
   ```

2. **Start dfx replica:**
   ```bash
   dfx start --background --clean
   ```

3. **Deploy canisters:**
   ```bash
   dfx deploy
   ```

4. **Start frontend:**
   ```bash
   cd src/chat_frontend
   npm run dev
   ```

## Stopping Services

### Using the Stop Script:
```bash
./stop.sh
```

### Using npm:
```bash
npm run stop
```

### Manual Stop:
```bash
dfx stop
# Then manually kill any running frontend processes
```

## Troubleshooting

### Common Issues:

1. **Port 3000 already in use:**
   - The setup script will automatically handle this
   - Or manually kill processes using port 3000: `lsof -ti:3000 | xargs kill -9`

2. **dfx not found:**
   - Install DFINITY SDK: https://internetcomputer.org/docs/current/developer-docs/setup/install/

3. **Node.js version too old:**
   - Update Node.js to version 16.0.0 or higher

4. **404 errors on frontend:**
   - Make sure the dfx replica is running: `dfx ping`
   - Check that canisters are deployed: `dfx canister status chat_backend`

### Useful Commands:

- **Check dfx status:** `dfx ping`
- **View canister logs:** `dfx canister call chat_backend getMessages`
- **Redeploy canisters:** `dfx deploy`
- **View canister IDs:** `dfx canister id chat_backend`

## Project Structure

```
CipherNest/
├── setup.sh              # Automated setup script
├── stop.sh               # Stop all services
├── dfx.json              # DFX configuration
├── package.json          # Root package.json
├── src/
│   ├── chat_frontend/    # React frontend
│   │   ├── src/          # React source code
│   │   ├── package.json  # Frontend dependencies
│   │   └── vite.config.js # Vite configuration
│   └── New_LPF_backend/  # Motoko backend
│       └── main.mo       # Backend canister code
```

## Development

- **Frontend Development:** The frontend runs on Vite dev server at http://localhost:3000
- **Backend Development:** The Motoko backend runs on the Internet Computer replica
- **Hot Reload:** Both frontend and backend support hot reloading during development

## Environment Variables

The setup script automatically generates the following environment variables:
- `VITE_CHAT_BACKEND_CANISTER_ID`: The deployed chat backend canister ID
- `VITE_DFX_NETWORK`: Set to 'local' for local development
