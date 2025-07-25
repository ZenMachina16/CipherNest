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
  Divider,
  Avatar,
  AvatarBadge,
  Badge,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
} from '@chakra-ui/react';
import { FiSend, FiLock, FiClock, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Chat = ({ actor }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const messagesEndRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    // ... existing fetch logic ...
  };

  const sendMessage = async () => {
    // ... existing send logic ...
  };

  return (
    <Container maxW="container.xl" pt="20" h="100vh">
      <Box
        h="calc(100vh - 100px)"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={bgColor}
        boxShadow="lg"
      >
        <Flex h="100%">
          {/* Sidebar */}
          <Box
            w="300px"
            borderRight="1px"
            borderColor={borderColor}
            p={4}
          >
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="Search contacts..."
                size="sm"
                borderRadius="full"
              />
              <Divider />
              <Text fontSize="sm" fontWeight="medium" color="gray.500">
                Recent Chats
              </Text>
              {/* Add contact list here */}
            </VStack>
          </Box>

          {/* Chat Area */}
          <Box flex="1">
            {/* Chat Header */}
            <HStack
              p={4}
              borderBottom="1px"
              borderColor={borderColor}
              justify="space-between"
            >
              <HStack>
                <Avatar size="sm">
                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                </Avatar>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{recipientId || 'Select Contact'}</Text>
                  <Text fontSize="xs" color="gray.500">
                    Online
                  </Text>
                </VStack>
              </HStack>
              <HStack>
                <Select size="sm" w="150px" borderRadius="full">
                  <option value="P-384">P-384 Encryption</option>
                  <option value="P-256">P-256 Encryption</option>
                  <option value="P-521">P-521 Encryption</option>
                </Select>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem icon={<FiTrash2 />}>Clear Chat</MenuItem>
                    <MenuItem icon={<FiLock />}>Security Info</MenuItem>
                  </MenuList>
                </Menu>
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
                      ml={msg.from === actor?._principal ? 'auto' : '0'}
                    >
                      <Box
                        bg={msg.from === actor?._principal ? 'blue.500' : useColorModeValue('gray.100', 'gray.700')}
                        color={msg.from === actor?._principal ? 'white' : 'inherit'}
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
                          <Tooltip label={`Expires in ${msg.timeLeft}s`}>
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
                placeholder="Type a message..."
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

export default Chat;
