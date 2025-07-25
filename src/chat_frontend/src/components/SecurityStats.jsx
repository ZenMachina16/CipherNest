import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function SecurityStats() {
  const stats = [
    { label: 'Bits of Encryption', number: '256' },
    { label: 'Message TTL', number: '24h' },
    { label: 'Encryption Algorithms', number: '3+' },
    { label: 'Security Score', number: '99%' },
  ];

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} p={10}>
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
          {stats.map((stat, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Stat
                px={{ base: 2, md: 4 }}
                py={'5'}
                shadow={'xl'}
                border={'1px solid'}
                borderColor={useColorModeValue('gray.800', 'gray.500')}
                rounded={'lg'}
                bg={useColorModeValue('white', 'gray.800')}
              >
                <StatLabel 
                  fontWeight={'medium'} 
                  isTruncated
                  color={useColorModeValue('gray.500', 'gray.400')}
                >
                  {stat.label}
                </StatLabel>
                <StatNumber
                  fontSize={'2xl'}
                  fontWeight={'bold'}
                  bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
                  bgClip="text"
                >
                  {stat.number}
                </StatNumber>
              </Stat>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
