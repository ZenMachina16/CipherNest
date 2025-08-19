'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Lock, Shield, Clock, ArrowLeft, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { 
  useCipherNestStore,
  useCipherNestActions,
  useUserIdentity,
  useSessionMessages,
  useSessionStatus,
  useConnectionStatus,
  useUIState,
  type ChatMessage
} from '@/lib/store';

export default function ChatPage() {
  const params = useParams();
  const principalString = params.principal as string;
  
  // Zustand store hooks
  const user = useUserIdentity();
  const messages = useSessionMessages(principalString);
  const sessionStatus = useSessionStatus(principalString);
  const connection = useConnectionStatus();
  const ui = useUIState();
  
  const {
    generateUserIdentity,
    registerUserKeys,
    initializeSession,
    sendMessage,
    pollMessages,
    setActiveSession,
    setUIState,
  } = useCipherNestActions();
  
  // Local state
  const [messageText, setMessageText] = React.useState('');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize user identity and session
  const initializeUserAndSession = useCallback(async () => {
    try {
      // Generate user identity if not present
      if (!user.identity && !user.isIdentityLoaded) {
        await generateUserIdentity();
      }
      
      // Register keys if identity exists but not registered
      if (user.identity && user.registrationStatus === 'none') {
        await registerUserKeys();
      }
      
      // Initialize session if user is registered
      if (user.registrationStatus === 'registered' && !sessionStatus.isInitialized) {
        await initializeSession(principalString);
        setActiveSession(principalString);
      }
    } catch (error) {
      console.error('❌ Failed to initialize user and session:', error);
    }
  }, [
    user.identity, 
    user.isIdentityLoaded, 
    user.registrationStatus, 
    sessionStatus.isInitialized,
    principalString,
    generateUserIdentity,
    registerUserKeys,
    initializeSession,
    setActiveSession
  ]);

  // Initialize on mount
  useEffect(() => {
    initializeUserAndSession();
  }, [initializeUserAndSession]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || ui.isEncrypting || !sessionStatus.isInitialized) return;

    try {
      await sendMessage(principalString, messageText);
      setMessageText('');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };

  // Set up message polling
  useEffect(() => {
    if (!sessionStatus.isInitialized) return;

    console.log('🔄 Starting message polling...');
    
    // Poll immediately
    pollMessages(principalString);
    
    // Set up interval polling every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollMessages(principalString);
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('🛑 Stopped message polling');
      }
    };
  }, [sessionStatus.isInitialized, principalString, pollMessages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length > 20) {
      return `${principal.slice(0, 8)}...${principal.slice(-8)}`;
    }
    return principal;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {principalString.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="font-semibold text-lg">
              {formatPrincipal(principalString)}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {sessionStatus.initError ? (
                <>
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">Connection Failed</span>
                </>
              ) : sessionStatus.isInitialized ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Secure Session Active</span>
                  {sessionStatus.isPolling && <span className="text-xs">• Syncing</span>}
                </>
              ) : user.registrationStatus === 'pending' ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Registering Keys...</span>
                </>
              ) : !user.isIdentityLoaded ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Generating Identity...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Initializing Encryption...</span>
                </>
              )}
            </div>
            {sessionStatus.lastPolled > 0 && (
              <div className="text-xs text-muted-foreground">
                Last synced: {new Date(sessionStatus.lastPolled).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Security Indicators */}
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>PQC</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Lock className="h-3 w-3" />
            <span>E2E</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>24h</span>
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {sessionStatus.initError || user.registrationError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-red-600">Connection Failed</h3>
                <p className="text-muted-foreground max-w-md">
                  {sessionStatus.initError || user.registrationError}
                </p>
                <Button 
                  onClick={initializeUserAndSession} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : !sessionStatus.isInitialized ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Initializing Secure Session</h3>
                <p className="text-muted-foreground">
                  {!user.isIdentityLoaded ? 'Generating cryptographic keys...' :
                   user.registrationStatus === 'pending' ? 'Registering with canister...' :
                   'Setting up post-quantum encryption...'}
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Chat Ready</h3>
                <p className="text-muted-foreground">
                  All messages are end-to-end encrypted with post-quantum cryptography
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Messages automatically delete after 24 hours
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 space-y-1 ${
                    message.error 
                      ? 'bg-red-100 border border-red-200'
                      : message.isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className={`text-sm leading-relaxed ${
                    message.error ? 'text-red-800' : ''
                  }`}>
                    {message.content}
                  </p>
                  {message.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {message.error}
                    </p>
                  )}
                  <div className={`flex items-center justify-between text-xs ${
                    message.error 
                      ? 'text-red-700'
                      : message.isOwnMessage 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    <div className="flex items-center space-x-1">
                      {message.error ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : message.isEncrypted ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <WifiOff className="h-3 w-3" />
                      )}
                      {message.messageNumber && (
                        <span>#{message.messageNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              sessionStatus.initError || user.registrationError
                ? "Connection failed - cannot send messages"
                : !sessionStatus.isInitialized 
                ? "Initializing encryption..."
                : "Type your secure message..."
            }
            disabled={!sessionStatus.isInitialized || ui.isEncrypting}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !sessionStatus.isInitialized || ui.isEncrypting}
            size="icon"
          >
            {ui.isEncrypting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className={`flex items-center space-x-1 ${
              sessionStatus.isInitialized ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              <Shield className="h-3 w-3" />
              <span>Post-quantum encrypted</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Auto-delete in 24h</span>
            </span>
            {sessionStatus.isInitialized && (
              <span className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>Polling every 3s</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {ui.isEncrypting && (
              <span className="text-primary">Encrypting...</span>
            )}
            {(sessionStatus.initError || user.registrationError) && (
              <span className="text-red-600">Connection failed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
