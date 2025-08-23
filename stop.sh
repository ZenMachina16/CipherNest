#!/bin/bash

# CipherNest Stop Script
# This script stops all running services

echo "🛑 Stopping CipherNest services..."

# Stop dfx
echo "Stopping dfx replica..."
dfx stop

# Kill any running frontend processes
echo "Stopping frontend development server..."
pkill -f "vite.*src/chat_frontend" 2>/dev/null || true

echo "✅ All services stopped successfully!"
