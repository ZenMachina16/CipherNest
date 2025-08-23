import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Container,
  Flex,
  Button,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ContactManager from './ContactManager';
import ChatRoom from './ChatRoom';

const Chat = ({ actor }) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const currentUserPrincipal = 'uxrrr-q7777-77774-qaaaq-cai'; // This would come from authentication
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
  };

  return (
    <Container maxW="container.xl" pt="20" h="100vh">
      {/* Back to Home Button */}
      <Box mb={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          colorScheme="blue"
        >
          Back to Home
        </Button>
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
          {selectedContact ? (
            // Show ChatRoom when a contact is selected
            <ChatRoom 
              contact={selectedContact}
              onBack={handleBackToContacts}
              currentUserPrincipal={currentUserPrincipal}
            />
          ) : (
            // Show ContactManager when no contact is selected
            <>
              <ContactManager 
                onContactSelect={handleContactSelect}
                currentUserPrincipal={currentUserPrincipal}
              />
              <Box flex="1" p={8}>
                <VStack spacing={6} align="center" justify="center" h="100%">
                  <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                    Welcome to CipherNest Chat
                  </Text>
                  <Text fontSize="lg" color="gray.400" textAlign="center" maxW="400px">
                    Select a contact from the sidebar to start a secure conversation, 
                    or add a new contact using their Principal ID.
                  </Text>
                  <Box
                    p={6}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderRadius="lg"
                    textAlign="center"
                    maxW="500px"
                  >
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      💡 How to add contacts:
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      1. Click "Add Contact" in the sidebar
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      2. Enter the contact's name and Principal ID
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      3. Click "Add Contact" to save
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      4. Click on any contact to start chatting
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </>
          )}
        </Flex>
      </Box>
    </Container>
  );
};

export default Chat;
