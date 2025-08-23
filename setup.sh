#!/bin/bash

# CipherNest Setup Script
# This script automates the complete setup and startup process for the CipherNest project

set -e  # Exit on any error

echo "🚀 Starting CipherNest Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js >= 16.0.0"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check dfx
    if ! command -v dfx &> /dev/null; then
        print_error "DFINITY SDK (dfx) is not installed. Please install it from https://internetcomputer.org/docs/current/developer-docs/setup/install/"
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    npm install
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd src/chat_frontend
    npm install
    cd ../..
    
    print_success "Dependencies installed successfully"
}

# Stop any existing dfx processes
stop_existing_dfx() {
    print_status "Stopping any existing dfx processes..."
    dfx stop 2>/dev/null || true
    print_success "Existing dfx processes stopped"
}

# Start dfx replica
start_dfx_replica() {
    print_status "Starting dfx replica in background..."
    dfx start --background --clean
    print_success "dfx replica started successfully"
    
    # Wait for dfx to be ready
    print_status "Waiting for dfx to be ready..."
    sleep 10
    
    # Check if dfx is running
    if ! dfx ping 2>/dev/null; then
        print_error "Failed to start dfx replica"
        exit 1
    fi
    print_success "dfx replica is ready"
}

# Deploy canisters
deploy_canisters() {
    print_status "Deploying canisters..."
    dfx deploy
    print_success "Canisters deployed successfully"
}

# Generate frontend environment
generate_frontend_env() {
    print_status "Generating frontend environment variables..."
    
    # Get canister IDs
    CHAT_BACKEND_ID=$(dfx canister id chat_backend)
    
    # Create .env file for frontend
    cat > src/chat_frontend/.env << EOF
VITE_CHAT_BACKEND_CANISTER_ID=$CHAT_BACKEND_ID
VITE_DFX_NETWORK=local
EOF
    
    print_success "Frontend environment variables generated"
}

# Update Vite configuration for proper port handling
update_vite_config() {
    print_status "Updating Vite configuration..."
    
    # Get the actual dfx port
    DFX_PORT=$(dfx info webserver-port 2>/dev/null || echo "4943")
    
    cat > src/chat_frontend/vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': process.env,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
});
EOF
    
    print_success "Vite configuration updated"
}

# Start frontend development server
start_frontend() {
    print_status "Starting frontend development server..."
    
    # Change to frontend directory and start dev server
    cd src/chat_frontend
    
    # Start the dev server in background
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a moment for the server to start
    sleep 5
    
    # Check if the server is running
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend development server started successfully on http://localhost:3000"
    else
        print_warning "Frontend server might still be starting up. Please check http://localhost:3000"
    fi
    
    cd ../..
}

# Display final information
show_final_info() {
    echo ""
    echo "🎉 CipherNest Setup Complete!"
    echo ""
    echo "📋 Service Information:"
    echo "   • DFX Replica: http://localhost:4943"
    echo "   • Frontend Dev Server: http://localhost:3000"
    echo "   • Chat Backend Canister: $(dfx canister id chat_backend)"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   • Stop all services: dfx stop"
    echo "   • View canister logs: dfx canister call chat_backend getMessages"
    echo "   • Redeploy canisters: dfx deploy"
    echo ""
    echo "🌐 Open your browser and navigate to: http://localhost:3000"
    echo ""
}

# Main execution
main() {
    echo "=========================================="
    echo "    CipherNest Project Setup Script"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    stop_existing_dfx
    start_dfx_replica
    deploy_canisters
    generate_frontend_env
    update_vite_config
    start_frontend
    show_final_info
    
    echo "✅ Setup completed successfully!"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Keep the script running and handle cleanup
    trap 'echo ""; print_status "Stopping services..."; dfx stop; kill $FRONTEND_PID 2>/dev/null || true; print_success "All services stopped"; exit 0' INT
    wait
}

# Run the main function
main "$@"
