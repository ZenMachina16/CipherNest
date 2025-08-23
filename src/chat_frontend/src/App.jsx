import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  useToast,
  extendTheme,
  ChakraProvider,
  useColorModeValue,
} from '@chakra-ui/react';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SecurityStats from './components/SecurityStats';
import Footer from './components/Footer';
import Chat from './components/Chat';
import UserSimulator from './components/UserSimulator';

// Theme customization
const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user was previously authenticated
    return localStorage.getItem('ciphernest_authenticated') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    // Get current user from localStorage or default to Alice
    const savedUser = localStorage.getItem('ciphernest_current_user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return {
      id: 'user1',
      name: 'Alice Johnson',
      principalId: 'uxrrr-q7777-77774-qaaaq-cai',
      avatar: '👩‍💻',
      status: 'online',
      role: 'Security Analyst',
    };
  });
  
  const toast = useToast();

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Persist authentication state
    localStorage.setItem('ciphernest_authenticated', 'true');
    toast({
      title: "Authentication",
      description: "You are now signed in to CipherNest",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    // Redirect to chat immediately after login
    setTimeout(() => {
      // Use window.location for now to avoid router issues
      window.location.href = '/chat';
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Clear authentication state
    localStorage.removeItem('ciphernest_authenticated');
    localStorage.removeItem('ciphernest_current_user');
    toast({
      title: "Authentication",
      description: "You have been signed out",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUserChange = (newUser) => {
    setCurrentUser(newUser);
    localStorage.setItem('ciphernest_current_user', JSON.stringify(newUser));
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      handleLogin();
    }
    // Navigate to chat after a short delay to show the toast
    setTimeout(() => {
      window.location.href = '/chat';
    }, 1500);
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" bgGradient={useColorModeValue(
          'linear(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          'linear(135deg, #1a202c 0%, #2d3748 25%, #4a5568 50%, #718096 75%, #a0aec0 100%)'
        )}>
          <Navbar 
            isAuthenticated={isAuthenticated} 
            onLogin={handleLogin} 
            onLogout={handleLogout}
            currentUser={currentUser}
            onUserChange={handleUserChange}
          />
          
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/chat" replace />
                ) : (
                  <Box>
                    <Hero onGetStarted={handleGetStarted} />
                    <Features />
                    <SecurityStats />
                    <Footer />
                  </Box>
                )
              } 
            />
            <Route 
              path="/chat" 
              element={
                isAuthenticated ? (
                  <Chat actor={null} currentUser={currentUser} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;