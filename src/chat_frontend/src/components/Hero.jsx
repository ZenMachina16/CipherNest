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
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const MotionBox = motion(Box);

export default function Hero({ onGetStarted }) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <Container maxW={'7xl'}>
      <Stack
        align={'center'}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
        direction={{ base: 'column', md: 'row' }}
        ref={ref}
      >
        <Stack flex={1} spacing={{ base: 5, md: 10 }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
            >
              <Text
                as={'span'}
                position={'relative'}
                bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
                bgClip="text"
              >
                Secure Communication
              </Text>
              <br />
              <Text as={'span'} color={useColorModeValue('gray.900', 'gray.100')}>
                for the Digital Age
              </Text>
            </Heading>
            <Text color={useColorModeValue('gray.500', 'gray.300')} fontSize={'xl'} mt={4}>
              CipherNest provides end-to-end encrypted messaging with automatic message expiration,
              military-grade encryption, and blockchain-powered security. Your privacy is our priority.
            </Text>
          </MotionBox>
          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={{ base: 'column', sm: 'row' }}
          >
            <Button
              rounded={'full'}
              size={'lg'}
              fontWeight={'normal'}
              px={6}
              colorScheme={'blue'}
              bg={'blue.400'}
              _hover={{ bg: 'blue.500' }}
              onClick={onGetStarted}
            >
              Get Started
            </Button>
            <Button
              rounded={'full'}
              size={'lg'}
              fontWeight={'normal'}
              px={6}
              leftIcon={<Icon name="shield" />}
            >
              Learn Security Features
            </Button>
          </Stack>
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
            height={'300px'}
            rounded={'2xl'}
            boxShadow={'2xl'}
            width={'full'}
            overflow={'hidden'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image
              alt={'Hero Image'}
              fit={'cover'}
              align={'center'}
              w={'100%'}
              h={'100%'}
              src={'/hero-image.png'}
            />
          </MotionBox>
        </Flex>
      </Stack>
    </Container>
  );
}
