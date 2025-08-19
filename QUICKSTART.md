# 🚀 CipherNest Quick Start Guide

Get CipherNest running in under 5 minutes!

## ⚡ Super Quick Setup (Automated)

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd CipherNest

# 2. Make setup script executable
chmod +x setup.sh

# 3. Run the automated setup
./setup.sh
```

The script will:
- ✅ Check all prerequisites
- ✅ Start the Internet Computer replica
- ✅ Deploy the backend canister
- ✅ Install frontend dependencies
- ✅ Configure environment variables
- ✅ Start the development server

**That's it! Your app will be running at http://localhost:3000**

## 🔧 Manual Setup (Step by Step)

If you prefer to run commands manually:

### 1. Prerequisites Check

```bash
# Verify you have all required tools
node --version    # Should be v18+
pnpm --version    # Should show pnpm version
rustc --version   # Should show rust version
dfx --version     # Should show dfx version
```

### 2. Start Backend

```bash
# Start Internet Computer replica
dfx start --background

# Deploy the backend canister
dfx deploy chat_backend

# Get the canister ID
dfx canister id chat_backend
```

### 3. Setup Frontend

```bash
# Navigate to frontend
cd src/chat_frontend

# Install dependencies
pnpm install

# Configure environment (replace YOUR_CANISTER_ID)
echo "NEXT_PUBLIC_CHAT_BACKEND_CANISTER_ID=YOUR_CANISTER_ID" > .env.local
echo "NODE_ENV=development" >> .env.local

# Start development server
pnpm dev
```

## 🎯 Testing Your Setup

1. **Open Browser**: Navigate to http://localhost:3000
2. **Check Console**: Open browser dev tools to see crypto operations
3. **Generate Identity**: App should automatically create keys
4. **Start Chat**: Click "Open Chats" → Enter any principal ID
5. **Send Message**: Type and send a test message
6. **Verify Encryption**: Check console logs for encryption/decryption

## 🐛 Quick Troubleshooting

### Port Issues
```bash
# Kill processes on ports 3000 and 4943
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:4943 | xargs kill -9
```

### DFX Issues
```bash
# Reset DFX completely
dfx stop
dfx start --clean
```

### Frontend Issues
```bash
# Clear node modules and reinstall
cd src/chat_frontend
rm -rf node_modules .next
pnpm install
```

## 📱 What You'll See

### 1. Home Page
- Welcome screen with crypto demos
- Button to open chats
- Security feature badges

### 2. Chat List
- List of active conversations
- Option to start new chats
- Search functionality

### 3. Chat Interface
- Real-time encrypted messaging
- Connection status indicators
- Message encryption/decryption logs

### 4. Developer Console
- Detailed crypto operation logs
- Session initialization progress
- Error messages and debugging info

## 🔐 Security Features to Test

1. **Key Generation**: Watch keys being generated in console
2. **Registration**: See keys being registered with canister
3. **Encryption**: Each message gets encrypted with new keys
4. **Perfect Forward Secrecy**: Old messages stay secure
5. **Out-of-Order**: Messages can arrive in any order

## 📊 Performance Notes

- **First Load**: Takes 5-10 seconds to generate crypto keys
- **Message Sending**: ~500ms for encryption + network
- **Message Polling**: Every 3 seconds for new messages
- **Memory Usage**: ~50-100MB for crypto operations

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ "Secure Session Active" in chat header
- ✅ Green lock icons on messages
- ✅ Console logs showing encryption/decryption
- ✅ Messages sending and receiving successfully

## 🆘 Need Help?

If something isn't working:

1. **Check Prerequisites**: Ensure Node.js 18+, Rust, and DFX are installed
2. **Read Error Messages**: Console errors usually point to the issue
3. **Try Clean Setup**: Use `./setup.sh --clean` to reset everything
4. **Check README**: Full troubleshooting guide in README.md

## 🚀 Next Steps

Once you have it running:
- Explore the crypto demos on the home page
- Test messaging between multiple browser tabs
- Check out the Zustand store in browser dev tools
- Review the code to understand the architecture

**Happy secure messaging! 🔐**
