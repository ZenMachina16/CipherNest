import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  useToast,
  extendTheme,
  ChakraProvider,
} from '@chakra-ui/react';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SecurityStats from './components/SecurityStats';
import Footer from './components/Footer';
import Chat from './components/Chat';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useToast();

  const handleLogin = () => {
    setIsAuthenticated(true);
    toast({
      title: "Authentication",
      description: "You are now signed in to CipherNest",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Authentication",
      description: "You have been signed out",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
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
        <Box minH="100vh" bg="gray.50">
          <Navbar 
            isAuthenticated={isAuthenticated} 
            onLogin={handleLogin} 
            onLogout={handleLogout} 
          />
          
          <Routes>
            <Route 
              path="/" 
              element={
                <Box>
                  <Hero onGetStarted={handleGetStarted} />
                  <Features />
                  <SecurityStats />
                  <Footer />
                </Box>
              } 
            />
            <Route 
              path="/chat" 
              element={
                isAuthenticated ? (
                  <Chat actor={null} />
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