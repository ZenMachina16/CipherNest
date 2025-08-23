import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useColorModeValue,
  Container,
  Flex,
  Divider,
  Avatar,
  AvatarBadge,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiUserPlus, FiMessageCircle, FiTrash2, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { ChatDataService } from '../services/ChatDataService';

const MotionBox = motion(Box);

const ContactManager = ({ onContactSelect, currentUserPrincipal }) => {
  const [contacts, setContacts] = useState(() => {
    // Get user-specific contacts from the service
    return ChatDataService.getUserContactsList(currentUserPrincipal);
  });

  // Refresh contacts when user changes
  useEffect(() => {
    const userContacts = ChatDataService.getUserContactsList(currentUserPrincipal);
    setContacts(userContacts);
  }, [currentUserPrincipal]);
  const [newContactPrincipal, setNewContactPrincipal] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const addContact = () => {
    if (!newContactPrincipal.trim() || !newContactName.trim()) {
      toast({
        title: "Error",
        description: "Please enter both Principal ID and name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if contact already exists
    if (contacts.find(c => c.principalId === newContactPrincipal)) {
      toast({
        title: "Error",
        description: "Contact already exists",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newContact = {
      principalId: newContactPrincipal,
      name: newContactName,
      status: 'online',
      role: 'User',
      avatar: '👤'
    };

    // Add contact using the service
    const addedContact = ChatDataService.addUserContact(currentUserPrincipal, newContact);
    setContacts(prev => [...prev, addedContact]);
    setNewContactPrincipal('');
    setNewContactName('');
    onClose();

    toast({
      title: "Success",
      description: "Contact added successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const removeContact = (contactId) => {
    // Remove contact using the service
    const updatedContacts = ChatDataService.removeUserContact(currentUserPrincipal, contactId);
    setContacts(updatedContacts);
    toast({
      title: "Contact Removed",
      description: "Contact has been removed from your list",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleContactClick = (contact) => {
    onContactSelect(contact);
  };

  return (
    <Box
      w="300px"
      borderRight="1px"
      borderColor={borderColor}
      bg={bgColor}
      h="100%"
      overflowY="auto"
    >
      <VStack spacing={4} align="stretch" p={4}>
        {/* Current User Principal ID */}
        <Box p={3} bgGradient="linear(to-r, #667eea, #764ba2)" borderRadius="md" border="1px" borderColor={borderColor} color="white">
          <Text fontSize="xs" color="white" mb={1} opacity="0.9">
            Your Principal ID
          </Text>
          <Text fontSize="sm" fontWeight="medium" fontFamily="mono" color="white">
            {currentUserPrincipal || 'uxrrr-q7777-77774-qaaaq-cai'}
          </Text>
        </Box>

        {/* Add Contact Button */}
        <Button
          leftIcon={<FiUserPlus />}
          bgGradient="linear(to-r, #f093fb, #f5576c)"
          color="white"
          size="sm"
          onClick={onOpen}
          borderRadius="full"
          _hover={{ bgGradient: "linear(to-r, #f5576c, #4facfe)" }}
        >
          Add Contact
        </Button>

        <Divider />

        {/* Contacts List */}
        <Text fontSize="sm" fontWeight="medium" color="gray.500">
          Contacts ({contacts.length})
        </Text>

        <VStack spacing={2} align="stretch">
          {contacts.map((contact) => (
            <MotionBox
              key={contact.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HStack
                p={3}
                bg={cardBg}
                borderRadius="md"
                border="1px"
                borderColor={borderColor}
                cursor="pointer"
                _hover={{
                  bg: hoverBg,
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                }}
                transition="all 0.2s"
                onClick={() => handleContactClick(contact)}
              >
                <Avatar size="sm">
                  <AvatarBadge 
                    boxSize="1em" 
                    bg={contact.status === 'online' ? 'green.500' : 'gray.400'} 
                  />
                </Avatar>
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {contact.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontFamily="mono">
                    {contact.principalId.slice(0, 8)}...
                  </Text>
                </VStack>
                <HStack spacing={1}>
                  <Tooltip label="Message">
                    <IconButton
                      icon={<FiMessageCircle />}
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactClick(contact);
                      }}
                    />
                  </Tooltip>
                  <Tooltip label="Remove Contact">
                    <IconButton
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeContact(contact.principalId);
                      }}
                    />
                  </Tooltip>
                </HStack>
              </HStack>
            </MotionBox>
          ))}
        </VStack>
      </VStack>

      {/* Add Contact Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Contact</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="100%">
                <Text fontSize="sm" mb={2}>
                  Contact Name
                </Text>
                <Input
                  placeholder="Enter contact name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                />
              </Box>
              <Box w="100%">
                <Text fontSize="sm" mb={2}>
                  Principal ID
                </Text>
                <Input
                  placeholder="Enter Principal ID"
                  value={newContactPrincipal}
                  onChange={(e) => setNewContactPrincipal(e.target.value)}
                  fontFamily="mono"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={addContact}>
              Add Contact
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ContactManager;
