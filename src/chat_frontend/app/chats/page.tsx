'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Plus, Search, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock chat data
const mockChats = [
  {
    principal: 'rdmx6-jaaaa-aaaaa-aaadq-cai',
    lastMessage: 'Hello! How are you?',
    timestamp: Date.now() - 300000, // 5 minutes ago
    unreadCount: 2,
    isOnline: true,
  },
  {
    principal: 'rrkah-fqaaa-aaaah-qcuxa-cai',
    lastMessage: 'Thanks for the secure message!',
    timestamp: Date.now() - 3600000, // 1 hour ago
    unreadCount: 0,
    isOnline: false,
  },
  {
    principal: 'renrk-eyaaa-aaaah-qcuza-cai',
    lastMessage: 'The quantum encryption is working perfectly',
    timestamp: Date.now() - 86400000, // 1 day ago
    unreadCount: 1,
    isOnline: true,
  },
];

export default function ChatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatPrincipal, setNewChatPrincipal] = useState('');

  const formatPrincipal = (principal: string) => {
    if (principal.length > 20) {
      return `${principal.slice(0, 8)}...${principal.slice(-8)}`;
    }
    return principal;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const filteredChats = mockChats.filter(chat =>
    chat.principal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">CipherNest Chats</h1>
          <p className="text-muted-foreground">Post-quantum secure messaging</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>PQC Enabled</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>24h Ephemeral</span>
          </Badge>
        </div>
      </div>

      {/* Search and New Chat */}
      <div className="space-y-4 mb-6">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats by principal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Start New Secure Chat</span>
            </CardTitle>
            <CardDescription>
              Enter a principal ID to start an end-to-end encrypted conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter principal ID (e.g., rdmx6-jaaaa-aaaaa-aaadq-cai)"
                value={newChatPrincipal}
                onChange={(e) => setNewChatPrincipal(e.target.value)}
                className="flex-1"
              />
              <Link href={`/(chat)/${newChatPrincipal}`}>
                <Button disabled={!newChatPrincipal.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat List */}
      <div className="space-y-2">
        {filteredChats.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No chats found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? 'Try adjusting your search query' : 'Start a new secure conversation above'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredChats.map((chat) => (
            <Link key={chat.principal} href={`/(chat)/${chat.principal}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center space-x-4 p-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {chat.principal.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                      chat.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">
                        {formatPrincipal(chat.principal)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chat.timestamp)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <Badge variant="default" className="px-2 py-1 text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center space-x-1 ml-2">
                        <Lock className="h-3 w-3 text-green-600" />
                        <Shield className="h-3 w-3 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Lock className="h-4 w-4" />
            <span>End-to-end encrypted</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>Post-quantum secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Messages auto-delete in 24h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
