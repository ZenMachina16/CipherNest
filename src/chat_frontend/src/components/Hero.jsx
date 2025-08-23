import React from 'react';
import {
  Container,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  Image,
  useColorModeValue,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiShield } from 'react-icons/fi';
import logo from '../../asset/logo.png';

const MotionBox = motion(Box);

export default function Hero({ onGetStarted }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const bgGradient = useColorModeValue(
    'linear(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    'linear(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bg={bgGradient} minH="100vh">
      <Container maxW={'7xl'} py={{ base: 8, md: 12, lg: 16 }}>
        <Stack
          align={'center'}
          spacing={{ base: 12, md: 16 }}
          direction={{ base: 'column', lg: 'row' }}
          ref={ref}
        >
          <Stack flex={1} spacing={{ base: 6, md: 8 }} maxW="600px">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              {/* Brand */}
                              <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)"
                  bgClip="text"
                  mb={6}
                >
                  CipherNest
                </Text>

              {/* Main Headline */}
              <Heading
                lineHeight={1.1}
                fontWeight={700}
                fontSize={{ base: '4xl', sm: '5xl', lg: '6xl' }}
                mb={6}
              >
                <Text
                  as={'span'}
                  bgGradient="linear(to-r, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)"
                  bgClip="text"
                >
                  Enterprise-Grade
                </Text>
                <br />
                <Text as={'span'} color={useColorModeValue('gray.800', 'gray.100')}>
                  Secure Messaging
                </Text>
              </Heading>

              {/* Subtitle */}
              <Text 
                color={useColorModeValue('gray.600', 'gray.300')} 
                fontSize={{ base: 'lg', md: 'xl' }} 
                lineHeight="tall"
                mb={8}
                maxW="500px"
              >
                The most secure messaging platform for enterprises. End-to-end encryption, 
                blockchain authentication, and zero-knowledge architecture ensure your 
                communications remain private and tamper-proof.
              </Text>


            </MotionBox>

            {/* CTA Buttons */}
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: 'column', sm: 'row' }}
            >
              <Button
                size={'lg'}
                fontWeight={'600'}
                px={8}
                py={6}
                bgGradient="linear(to-r, #667eea, #764ba2)"
                _hover={{ bgGradient: "linear(to-r, #764ba2, #f093fb)", transform: 'translateY(-2px)' }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
                onClick={onGetStarted}
                leftIcon={<Box as="span" fontSize="lg">🚀</Box>}
              >
                Start Free Trial
              </Button>
              <Button
                size={'lg'}
                fontWeight={'600'}
                px={8}
                py={6}
                variant="outline"
                borderWidth={2}
                borderColor={useColorModeValue('gray.300', 'gray.600')}
                _hover={{ 
                  bg: useColorModeValue('gray.50', 'gray.700'),
                  borderColor: useColorModeValue('gray.400', 'gray.500')
                }}
                onClick={() => {
                  const featuresSection = document.querySelector('[data-section="features"]');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                leftIcon={<FiShield />}
              >
                View Features
              </Button>
            </Stack>

            {/* Social Proof */}
            <HStack spacing={6} pt={4}>
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                Trusted by 10,000+ companies
              </Text>
              <HStack spacing={4}>
                <Box fontSize="2xl">🏢</Box>
                <Box fontSize="2xl">🏦</Box>
                <Box fontSize="2xl">⚖️</Box>
                <Box fontSize="2xl">🏥</Box>
              </HStack>
            </HStack>
          </Stack>
        <Flex
          flex={1}
          justify={'center'}
          align={'center'}
          position={'relative'}
          w={'full'}
        >
          <MotionBox
            position={'relative'}
            height={'600px'}
            rounded={'2xl'}
            boxShadow={'2xl'}
            width={'full'}
            overflow={'hidden'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
          >
            <Box
              w="100%"
              h="100%"
              bgGradient="linear(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              overflow="hidden"
            >
              {/* Animated floating elements */}
              <Box
                position="absolute"
                top="15%"
                left="10%"
                w="60px"
                h="60px"
                bg="rgba(255,255,255,0.1)"
                borderRadius="full"
                animation="float 6s ease-in-out infinite"
              />
              <Box
                position="absolute"
                top="25%"
                right="20%"
                w="40px"
                h="40px"
                bg="rgba(255,255,255,0.15)"
                borderRadius="full"
                animation="float 8s ease-in-out infinite 1s"
              />
              <Box
                position="absolute"
                bottom="30%"
                left="20%"
                w="50px"
                h="50px"
                bg="rgba(255,255,255,0.1)"
                borderRadius="full"
                animation="float 7s ease-in-out infinite 2s"
              />
              <Box
                position="absolute"
                bottom="20%"
                right="10%"
                w="70px"
                h="70px"
                bg="rgba(255,255,255,0.08)"
                borderRadius="full"
                animation="float 9s ease-in-out infinite 3s"
              />
              
              {/* Security grid pattern */}
              <Box
                position="absolute"
                top="0"
                left="0"
                w="100%"
                h="100%"
                opacity="0.1"
                backgroundImage="radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)"
                backgroundSize="50px 50px"
                animation="gridMove 20s linear infinite"
              />
              
              {/* Main content with enhanced styling */}
              <VStack spacing={8} textAlign="center" color="white" zIndex={2}>
                {/* Security Icon */}
                <Box
                  bg="white"
                  p={6}
                  borderRadius="2xl"
                  boxShadow="0 0 30px rgba(255,255,255,0.3)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w={32}
                  h={32}
                  position="relative"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    right: '-10px',
                    bottom: '-10px',
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
                    borderRadius: '2xl',
                    zIndex: -1,
                    opacity: 0.7,
                    animation: 'glow 3s ease-in-out infinite alternate'
                  }}
                >
                  <Text fontSize="6xl">🔐</Text>
                </Box>
                
                {/* Enhanced text with better typography */}
                <VStack spacing={3}>
                  <Text
                    fontSize="4xl"
                    fontWeight="bold"
                    textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                    letterSpacing="wide"
                  >
                    Enterprise Security
                  </Text>
                  <Text
                    fontSize="xl"
                    opacity="0.95"
                    textShadow="1px 1px 2px rgba(0,0,0,0.3)"
                    maxW="350px"
                    lineHeight="tall"
                  >
                    Military-grade encryption with blockchain authentication
                  </Text>
                </VStack>
                
                {/* Security indicators */}
                <VStack spacing={3} opacity="0.9">
                  <HStack spacing={4}>
                    <Box
                      bg="rgba(255,255,255,0.2)"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="medium"
                      backdropFilter="blur(10px)"
                    >
                      🔒 AES-256-GCM
                    </Box>
                    <Box
                      bg="rgba(255,255,255,0.2)"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="medium"
                      backdropFilter="blur(10px)"
                    >
                      ⚡ Zero-Knowledge
                    </Box>
                  </HStack>
                  <HStack spacing={4}>
                    <Box
                      bg="rgba(255,255,255,0.2)"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="medium"
                      backdropFilter="blur(10px)"
                    >
                      🛡️ Blockchain Auth
                    </Box>
                    <Box
                      bg="rgba(255,255,255,0.2)"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="medium"
                      backdropFilter="blur(10px)"
                    >
                      🔐 E2E Encryption
                    </Box>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          </MotionBox>
        </Flex>
      </Stack>
      </Container>
    </Box>
  );
}
