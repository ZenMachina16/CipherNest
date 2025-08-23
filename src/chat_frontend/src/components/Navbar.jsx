import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Container,
  useColorMode,
  useColorModeValue,
  Image,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FiUser, FiSettings, FiShield, FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import UserSimulator from './UserSimulator';
import logo from '../../asset/logo.png';

export default function Navbar({ isAuthenticated, onLogin, onLogout, currentUser, onUserChange }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const logoBg = useColorModeValue('blue.500', 'blue.400');
  const navigate = useNavigate();

  return (
    <Box
      bg={navBg}
      px={4}
      position="fixed"
      w="100%"
      top={0}
      zIndex={1000}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Flex alignItems={'center'} cursor="pointer" onClick={() => navigate('/')}>
            <Box
              bg="white"
              p={2}
              borderRadius="lg"
              mr={3}
              boxShadow="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w={10}
              h={10}
            >
              <Image src={logo} h={8} w={8} alt="CipherNest Logo" objectFit="contain" />
            </Box>
                          <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)"
                bgClip="text"
                _hover={{
                  bgGradient: "linear(to-r, #764ba2, #f093fb, #f5576c, #4facfe, #667eea)",
                }}
                transition="all 0.3s"
              >
                CipherNest
              </Text>
          </Flex>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode} size="sm">
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>

              {isAuthenticated && (
                <UserSimulator 
                  currentUser={currentUser}
                  onUserChange={onUserChange}
                />
              )}

              {isAuthenticated ? (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiUser />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem icon={<FiMessageCircle />} onClick={() => navigate('/chat')}>
                      Chat
                    </MenuItem>
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
