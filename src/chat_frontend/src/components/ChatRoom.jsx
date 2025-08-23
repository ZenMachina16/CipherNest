import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  IconButton,
  Text,
  useColorModeValue,
  Container,
  Flex,
  Avatar,
  AvatarBadge,
  Badge,
  Tooltip,
  Select,
  Divider,
  Button,
} from '@chakra-ui/react';
import { FiSend, FiLock, FiClock, FiMoreVertical, FiTrash2, FiArrowLeft, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

const ChatRoom = ({ contact, onBack, currentUserPrincipal }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [encryptionLevel, setEncryptionLevel] = useState('P-384');
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history for this contact
  useEffect(() => {
    if (contact) {
      // Simulate loading chat history from the last 24 hours
      const chatHistory = [
        {
          id: 1,
          content: `Hello ${contact.name}! This is a secure message from the last 24 hours.`,
          from: contact.principalId,
          timestamp: Date.now() * 1000000 - 3600000000, // 1 hour ago
          verified: true,
          timeLeft: 82800, // 23 hours left
          securityInfo: {
            algorithm: "AES-256-GCM",
            keyExchange: "ECDH-P384",
            signatureType: "ECDSA-P384"
          }
        },
        {
          id: 2,
          content: "Hi! Thanks for the secure message. The encryption is working perfectly.",
          from: currentUserPrincipal,
          timestamp: Date.now() * 1000000 - 1800000000, // 30 minutes ago
          verified: true,
          timeLeft: 84600, // 23.5 hours left
          securityInfo: {
            algorithm: "AES-256-GCM",
            keyExchange: "ECDH-P384",
            signatureType: "ECDSA-P384"
          }
        },
        {
          id: 3,
          content: "This message will automatically expire in 24 hours for enhanced security.",
          from: contact.principalId,
          timestamp: Date.now() * 1000000 - 900000000, // 15 minutes ago
          verified: true,
          timeLeft: 85500, // 23.75 hours left
          securityInfo: {
            algorithm: "AES-256-GCM",
            keyExchange: "ECDH-P384",
            signatureType: "ECDSA-P384"
          }
        }
      ];
      setMessages(chatHistory);
    }
  }, [contact, currentUserPrincipal]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      content: newMessage,
      from: currentUserPrincipal,
      timestamp: Date.now() * 1000000,
      verified: true,
      timeLeft: 86400, // 24 hours
      securityInfo: {
        algorithm: "AES-256-GCM",
        keyExchange: `ECDH-${encryptionLevel}`,
        signatureType: `ECDSA-${encryptionLevel}`
      }
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Container maxW="container.xl" pt="20" h="100vh">
      {/* Header with Back Button */}
      <Box mb={4}>
        <HStack justify="space-between">
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            size="sm"
            onClick={onBack}
            colorScheme="blue"
          >
            Back to Contacts
          </Button>
          <HStack spacing={2}>
            <Select 
              size="sm" 
              w="150px" 
              borderRadius="full"
              value={encryptionLevel}
              onChange={(e) => setEncryptionLevel(e.target.value)}
            >
              <option value="P-256">P-256 Encryption</option>
              <option value="P-384">P-384 Encryption</option>
              <option value="P-521">P-521 Encryption</option>
            </Select>
            <Tooltip label="Clear Chat">
              <IconButton
                icon={<FiTrash2 />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={clearChat}
              />
            </Tooltip>
          </HStack>
        </HStack>
      </Box>
      
      <Box
        h="calc(100vh - 140px)"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={bgColor}
        boxShadow="lg"
      >
        <Flex h="100%">
          {/* Chat Header */}
          <Box w="100%">
            <HStack
              p={4}
              borderBottom="1px"
              borderColor={borderColor}
              justify="space-between"
              bg={useColorModeValue('gray.50', 'gray.700')}
            >
              <HStack>
                <Avatar size="sm">
                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                </Avatar>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{contact?.name}</Text>
                  <Text fontSize="xs" color="gray.500" fontFamily="mono">
                    {contact?.principalId}
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={2}>
                <Badge colorScheme="green" variant="subtle">
                  <HStack spacing={1}>
                    <FiShield size={12} />
                    <Text fontSize="xs">Encrypted</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="blue" variant="subtle">
                  <HStack spacing={1}>
                    <FiClock size={12} />
                    <Text fontSize="xs">24h TTL</Text>
                  </HStack>
                </Badge>
              </HStack>
            </HStack>

            {/* Messages */}
            <Box
              h="calc(100% - 130px)"
              overflowY="auto"
              p={4}
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: useColorModeValue('gray.300', 'gray.600'),
                  borderRadius: '24px',
                },
              }}
            >
              <VStack spacing={4} align="stretch">
                {messages.map((msg, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      maxW="80%"
                      ml={msg.from === currentUserPrincipal ? 'auto' : '0'}
                    >
                      <Box
                        bg={msg.from === currentUserPrincipal ? 'blue.500' : useColorModeValue('gray.100', 'gray.700')}
                        color={msg.from === currentUserPrincipal ? 'white' : 'inherit'}
                        px={4}
                        py={2}
                        borderRadius="lg"
                        position="relative"
                      >
                        <Text>{msg.content}</Text>
                        <HStack
                          position="absolute"
                          bottom="-20px"
                          right={0}
                          spacing={1}
                        >
                          <Badge
                            size="sm"
                            colorScheme={msg.verified ? 'green' : 'red'}
                            variant="subtle"
                          >
                            <HStack spacing={1}>
                              <FiLock size={10} />
                              <Text fontSize="xs">
                                {msg.verified ? 'Verified' : 'Unverified'}
                              </Text>
                            </HStack>
                          </Badge>
                          <Tooltip label={`Expires in ${Math.floor(msg.timeLeft / 3600)}h ${Math.floor((msg.timeLeft % 3600) / 60)}m`}>
                            <Badge
                              size="sm"
                              colorScheme={msg.timeLeft < 3600 ? 'red' : 'gray'}
                              variant="subtle"
                            >
                              <HStack spacing={1}>
                                <FiClock size={10} />
                                <Text fontSize="xs">
                                  {Math.floor(msg.timeLeft / 3600)}h
                                </Text>
                              </HStack>
                            </Badge>
                          </Tooltip>
                        </HStack>
                      </Box>
                      
                      {/* Security Info */}
                      {msg.securityInfo && (
                        <Box
                          mt={2}
                          p={2}
                          bg={useColorModeValue('gray.50', 'gray.600')}
                          borderRadius="sm"
                          fontSize="xs"
                          maxW="200px"
                        >
                          <Text color="gray.600" fontWeight="medium">Security Info:</Text>
                          <Text color="gray.600">Encryption: {msg.securityInfo.algorithm}</Text>
                          <Text color="gray.600">Key Exchange: {msg.securityInfo.keyExchange}</Text>
                          <Text color="gray.600">Signature: {msg.securityInfo.signatureType}</Text>
                        </Box>
                      )}
                    </Box>
                  </MotionBox>
                ))}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>

            {/* Input Area */}
            <HStack
              p={4}
              borderTop="1px"
              borderColor={borderColor}
              spacing={3}
            >
              <Input
                placeholder="Type a secure message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <IconButton
                colorScheme="blue"
                aria-label="Send message"
                icon={<FiSend />}
                onClick={sendMessage}
              />
            </HStack>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
};

export default ChatRoom;
