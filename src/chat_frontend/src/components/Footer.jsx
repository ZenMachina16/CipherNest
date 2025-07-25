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
} from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt={10}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Image src="/logo.png" h={8} />
              <Text
                fontSize="lg"
                fontWeight="bold"
                bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
                bgClip="text"
                mt={2}
              >
                CipherNest
              </Text>
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
