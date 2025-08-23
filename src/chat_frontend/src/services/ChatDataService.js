// Simulated chat data for multi-user environment
const chatData = {
  // Conversations between different users
  conversations: {
    'alice-bob': [
      {
        id: 1,
        content: "Hey Bob! How's the new encryption implementation going?",
        from: 'uxrrr-q7777-77774-qaaaq-cai', // Alice
        timestamp: Date.now() * 1000000 - 7200000000, // 2 hours ago
        verified: true,
        timeLeft: 79200,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P384",
          signatureType: "ECDSA-P384"
        }
      },
      {
        id: 2,
        content: "Great! The P-384 implementation is working perfectly. Much better performance than P-521.",
        from: 'u6s2n-gx777-77774-qaaba-cai', // Bob
        timestamp: Date.now() * 1000000 - 5400000000, // 1.5 hours ago
        verified: true,
        timeLeft: 81000,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P384",
          signatureType: "ECDSA-P384"
        }
      },
      {
        id: 3,
        content: "Perfect! Let's test the message expiration feature. This should auto-delete in 24 hours.",
        from: 'uxrrr-q7777-77774-qaaaq-cai', // Alice
        timestamp: Date.now() * 1000000 - 1800000000, // 30 minutes ago
        verified: true,
        timeLeft: 84600,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P384",
          signatureType: "ECDSA-P384"
        }
      }
    ],
    'alice-carol': [
      {
        id: 1,
        content: "Carol, I need your input on the security audit findings.",
        from: 'uxrrr-q7777-77774-qaaaq-cai', // Alice
        timestamp: Date.now() * 1000000 - 8640000000, // 2.4 hours ago
        verified: true,
        timeLeft: 77760,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P521",
          signatureType: "ECDSA-P521"
        }
      },
      {
        id: 2,
        content: "I'm currently offline, but I'll review the findings when I'm back. The encryption looks solid.",
        from: 'uqqxf-5h777-77774-qaaaa-cai', // Carol
        timestamp: Date.now() * 1000000 - 7200000000, // 2 hours ago
        verified: true,
        timeLeft: 79200,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P521",
          signatureType: "ECDSA-P521"
        }
      }
    ],
    'bob-david': [
      {
        id: 1,
        content: "David, can you help me understand the blockchain integration?",
        from: 'u6s2n-gx777-77774-qaaba-cai', // Bob
        timestamp: Date.now() * 1000000 - 3600000000, // 1 hour ago
        verified: true,
        timeLeft: 82800,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P256",
          signatureType: "ECDSA-P256"
        }
      },
      {
        id: 2,
        content: "Sure! The Internet Computer integration is fascinating. Each message is stored on-chain with zero-knowledge proofs.",
        from: 'uzt4z-lp777-77774-qaabq-cai', // David
        timestamp: Date.now() * 1000000 - 1800000000, // 30 minutes ago
        verified: true,
        timeLeft: 84600,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P256",
          signatureType: "ECDSA-P256"
        }
      },
      {
        id: 3,
        content: "That's incredible! So the messages are truly decentralized and secure.",
        from: 'u6s2n-gx777-77774-qaaba-cai', // Bob
        timestamp: Date.now() * 1000000 - 900000000, // 15 minutes ago
        verified: true,
        timeLeft: 85500,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P256",
          signatureType: "ECDSA-P256"
        }
      }
    ],
    'alice-david': [
      {
        id: 1,
        content: "Welcome to CipherNest, David! Your Principal ID has been registered.",
        from: 'uxrrr-q7777-77774-qaaaq-cai', // Alice
        timestamp: Date.now() * 1000000 - 10800000000, // 3 hours ago
        verified: true,
        timeLeft: 75600,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P384",
          signatureType: "ECDSA-P384"
        }
      },
      {
        id: 2,
        content: "Thanks Alice! This is my first time using end-to-end encrypted messaging. It's amazing!",
        from: 'uzt4z-lp777-77774-qaabq-cai', // David
        timestamp: Date.now() * 1000000 - 9000000000, // 2.5 hours ago
        verified: true,
        timeLeft: 77400,
        securityInfo: {
          algorithm: "AES-256-GCM",
          keyExchange: "ECDH-P384",
          signatureType: "ECDSA-P384"
        }
      }
    ]
  },

  // User profiles
  users: {
    'uxrrr-q7777-77774-qaaaq-cai': {
      name: 'Alice Johnson',
      role: 'Security Analyst',
      avatar: '👩‍💻',
      status: 'online'
    },
    'u6s2n-gx777-77774-qaaba-cai': {
      name: 'Bob Smith',
      role: 'Developer',
      avatar: '👨‍💼',
      status: 'online'
    },
    'uqqxf-5h777-77774-qaaaa-cai': {
      name: 'Carol Davis',
      role: 'Researcher',
      avatar: '👩‍🔬',
      status: 'offline'
    },
    'uzt4z-lp777-77774-qaabq-cai': {
      name: 'David Wilson',
      role: 'Student',
      avatar: '👨‍🎓',
      status: 'online'
    }
  }
};

// Helper function to get conversation key between two users
const getConversationKey = (user1Id, user2Id) => {
  const sortedIds = [user1Id, user2Id].sort();
  return `${sortedIds[0]}-${sortedIds[1]}`.replace(/[^a-zA-Z0-9-]/g, '');
};

// Service methods
export const ChatDataService = {
  // Get chat history between two users
  getChatHistory: (user1Id, user2Id) => {
    const conversationKey = getConversationKey(user1Id, user2Id);
    
    // First try to get from localStorage
    const storageKey = `chat_conversation_${conversationKey}`;
    const storedHistory = localStorage.getItem(storageKey);
    
    if (storedHistory) {
      return JSON.parse(storedHistory);
    }
    
    // If not in localStorage, get from default data
    const defaultHistory = chatData.conversations[conversationKey] || [];
    
    // Store default history in localStorage
    if (defaultHistory.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(defaultHistory));
    }
    
    return defaultHistory;
  },

  // Add a new message to conversation
  addMessage: (user1Id, user2Id, message) => {
    const conversationKey = getConversationKey(user1Id, user2Id);
    if (!chatData.conversations[conversationKey]) {
      chatData.conversations[conversationKey] = [];
    }
    
    const newMessage = {
      id: Date.now(),
      content: message.content,
      from: message.from,
      timestamp: message.timestamp,
      verified: message.verified,
      timeLeft: message.timeLeft,
      securityInfo: message.securityInfo
    };
    
    chatData.conversations[conversationKey].push(newMessage);
    
    // Store in localStorage for persistence
    const storageKey = `chat_conversation_${conversationKey}`;
    localStorage.setItem(storageKey, JSON.stringify(chatData.conversations[conversationKey]));
    
    return newMessage;
  },

  // Get user profile
  getUserProfile: (principalId) => {
    return chatData.users[principalId] || null;
  },

  // Get all users
  getAllUsers: () => {
    return Object.entries(chatData.users).map(([principalId, profile]) => ({
      principalId,
      ...profile
    }));
  },

  // Get user-specific contacts (excluding current user)
  getUserContacts: (currentUserId) => {
    const allUsers = ChatDataService.getAllUsers();
    return allUsers.filter(user => user.principalId !== currentUserId);
  },

  // Add a contact for a specific user
  addUserContact: (currentUserId, contactData) => {
    const userContactsKey = `user_contacts_${currentUserId}`;
    const existingContacts = JSON.parse(localStorage.getItem(userContactsKey) || '[]');
    
    const newContact = {
      id: contactData.principalId,
      principalId: contactData.principalId,
      name: contactData.name,
      status: contactData.status || 'online',
      lastSeen: Date.now(),
      role: contactData.role,
      avatar: contactData.avatar
    };
    
    // Check if contact already exists
    const existingIndex = existingContacts.findIndex(c => c.principalId === contactData.principalId);
    if (existingIndex === -1) {
      existingContacts.push(newContact);
      localStorage.setItem(userContactsKey, JSON.stringify(existingContacts));
    }
    
    return newContact;
  },

  // Get contacts for a specific user
  getUserContactsList: (currentUserId) => {
    const userContactsKey = `user_contacts_${currentUserId}`;
    const storedContacts = localStorage.getItem(userContactsKey);
    
    if (storedContacts) {
      return JSON.parse(storedContacts);
    }
    
    // If no stored contacts, return default contacts (excluding current user)
    const defaultContacts = ChatDataService.getUserContacts(currentUserId);
    localStorage.setItem(userContactsKey, JSON.stringify(defaultContacts));
    return defaultContacts;
  },

  // Remove a contact for a specific user
  removeUserContact: (currentUserId, contactPrincipalId) => {
    const userContactsKey = `user_contacts_${currentUserId}`;
    const existingContacts = JSON.parse(localStorage.getItem(userContactsKey) || '[]');
    
    const filteredContacts = existingContacts.filter(c => c.principalId !== contactPrincipalId);
    localStorage.setItem(userContactsKey, JSON.stringify(filteredContacts));
    
    return filteredContacts;
  },

  // Get recent conversations for a user
  getRecentConversations: (userId) => {
    const conversations = [];
    Object.keys(chatData.conversations).forEach(key => {
      if (key.includes(userId)) {
        const messages = chatData.conversations[key];
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          const otherUserId = lastMessage.from === userId 
            ? messages.find(m => m.from !== userId)?.from 
            : lastMessage.from;
          
          if (otherUserId) {
            conversations.push({
              conversationKey: key,
              otherUserId,
              lastMessage,
              messageCount: messages.length
            });
          }
        }
      }
    });
    return conversations.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  },

  // Simulate real-time message updates
  simulateMessageUpdate: (callback) => {
    // Simulate occasional message updates
    setInterval(() => {
      const conversations = Object.keys(chatData.conversations);
      if (conversations.length > 0) {
        const randomConversation = conversations[Math.floor(Math.random() * conversations.length)];
        const messages = chatData.conversations[randomConversation];
        if (messages.length > 0) {
          // Update TTL for messages
          messages.forEach(msg => {
            if (msg.timeLeft > 0) {
              msg.timeLeft -= 60; // Decrease by 1 minute
            }
          });
          
          if (callback) {
            callback();
          }
        }
      }
    }, 60000); // Update every minute
  }
};

export default ChatDataService;
