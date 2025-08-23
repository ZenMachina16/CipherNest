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
  const bgGradient = useColorModeValue(
    'linear(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #43e97b 100%)',
    'linear(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #43e97b 100%)'
  );
  const bgBox = useColorModeValue('white', 'gray.800');
  const boxShadow = useColorModeValue('lg', 'dark-lg');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={bgGradient} py={24} data-section="features">
      <Container maxW={'7xl'}>
        <Stack spacing={8} textAlign={'center'} mb={16}>
          <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} fontWeight="bold">
            Enterprise Security Features
          </Heading>
          <Text color={textColor} fontSize={{ base: 'lg', md: 'xl' }} maxW="600px" mx="auto">
            Built for enterprises that demand the highest level of security. 
            CipherNest provides military-grade encryption with zero compromise on usability.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {features.map((feature) => (
            <MotionBox
              key={feature.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                p={8}
                bg={bgBox}
                boxShadow={boxShadow}
                border="1px"
                borderColor={borderColor}
                rounded={'2xl'}
                h="full"
                                  _hover={{
                    boxShadow: '2xl',
                    borderColor: '#667eea',
                  }}
                transition="all 0.3s ease"
              >
                <VStack align={'start'} spacing={4} h="full">
                  <Box 
                    color={'white'} 
                    p={3}
                    bgGradient="linear(to-r, #667eea, #764ba2)"
                    borderRadius="xl"
                  >
                    <Icon as={feature.icon} w={8} h={8} />
                  </Box>
                  <VStack align={'start'} spacing={2} flex={1}>
                    <Text fontWeight={700} fontSize={'xl'}>
                      {feature.title}
                    </Text>
                    <Text color={textColor} lineHeight="tall">
                      {feature.text}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* Enterprise Stats */}
        <Box mt={20} p={8} bg={bgBox} borderRadius="2xl" border="1px" borderColor={borderColor}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} textAlign="center">
            <VStack spacing={2}>
              <Text fontSize="4xl" fontWeight="bold" bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text">
                99.99%
              </Text>
              <Text fontSize="lg" fontWeight="medium">
                Uptime SLA
              </Text>
              <Text fontSize="sm" color={textColor}>
                Guaranteed availability for enterprise customers
              </Text>
            </VStack>
            <VStack spacing={2}>
              <Text fontSize="4xl" fontWeight="bold" bgGradient="linear(to-r, #f093fb, #f5576c)" bgClip="text">
                256-bit
              </Text>
              <Text fontSize="lg" fontWeight="medium">
                AES Encryption
              </Text>
              <Text fontSize="sm" color={textColor}>
                Military-grade encryption standard
              </Text>
            </VStack>
            <VStack spacing={2}>
              <Text fontSize="4xl" fontWeight="bold" bgGradient="linear(to-r, #4facfe, #00f2fe)" bgClip="text">
                &lt; 50ms
              </Text>
              <Text fontSize="lg" fontWeight="medium">
                Message Delivery
              </Text>
              <Text fontSize="sm" color={textColor}>
                Ultra-fast message transmission
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
