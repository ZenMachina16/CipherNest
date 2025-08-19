'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SecureSession, generateECDHKeyPair, type RatchetMessage } from '@/lib/crypto';

interface SessionPair {
  alice: SecureSession;
  bob: SecureSession;
}

export function RatchetDemo() {
  const [sessions, setSessions] = useState<SessionPair | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [conversation, setConversation] = useState<Array<{
    sender: 'Alice' | 'Bob';
    message: string;
    messageNumber: number;
    timestamp: number;
  }>>([]);
  const [status, setStatus] = useState<string>('');

  const initializeSessions = async () => {
    try {
      setIsInitializing(true);
      setStatus('🔄 Initializing Double Ratchet sessions...');

      // Generate initial key pairs for both parties
      const aliceKeyPair = generateECDHKeyPair();
      const bobKeyPair = generateECDHKeyPair();

      // Create initial root key (would normally come from X3DH handshake)
      const initialRootKey = crypto.getRandomValues(new Uint8Array(32));

      // Initialize Alice's session (sender first)
      const alice = new SecureSession(
        initialRootKey,
        aliceKeyPair,
        bobKeyPair.publicKey,
        true
      );

      // Initialize Bob's session (receiver)
      const bob = new SecureSession(
        initialRootKey,
        bobKeyPair,
        aliceKeyPair.publicKey,
        false
      );

      setSessions({ alice, bob });
      setConversation([]);
      setStatus('✅ Double Ratchet sessions initialized! Ready for secure messaging.');

    } catch (error) {
      setStatus(`❌ Error initializing sessions: ${error}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const sendMessage = async (sender: 'Alice' | 'Bob') => {
    if (!sessions || !messageText.trim()) return;

    try {
      const senderSession = sender === 'Alice' ? sessions.alice : sessions.bob;
      const receiverSession = sender === 'Alice' ? sessions.bob : sessions.alice;

      setStatus(`🔒 ${sender} encrypting message...`);

      // Encrypt the message
      const encryptedMessage = await senderSession.encrypt(messageText);

      setStatus(`📤 Message encrypted, sending to ${sender === 'Alice' ? 'Bob' : 'Alice'}...`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Decrypt the message
      const decryptedMessage = await receiverSession.decrypt(encryptedMessage);

      // Add to conversation
      const newMessage = {
        sender,
        message: decryptedMessage,
        messageNumber: encryptedMessage.header.messageNumber,
        timestamp: Date.now(),
      };

      setConversation(prev => [...prev, newMessage]);
      setMessageText('');
      
      const senderInfo = senderSession.getSessionInfo();
      const receiverInfo = receiverSession.getSessionInfo();
      
      setStatus(
        `✅ Message sent! Alice: ${senderInfo.sendingMessageNumber} sent, ${senderInfo.receivingMessageNumber} received | ` +
        `Bob: ${receiverInfo.sendingMessageNumber} sent, ${receiverInfo.receivingMessageNumber} received`
      );

    } catch (error) {
      setStatus(`❌ Error sending message: ${error}`);
    }
  };

  const testOutOfOrderMessages = async () => {
    if (!sessions) return;

    try {
      setStatus('🔄 Testing out-of-order message handling...');

      // Alice sends 3 messages
      const messages: RatchetMessage[] = [];
      for (let i = 1; i <= 3; i++) {
        const msg = await sessions.alice.encrypt(`Message ${i} from Alice`);
        messages.push(msg);
      }

      // Bob receives them out of order (3, 1, 2)
      const outOfOrderMessages = [messages[2], messages[0], messages[1]];
      const decryptedMessages: string[] = [];

      for (const msg of outOfOrderMessages) {
        const decrypted = await sessions.bob.decrypt(msg);
        decryptedMessages.push(decrypted);
      }

      // Add all messages to conversation
      decryptedMessages.forEach((msg, index) => {
        const newMessage = {
          sender: 'Alice' as const,
          message: `${msg} (received out-of-order)`,
          messageNumber: outOfOrderMessages[index].header.messageNumber,
          timestamp: Date.now() + index,
        };
        setConversation(prev => [...prev, newMessage]);
      });

      const bobInfo = sessions.bob.getSessionInfo();
      setStatus(`✅ Out-of-order test completed! Bob has ${bobInfo.skippedKeysCount} skipped keys stored.`);

    } catch (error) {
      setStatus(`❌ Out-of-order test failed: ${error}`);
    }
  };

  const getSessionStats = () => {
    if (!sessions) return null;

    const aliceInfo = sessions.alice.getSessionInfo();
    const bobInfo = sessions.bob.getSessionInfo();

    return { aliceInfo, bobInfo };
  };

  const stats = getSessionStats();

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-card">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">🔄 Double Ratchet Demo</h3>
        <p className="text-sm text-muted-foreground">
          Test perfect forward secrecy with the Double Ratchet algorithm
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={initializeSessions}
            disabled={isInitializing}
            className="flex-1"
          >
            {isInitializing ? '🔄 Initializing...' : '🔑 Initialize Sessions'}
          </Button>
          
          <Button 
            onClick={testOutOfOrderMessages}
            disabled={!sessions}
            variant="outline"
          >
            🔀 Test Out-of-Order
          </Button>
        </div>

        {sessions && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && messageText.trim()) {
                    sendMessage('Alice');
                  }
                }}
              />
              <Button 
                onClick={() => sendMessage('Alice')}
                disabled={!messageText.trim()}
              >
                Alice → Bob
              </Button>
              <Button 
                onClick={() => sendMessage('Bob')}
                disabled={!messageText.trim()}
                variant="outline"
              >
                Bob → Alice
              </Button>
            </div>

            {/* Session Statistics */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                <div>
                  <h4 className="font-medium text-blue-600">👩 Alice's Session</h4>
                  <div className="text-sm space-y-1">
                    <p>Sent: {stats.aliceInfo.sendingMessageNumber} messages</p>
                    <p>Received: {stats.aliceInfo.receivingMessageNumber} messages</p>
                    <p>Skipped keys: {stats.aliceInfo.skippedKeysCount}</p>
                    <p>Chains: {stats.aliceInfo.hasSendingChain ? '✅' : '❌'} Send, {stats.aliceInfo.hasReceivingChain ? '✅' : '❌'} Receive</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-green-600">👨 Bob's Session</h4>
                  <div className="text-sm space-y-1">
                    <p>Sent: {stats.bobInfo.sendingMessageNumber} messages</p>
                    <p>Received: {stats.bobInfo.receivingMessageNumber} messages</p>
                    <p>Skipped keys: {stats.bobInfo.skippedKeysCount}</p>
                    <p>Chains: {stats.bobInfo.hasSendingChain ? '✅' : '❌'} Send, {stats.bobInfo.hasReceivingChain ? '✅' : '❌'} Receive</p>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Display */}
            {conversation.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">💬 Secure Conversation</h4>
                <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-muted rounded-md">
                  {conversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md text-sm ${
                        msg.sender === 'Alice'
                          ? 'bg-blue-100 text-blue-800 ml-8'
                          : 'bg-green-100 text-green-800 mr-8'
                      }`}
                    >
                      <div className="font-medium">{msg.sender} (msg #{msg.messageNumber}):</div>
                      <div>{msg.message}</div>
                      <div className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {status && (
          <div className="p-3 rounded-md bg-muted">
            <p className="text-sm">{status}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>🔐 <strong>Double Ratchet Features:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Perfect Forward Secrecy - Past messages stay secure even if current keys are compromised</li>
          <li>Post-Compromise Security - Future messages are secure after key recovery</li>
          <li>Out-of-Order Delivery - Messages can arrive in any order and still be decrypted</li>
          <li>Continuous Key Rotation - New keys for every message</li>
        </ul>
      </div>
    </div>
  );
}
