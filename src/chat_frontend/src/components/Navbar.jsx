import React from 'react';
import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  Image,
  Text,
  Container,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FiUser, FiSettings, FiShield } from 'react-icons/fi';

export default function Navbar({ isAuthenticated, onLogin, onLogout }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={navBg}
      px={4}
      position="fixed"
      w="100%"
      top={0}
      zIndex={100}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Flex alignItems={'center'}>
            <Image src="/logo.png" h={8} mr={2} />
            <Text
              fontSize="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
              bgClip="text"
            >
              CipherNest
            </Text>
          </Flex>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode} size="sm">
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>

              {isAuthenticated ? (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiUser />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem icon={<FiShield />}>Security Dashboard</MenuItem>
                    <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                    <MenuItem onClick={onLogout}>Sign Out</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button
                  onClick={onLogin}
                  colorScheme="blue"
                  size="sm"
                  fontWeight="medium"
                >
                  Sign In
                </Button>
              )}
            </Stack>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
