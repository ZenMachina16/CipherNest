'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateUserIdentity, createPreKeyBundle, validateUserIdentity, bytesToHex, type UserIdentity } from '@/lib/crypto';

export function CryptoDemo() {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState<string>('');

  const handleGenerateIdentity = async () => {
    try {
      setIsGenerating(true);
      setStatus('🔐 Generating post-quantum cryptographic keys...');
      
      const newIdentity = await generateUserIdentity(userId || undefined);
      setIdentity(newIdentity);
      
      const isValid = validateUserIdentity(newIdentity);
      setStatus(isValid ? '✅ Identity generated and validated successfully!' : '❌ Identity validation failed');
      
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePreKeyBundle = () => {
    if (!identity) return;
    
    try {
      const bundle = createPreKeyBundle(identity, 'Demo device');
      setStatus('📦 PreKeyBundle created successfully!');
      console.log('PreKeyBundle:', {
        kyber_pub_length: bundle.kyber_pub.length,
        ecdh_pub_length: bundle.ecdh_pub.length,
        dilithium_pub_length: bundle.dilithium_pub.length,
        signature_length: bundle.signature.length,
        created_at: bundle.created_at.toString(),
        expires_at: bundle.expires_at,
        note: bundle.note,
      });
    } catch (error) {
      setStatus(`❌ Error creating bundle: ${error}`);
    }
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-card">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">🔐 Post-Quantum Crypto Demo</h3>
        <p className="text-sm text-muted-foreground">
          Test the hybrid PQC/ECC cryptographic key generation for CipherNest
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="userId" className="text-sm font-medium">
            User ID (optional)
          </label>
          <Input
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID or leave blank for auto-generation"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateIdentity}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? '🔄 Generating...' : '🔑 Generate Identity'}
          </Button>
          
          <Button 
            onClick={handleCreatePreKeyBundle}
            disabled={!identity}
            variant="outline"
          >
            📦 Create Bundle
          </Button>
        </div>

        {status && (
          <div className="p-3 rounded-md bg-muted">
            <p className="text-sm">{status}</p>
          </div>
        )}

        {identity && (
          <div className="space-y-3">
            <h4 className="font-medium">Generated Keys:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-medium text-blue-600">🔮 Kyber (PQC KEM)</p>
                <p>Public: {identity.kyberKeyPair.publicKey.length} bytes</p>
                <p>Private: {identity.kyberKeyPair.privateKey.length} bytes</p>
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {bytesToHex(identity.kyberKeyPair.publicKey).substring(0, 32)}...
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-green-600">🔐 ECDH (Curve25519)</p>
                <p>Public: {identity.ecdhKeyPair.publicKey.length} bytes</p>
                <p>Private: {identity.ecdhKeyPair.privateKey.length} bytes</p>
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {bytesToHex(identity.ecdhKeyPair.publicKey)}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-purple-600">✍️ Dilithium (PQC Sig)</p>
                <p>Public: {identity.dilithiumKeyPair.publicKey.length} bytes</p>
                <p>Private: {identity.dilithiumKeyPair.privateKey.length} bytes</p>
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {bytesToHex(identity.dilithiumKeyPair.publicKey).substring(0, 32)}...
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-sm">
                <span className="font-medium">User ID:</span> {identity.userId}
              </p>
              <p className="text-sm">
                <span className="font-medium">Created:</span> {new Date(identity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>⚠️ <strong>Note:</strong> This demo uses simulated PQC algorithms for development.</p>
        <p>In production, this would use actual CRYSTALS-Kyber and CRYSTALS-Dilithium implementations.</p>
      </div>
    </div>
  );
}
