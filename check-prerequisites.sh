#!/bin/bash

# CipherNest Prerequisites Checker
# This script verifies that all required software is installed

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
check_command() {
    local cmd=$1
    local name=$2
    local min_version=$3
    
    if command -v "$cmd" >/dev/null 2>&1; then
        local version=$($cmd --version 2>/dev/null | head -n1)
        echo -e "✅ ${GREEN}$name${NC} - $version"
        
        # Version check for Node.js
        if [ "$cmd" = "node" ]; then
            local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
            if [ "$node_version" -lt 18 ]; then
                echo -e "   ${YELLOW}⚠️  Warning: Node.js $node_version detected, but v18+ is recommended${NC}"
            fi
        fi
        
        return 0
    else
        echo -e "❌ ${RED}$name${NC} - Not installed"
        return 1
    fi
}

check_rust_target() {
    if rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
        echo -e "✅ ${GREEN}WebAssembly target${NC} - Installed"
        return 0
    else
        echo -e "❌ ${RED}WebAssembly target${NC} - Not installed"
        echo -e "   ${BLUE}Install with:${NC} rustup target add wasm32-unknown-unknown"
        return 1
    fi
}

echo "🔍 CipherNest Prerequisites Check"
echo "================================="
echo

# System info
echo "📋 System Information:"
echo "OS: $(uname -s)"
echo "Architecture: $(uname -m)"
echo "Kernel: $(uname -r)"
echo

echo "🛠️  Required Software:"

# Check all prerequisites
missing=0

check_command "node" "Node.js" "18" || ((missing++))
check_command "pnpm" "pnpm" "" || ((missing++))
check_command "rustc" "Rust" "" || ((missing++))
check_command "cargo" "Cargo" "" || ((missing++))
check_command "dfx" "DFX (Internet Computer SDK)" "" || ((missing++))
check_command "git" "Git" "" || ((missing++))

# Check Rust WebAssembly target if Rust is installed
if command -v rustc >/dev/null 2>&1; then
    check_rust_target || ((missing++))
fi

echo
echo "📊 Summary:"

if [ $missing -eq 0 ]; then
    echo -e "🎉 ${GREEN}All prerequisites are installed!${NC}"
    echo
    echo "🚀 You're ready to run CipherNest:"
    echo "   ./setup.sh"
    echo
    echo "Or manually:"
    echo "   1. dfx start --background"
    echo "   2. dfx deploy chat_backend"
    echo "   3. cd src/chat_frontend && pnpm install && pnpm dev"
    exit 0
else
    echo -e "⚠️  ${YELLOW}$missing prerequisite(s) missing${NC}"
    echo
    echo "📥 Installation Guide:"
    echo
    
    if ! command -v node >/dev/null 2>&1; then
        echo "🟡 Node.js (v18+):"
        echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "   sudo apt-get install -y nodejs"
        echo
    fi
    
    if ! command -v pnpm >/dev/null 2>&1; then
        echo "🟡 pnpm:"
        echo "   curl -fsSL https://get.pnpm.io/install.sh | sh -"
        echo "   source ~/.bashrc"
        echo
    fi
    
    if ! command -v rustc >/dev/null 2>&1; then
        echo "🟡 Rust:"
        echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
        echo "   source ~/.cargo/env"
        echo "   rustup target add wasm32-unknown-unknown"
        echo
    fi
    
    if ! command -v dfx >/dev/null 2>&1; then
        echo "🟡 DFX (Internet Computer SDK):"
        echo "   sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
        echo "   echo 'export PATH=\"\$HOME/bin:\$PATH\"' >> ~/.bashrc"
        echo "   source ~/.bashrc"
        echo
    fi
    
    if ! command -v git >/dev/null 2>&1; then
        echo "🟡 Git:"
        echo "   sudo apt update && sudo apt install -y git"
        echo
    fi
    
    echo "📖 For detailed installation instructions, see README.md"
    exit 1
fi
