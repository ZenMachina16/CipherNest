import React from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Icon,
  Text,
  Stack,
  HStack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiLock, FiClock, FiShield, FiKey } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const features = [
  {
    id: 1,
    title: 'End-to-End Encryption',
    text: 'Military-grade encryption ensures your messages remain private and secure.',
    icon: FiLock,
  },
  {
    id: 2,
    title: 'Auto-Deletion',
    text: 'Messages automatically delete after a set time period, leaving no trace.',
    icon: FiClock,
  },
  {
    id: 3,
    title: 'Blockchain Security',
    text: 'Leveraging Internet Computer for decentralized security and authenticity.',
    icon: FiShield,
  },
  {
    id: 4,
    title: 'Key Management',
    text: 'Advanced key management with multiple encryption algorithms.',
    icon: FiKey,
  },
];

export default function Features() {
  const bgBox = useColorModeValue('white', 'gray.800');
  const boxShadow = useColorModeValue('lg', 'dark-lg');

  return (
    <Box p={4} mt={10}>
      <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'}>
        <Heading fontSize={'3xl'}>Advanced Security Features</Heading>
        <Text color={'gray.600'} fontSize={'xl'}>
          CipherNest combines cutting-edge cryptography with user-friendly design
          to provide the most secure messaging experience.
        </Text>
      </Stack>

      <Container maxW={'6xl'} mt={10}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          {features.map((feature) => (
            <MotionBox
              key={feature.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HStack
                align={'top'}
                p={8}
                bg={bgBox}
                boxShadow={boxShadow}
                rounded={'xl'}
                _hover={{
                  transform: 'translateY(-5px)',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box color={'blue.400'} px={2}>
                  <Icon as={feature.icon} w={10} h={10} />
                </Box>
                <VStack align={'start'}>
                  <Text fontWeight={600} fontSize={'lg'}>
                    {feature.title}
                  </Text>
                  <Text color={'gray.600'}>{feature.text}</Text>
                </VStack>
              </HStack>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
