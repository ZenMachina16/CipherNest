import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  useColorModeValue,
  Container,
  Flex,
  Avatar,
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
  Select,
  Divider,
} from '@chakra-ui/react';
import { FiUser, FiUsers, FiShield, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const UserSimulator = ({ currentUser, onUserChange }) => {
  const [selectedUser, setSelectedUser] = useState(currentUser);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const simulatedUsers = [
    {
      id: 'user1',
      name: 'Alice Johnson',
      principalId: 'uxrrr-q7777-77774-qaaaq-cai',
      avatar: '👩‍💻',
      status: 'online',
      role: 'Security Analyst',
      lastSeen: Date.now(),
    },
    {
      id: 'user2',
      name: 'Bob Smith',
      principalId: 'u6s2n-gx777-77774-qaaba-cai',
      avatar: '👨‍💼',
      status: 'online',
      role: 'Developer',
      lastSeen: Date.now(),
    },
    {
      id: 'user3',
      name: 'Carol Davis',
      principalId: 'uqqxf-5h777-77774-qaaaa-cai',
      avatar: '👩‍🔬',
      status: 'offline',
      role: 'Researcher',
      lastSeen: Date.now() - 3600000,
    },
    {
      id: 'user4',
      name: 'David Wilson',
      principalId: 'uzt4z-lp777-77774-qaabq-cai',
      avatar: '👨‍🎓',
      status: 'online',
      role: 'Student',
      lastSeen: Date.now(),
    },
  ];

  const handleUserSwitch = (user) => {
    setSelectedUser(user);
    onUserChange(user);
    onClose();
    
    toast({
      title: "User Switched",
      description: `Now logged in as ${user.name}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <>
      {/* User Switcher Button */}
      <Button
        leftIcon={<FiUsers />}
        variant="outline"
        size="sm"
        onClick={onOpen}
        colorScheme="blue"
        borderRadius="full"
      >
        Switch User
      </Button>

      {/* User Info Display */}
      <HStack spacing={2} ml={4}>
        <Avatar size="sm" bg="blue.500">
          <Text fontSize="xs">{currentUser.avatar}</Text>
        </Avatar>
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {currentUser.name}
          </Text>
          <Text fontSize="xs" color="gray.500" fontFamily="mono">
            {currentUser.principalId.slice(0, 8)}...
          </Text>
        </VStack>
        <Badge
          colorScheme={currentUser.status === 'online' ? 'green' : 'gray'}
          variant="subtle"
          size="sm"
        >
          {currentUser.status}
        </Badge>
      </HStack>

      {/* User Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Switch User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Select a user to simulate different chat experiences:
              </Text>
              
              {simulatedUsers.map((user) => (
                <MotionBox
                  key={user.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <HStack
                    p={4}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.600'),
                    }}
                    onClick={() => handleUserSwitch(user)}
                    border={currentUser.id === user.id ? '2px solid' : '1px solid'}
                    borderColor={currentUser.id === user.id ? 'blue.500' : borderColor}
                  >
                    <Avatar size="md" bg="blue.500">
                      <Text fontSize="sm">{user.avatar}</Text>
                    </Avatar>
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="md" fontWeight="medium">
                        {user.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {user.role}
                      </Text>
                      <Text fontSize="xs" color="gray.400" fontFamily="mono">
                        {user.principalId}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Badge
                        colorScheme={user.status === 'online' ? 'green' : 'gray'}
                        variant="subtle"
                        size="sm"
                      >
                        {user.status}
                      </Badge>
                      {currentUser.id === user.id && (
                        <Badge colorScheme="blue" variant="solid" size="sm">
                          Current
                        </Badge>
                      )}
                    </VStack>
                  </HStack>
                </MotionBox>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserSimulator;
