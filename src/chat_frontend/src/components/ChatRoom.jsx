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
import { ChatDataService } from '../services/ChatDataService';

const MotionBox = motion(Box);

const ChatRoom = ({ contact, onBack, currentUserPrincipal }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [encryptionLevel, setEncryptionLevel] = useState('P-384');
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const messageBg = useColorModeValue('blue.50', 'blue.900');
  const otherMessageBg = useColorModeValue('gray.100', 'gray.700');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history for this contact
  useEffect(() => {
    if (contact) {
      // Load chat history from the service
      const chatHistory = ChatDataService.getChatHistory(currentUserPrincipal, contact.principalId);
      setMessages(chatHistory);
    }
  }, [contact, currentUserPrincipal]);

  // Refresh messages when user changes
  useEffect(() => {
    if (contact && currentUserPrincipal) {
      const chatHistory = ChatDataService.getChatHistory(currentUserPrincipal, contact.principalId);
      setMessages(chatHistory);
    }
  }, [currentUserPrincipal, contact]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const message = {
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
    
    // Add message to the service
    const newMessageObj = ChatDataService.addMessage(currentUserPrincipal, contact.principalId, message);
    setMessages(prev => [...prev, newMessageObj]);
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
            bgGradient="linear(to-r, #667eea, #764ba2)"
            color="white"
            _hover={{ bgGradient: "linear(to-r, #764ba2, #f093fb)" }}
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
              bgGradient="linear(to-r, #f093fb, #f5576c)"
              color="white"
              borderColor="#f093fb"
              _hover={{ bgGradient: "linear(to-r, #f5576c, #4facfe)" }}
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
              bgGradient="linear(to-r, #667eea, #764ba2)"
              color="white"
            >
              <HStack>
                <Avatar size="sm">
                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                </Avatar>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium" color="white">{contact?.name}</Text>
                  <Text fontSize="xs" color="white" fontFamily="mono" opacity="0.8">
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
              bg={useColorModeValue('gray.50', 'gray.800')}
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
                        bg={msg.from === currentUserPrincipal ? messageBg : otherMessageBg}
                        color={msg.from === currentUserPrincipal ? 'blue.800' : useColorModeValue('gray.800', 'gray.200')}
                        px={4}
                        py={2}
                        borderRadius="lg"
                        position="relative"
                        border="1px"
                        borderColor={borderColor}
                        boxShadow="sm"
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
              bg={bgColor}
            >
              <Input
                placeholder="Type a secure message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                borderColor={borderColor}
                _focus={{ borderColor: '#667eea', boxShadow: '0 0 0 1px #667eea' }}
              />
              <IconButton
                bgGradient="linear(to-r, #667eea, #764ba2)"
                color="white"
                aria-label="Send message"
                icon={<FiSend />}
                onClick={sendMessage}
                _hover={{ bgGradient: "linear(to-r, #764ba2, #f093fb)" }}
              />
            </HStack>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
};

export default ChatRoom;
