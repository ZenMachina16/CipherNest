'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Lock, Shield, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  timestamp: number;
  isOwnMessage: boolean;
  isEncrypted: boolean;
  messageNumber?: number;
}

export default function ChatPage() {
  const params = useParams();
  const principal = params.principal as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Simulate connection status
  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isEncrypting) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: messageText,
      timestamp: Date.now(),
      isOwnMessage: true,
      isEncrypted: true,
      messageNumber: messages.length + 1,
    };

    try {
      setIsEncrypting(true);
      
      // Simulate encryption delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Simulate receiving a response after 2 seconds
      setTimeout(() => {
        const responseMessage: Message = {
          id: `msg-${Date.now()}-response`,
          content: `Echo: ${newMessage.content}`,
          timestamp: Date.now(),
          isOwnMessage: false,
          isEncrypted: true,
          messageNumber: messages.length + 2,
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsEncrypting(false);
    }
  };

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
              {principal.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="font-semibold text-lg">
              {formatPrincipal(principal)}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
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
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Chat Initialized</h3>
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
                    message.isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className={`flex items-center justify-between text-xs ${
                    message.isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    <div className="flex items-center space-x-1">
                      {message.isEncrypted && (
                        <Lock className="h-3 w-3" />
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
            placeholder="Type your secure message..."
            disabled={!isConnected || isEncrypting}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !isConnected || isEncrypting}
            size="icon"
          >
            {isEncrypting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Post-quantum encrypted</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Auto-delete in 24h</span>
            </span>
          </div>
          
          {isEncrypting && (
            <span className="text-primary">Encrypting message...</span>
          )}
        </div>
      </div>
    </div>
  );
}
