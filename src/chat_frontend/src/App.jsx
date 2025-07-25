import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  useToast,
  extendTheme,
} from '@chakra-ui/react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory } from '../../../declarations/chat_backend';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SecurityStats from './components/SecurityStats';
import Footer from './components/Footer';
import Chat from './components/Chat'; // We'll create this next

// Theme customization
const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
});

// Enhanced encryption utilities with multiple algorithms
const ENCRYPTION_ALGORITHMS = {
  ECDH_P384: 'P-384',
  ECDH_P256: 'P-256',
  ECDH_P521: 'P-521'
};

const SYMMETRIC_ALGORITHMS = {
  AES_GCM: 'AES-GCM',
  AES_CBC: 'AES-CBC'
};

const generateKeyPair = async (algorithm = ENCRYPTION_ALGORITHMS.ECDH_P384) => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: algorithm
    },
    true,
    ["deriveKey", "deriveBits"]
  );
  return keyPair;
};

// Generate a signature key pair for message integrity
const generateSignatureKeyPair = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-384"
    },
    true,
    ["sign", "verify"]
  );
};

// Sign a message
const signMessage = async (message, privateKey) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const signature = await window.crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-384" },
    },
    privateKey,
    data
  );
  return new Uint8Array(signature);
};

// Verify a message signature
const verifySignature = async (message, signature, publicKey) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return await window.crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: { name: "SHA-384" },
    },
    publicKey,
    signature,
    data
  );
};

const exportPublicKey = async (keyPair) => {
  const exported = await window.crypto.subtle.exportKey(
    "raw",
    keyPair.publicKey
  );
  return new Uint8Array(exported);
};

const deriveSharedKey = async (privateKey, publicKeyData) => {
  const publicKey = await window.crypto.subtle.importKey(
    "raw",
    publicKeyData,
    {
      name: "ECDH",
      namedCurve: "P-384"
    },
    true,
    []
  );
  
  return await window.crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: publicKey
    },
    privateKey,
    256
  );
};

const encryptMessage = async (text, sharedKey, signatureKey, algorithm = SYMMETRIC_ALGORITHMS.AES_GCM) => {
  const enc = new TextEncoder();
  const encoded = enc.encode(text);

  // Generate a random salt for key derivation
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  // Derive encryption key using PBKDF2
  const encryptionKey = await window.crypto.subtle.importKey(
    "raw",
    sharedKey,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    encryptionKey,
    {
      name: algorithm,
      length: 256
    },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Sign the message before encryption
  const signature = await signMessage(text, signatureKey.privateKey);
  
  // Combine message and signature
  const messageWithSignature = new Uint8Array(encoded.length + signature.length);
  messageWithSignature.set(encoded);
  messageWithSignature.set(signature, encoded.length);

  // Encrypt the combined message and signature
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: algorithm,
      iv: iv
    },
    derivedKey,
    messageWithSignature
  );

  // Combine all components (salt + iv + encrypted data)
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return combined;
};

const decryptMessage = async (combined, sharedKey, verificationKey, algorithm = SYMMETRIC_ALGORITHMS.AES_GCM) => {
  // Extract components
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);

  // Derive decryption key using PBKDF2
  const decryptionKey = await window.crypto.subtle.importKey(
    "raw",
    sharedKey,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    decryptionKey,
    {
      name: algorithm,
      length: 256
    },
    false,
    ["decrypt"]
  );

  // Decrypt the combined message and signature
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: algorithm,
      iv: iv
    },
    derivedKey,
    data
  );

  const decryptedArray = new Uint8Array(decrypted);
  
  // Separate message from signature (signature is 96 bytes for P-384)
  const messageBytes = decryptedArray.slice(0, -96);
  const signature = decryptedArray.slice(-96);

  const dec = new TextDecoder();
  const message = dec.decode(messageBytes);

  // Verify signature
  const isValid = await verifySignature(message, signature, verificationKey);
  if (!isValid) {
    throw new Error('Message signature verification failed');
  }

  return {
    content: message,
    verified: true
  };
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [actor, setActor] = useState(null);
  const [keyPair, setKeyPair] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [signatureKeyPair, setSignatureKeyPair] = useState(null);
  const [selectedEncryption, setSelectedEncryption] = useState(ENCRYPTION_ALGORITHMS.ECDH_P384);
  const [selectedSymmetric, setSelectedSymmetric] = useState(SYMMETRIC_ALGORITHMS.AES_GCM);
  const [securityLevel, setSecurityLevel] = useState('high');
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const toast = useToast();

  useEffect(() => {
    initializeActor();
    initializeKeys();
    const interval = setInterval(fetchMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, []);

  const initializeKeys = async () => {
    try {
      const newKeyPair = await generateKeyPair();
      setKeyPair(newKeyPair);
      const newPublicKey = await exportPublicKey(newKeyPair);
      setPublicKey(newPublicKey);
      
      if (actor) {
        await actor.setPublicKey(newPublicKey);
      }
    } catch (error) {
      console.error('Failed to initialize keys:', error);
      toast({
        title: 'Encryption Error',
        description: 'Failed to initialize encryption keys',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const initializeActor = async () => {
    try {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();

      if (!isAuthenticated) {
        await authClient.login({
          identityProvider: process.env.DFX_NETWORK === 'ic' 
            ? 'https://identity.ic0.app'
            : `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`,
        });
      }

      const agent = new HttpAgent({
        host: process.env.DFX_NETWORK === 'ic' 
          ? 'https://ic0.app' 
          : 'http://localhost:4943',
      });

      if (process.env.DFX_NETWORK !== 'ic') {
        await agent.fetchRootKey();
      }

      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: process.env.CANISTER_ID_CHAT_BACKEND,
      });

      setActor(actor);
    } catch (error) {
      console.error('Failed to initialize actor:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the Internet Computer',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const fetchMessages = async () => {
    if (!actor || !keyPair) return;
    try {
      const encryptedMessages = await actor.getMessages();
      
      // Decrypt messages
      const decryptedMessages = await Promise.all(
        encryptedMessages.map(async (msg) => {
          try {
            const sharedKey = await deriveSharedKey(keyPair.privateKey, msg.publicKey);
            const decryptedContent = await decryptMessage(msg.encryptedContent, sharedKey);
            return {
              ...msg,
              content: decryptedContent,
              timeLeft: Math.floor((msg.expiresAt - Date.now() * 1000000) / 1000000000) // Convert to seconds
            };
          } catch (error) {
            console.error('Failed to decrypt message:', error);
            return {
              ...msg,
              content: '[Encrypted Message - Unable to decrypt]',
              timeLeft: 0
            };
          }
        })
      );

      setMessages(decryptedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!actor || !newMessage || !recipientId || !keyPair || !publicKey) {
      toast({
        title: 'Error',
        description: 'Missing required information to send message',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      // Get recipient's public key
      const recipientPublicKey = await actor.getPublicKey(recipientId);
      if (!recipientPublicKey) {
        throw new Error('Recipient has not set up encryption keys');
      }

      // Derive shared key and encrypt message
      const sharedKey = await deriveSharedKey(keyPair.privateKey, recipientPublicKey);
      const encryptedContent = await encryptMessage(newMessage, sharedKey);

      // Send encrypted message
      await actor.sendEncryptedMessage(recipientId, encryptedContent, publicKey);
      
      setNewMessage('');
      toast({
        title: 'Message Sent',
        description: 'Message encrypted and sent successfully',
        status: 'success',
        duration: 3000,
      });
      
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const SecurityInfo = () => (
    <Box p={4} borderWidth={1} borderRadius="lg" bg="blue.50" mb={4}>
      <VStack align="start" spacing={2}>
        <Heading size="sm">Current Security Settings</Heading>
        <Text>Key Exchange: {selectedEncryption}</Text>
        <Text>Encryption: {selectedSymmetric}</Text>
        <Text>Security Level: {securityLevel}</Text>
        <Text>Message Signing: Enabled (ECDSA P-384)</Text>
        <Text>Key Derivation: PBKDF2 (100,000 iterations)</Text>
      </VStack>
    </Box>
  );

  const SecurityLevelIndicator = ({ level }) => {
    const colors = {
      high: "green",
      medium: "yellow",
      low: "red"
    };
    return (
      <Box display="flex" alignItems="center">
        <Box w={3} h={3} borderRadius="full" bg={colors[level] + ".400"} mr={2} />
        <Text fontSize="sm" color={colors[level] + ".700"}>
          Security Level: {level.charAt(0).toUpperCase() + level.slice(1)}
        </Text>
      </Box>
    );
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <Heading>ICP Chat</Heading>
        <SecurityLevelIndicator level={securityLevel} />
        
        <Button
          size="sm"
          onClick={() => setShowSecurityInfo(!showSecurityInfo)}
          colorScheme="blue"
          variant="outline"
        >
          {showSecurityInfo ? "Hide Security Info" : "Show Security Info"}
        </Button>

        {showSecurityInfo && <SecurityInfo />}
        
        <Box w="100%" p={4} borderWidth={1} borderRadius="lg">
          <VStack spacing={4}>
            <Input
              placeholder="Recipient Principal ID"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            />
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button colorScheme="blue" onClick={sendMessage} isFullWidth>
              Send Message
            </Button>
          </VStack>
        </Box>

        <Box w="100%" p={4} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={4}>Messages</Heading>
          <VStack spacing={4} align="stretch">
            {messages.map((msg, index) => (
              <Box 
                key={index} 
                p={3} 
                bg="gray.50" 
                borderRadius="md"
                position="relative"
                borderWidth={1}
                borderColor={msg.verified ? "green.200" : "red.200"}
              >
                <HStack spacing={2} mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    From: {msg.from.toString()}
                  </Text>
                  {msg.verified && (
                    <Box
                      display="inline-flex"
                      alignItems="center"
                      px={2}
                      py={1}
                      borderRadius="full"
                      bg="green.100"
                    >
                      <Box as="span" w={2} h={2} borderRadius="full" bg="green.400" mr={1} />
                      <Text fontSize="xs" color="green.700">Verified</Text>
                    </Box>
                  )}
                  {msg.decryptionSuccess && (
                    <Box
                      display="inline-flex"
                      alignItems="center"
                      px={2}
                      py={1}
                      borderRadius="full"
                      bg="blue.100"
                    >
                      <Box as="span" w={2} h={2} borderRadius="full" bg="blue.400" mr={1} />
                      <Text fontSize="xs" color="blue.700">Encrypted</Text>
                    </Box>
                  )}
                </HStack>
                
                <Text>{msg.content}</Text>
                
                <HStack spacing={4} mt={2}>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(Number(msg.timestamp) / 1000000).toLocaleString()}
                  </Text>
                  {msg.timeLeft > 0 && (
                    <Text
                      fontSize="xs"
                      color={msg.timeLeft < 3600 ? "red.500" : "gray.500"}
                    >
                      Expires in: {Math.floor(msg.timeLeft / 3600)}h {Math.floor((msg.timeLeft % 3600) / 60)}m
                    </Text>
                  )}
                </HStack>

                {msg.securityInfo && (
                  <Box
                    mt={2}
                    p={2}
                    bg="gray.50"
                    borderRadius="sm"
                    fontSize="xs"
                  >
                    <Text color="gray.600">Security Info:</Text>
                    <Text color="gray.600">Encryption: {msg.securityInfo.algorithm}</Text>
                    <Text color="gray.600">Key Exchange: {msg.securityInfo.keyExchange}</Text>
                    <Text color="gray.600">Signature: {msg.securityInfo.signatureType}</Text>
                  </Box>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default App;
