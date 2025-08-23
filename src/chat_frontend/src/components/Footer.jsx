import React from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
  Image,
  HStack,
} from '@chakra-ui/react';
import logo from '../../asset/logo.png';

export default function Footer() {
  return (
    <Box
      bgGradient="linear(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)"
      color="white"
      mt={10}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <HStack spacing={3}>
                <Box
                  bg="white"
                  p={2}
                  borderRadius="xl"
                  boxShadow="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w={10}
                  h={10}
                >
                  <Image src={logo} h={6} w={6} alt="CipherNest Logo" objectFit="contain" />
                </Box>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="white"
                  textShadow="1px 1px 2px rgba(0,0,0,0.3)"
                >
                  CipherNest
                </Text>
              </HStack>
            </Box>
            <Text fontSize={'sm'}>
              © 2025 CipherNest. All rights reserved
            </Text>
          </Stack>
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
              Product
            </Text>
            <Link href={'#'}>Overview</Link>
            <Link href={'#'}>Features</Link>
            <Link href={'#'}>Security</Link>
            <Link href={'#'}>Pricing</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
              Company
            </Text>
            <Link href={'#'}>About</Link>
            <Link href={'#'}>Press</Link>
            <Link href={'#'}>Careers</Link>
            <Link href={'#'}>Contact</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
              Legal
            </Text>
            <Link href={'#'}>Privacy Policy</Link>
            <Link href={'#'}>Terms of Service</Link>
            <Link href={'#'}>Security Policy</Link>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
