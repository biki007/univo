'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  quantumEncryptionService, 
  type QuantumChannel, 
  type QuantumKeyPair,
  type QuantumAlgorithm,
  getAlgorithmInfo,
  getSecurityLevelDescription,
  validateQuantumSafety,
  estimateQuantumThreatTimeline
} from '@/lib/quantum-encryption-service';

interface QuantumEncryptionProps {
  meetingId: string;
  participants: string[];
  onClose?: () => void;
}

const QuantumEncryption: React.FC<QuantumEncryptionProps> = ({
  meetingId,
  participants,
  onClose
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeChannel, setActiveChannel] = useState<QuantumChannel | null>(null);
  const [keyPairs, setKeyPairs] = useState<QuantumKeyPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showKeyGeneration, setShowKeyGeneration] = useState(false);
  
  // Channel configuration
  const [channelConfig, setChannelConfig] = useState({
    algorithm: 'CRYSTALS-Kyber' as QuantumAlgorithm,
    keyDistribution: 'BB84' as const,
    securityLevel: 3 as 1 | 3 | 5
  });

  // Key generation configuration
  const [keyConfig, setKeyConfig] = useState({
    algorithm: 'CRYSTALS-Kyber' as QuantumAlgorithm,
    securityLevel: 3 as 1 | 3 | 5,
    usage: ['keyEncipherment', 'digitalSignature'] as const
  });

  // Real-time metrics
  const [metrics, setMetrics] = useState({
    keyGenerationRate: 0,
    secureKeyRate: 0,
    quantumBitErrorRate: 0,
    eavesdroppingDetected: false,
    threatLevel: 'low' as const
  });

  useEffect(() => {
    initializeQuantumService();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  const initializeQuantumService = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const initialized = await quantumEncryptionService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize quantum encryption service');
      }

      setIsInitialized(true);
      
      // Load existing key pairs
      // In a real implementation, this would load from secure storage
      setKeyPairs([]);
      
    } catch (error) {
      console.error('Failed to initialize quantum encryption:', error);
      setError('Failed to initialize quantum encryption service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChannel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const channel = await quantumEncryptionService.establishChannel(
        participants,
        channelConfig.algorithm,
        channelConfig.keyDistribution
      );

      setActiveChannel(channel);
      setShowCreateChannel(false);
      
      // Start monitoring channel
      startChannelMonitoring(channel);
      
    } catch (error) {
      console.error('Failed to create quantum channel:', error);
      setError('Failed to establish quantum-secure channel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKeyPair = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const keyPair = await quantumEncryptionService.generateKeyPair(
        keyConfig.algorithm,
        keyConfig.securityLevel,
        [...keyConfig.usage]
      );

      setKeyPairs([...keyPairs, keyPair]);
      setShowKeyGeneration(false);
      
    } catch (error) {
      console.error('Failed to generate key pair:', error);
      setError('Failed to generate quantum-safe key pair');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateChannel = async () => {
    try {
      if (!activeChannel) return;

      await quantumEncryptionService.terminateChannel(activeChannel.id);
      setActiveChannel(null);
      
    } catch (error) {
      console.error('Failed to terminate channel:', error);
      setError('Failed to terminate quantum channel');
    }
  };

  const startChannelMonitoring = (channel: QuantumChannel) => {
    // Mock real-time monitoring
    setMetrics({
      keyGenerationRate: channel.security.keyGenerationRate,
      secureKeyRate: channel.security.secureKeyRate,
      quantumBitErrorRate: channel.security.quantumBitErrorRate,
      eavesdroppingDetected: channel.security.eavesdroppingDetected,
      threatLevel: channel.security.threatLevel as 'low'
    });
  };

  const updateMetrics = () => {
    if (!activeChannel) return;

    // Mock real-time updates
    setMetrics(prev => ({
      ...prev,
      keyGenerationRate: prev.keyGenerationRate + (Math.random() - 0.5) * 10,
      secureKeyRate: prev.secureKeyRate + (Math.random() - 0.5) * 8,
      quantumBitErrorRate: Math.max(0, prev.quantumBitErrorRate + (Math.random() - 0.5) * 0.001)
    }));
  };

  const getAlgorithmBadgeColor = (algorithm: QuantumAlgorithm): string => {
    const standardized = ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium', 'FALCON', 'SPHINCS+'];
    return standardized.includes(algorithm) ? 'success' : 'warning';
  };

  const getThreatLevelColor = (level: string): string => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'secondary';
    }
  };

  const threatTimeline = estimateQuantumThreatTimeline();
  const currentYear = new Date().getFullYear();
  const yearsUntilThreat = threatTimeline.cryptographicallyRelevant - currentYear;

  if (isLoading && !isInitialized) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span>Initializing quantum encryption...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Quantum Encryption</h2>
            {activeChannel && (
              <Badge variant="success">Secure Channel Active</Badge>
            )}
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-4 h-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-center p-3 mt-4 space-x-2 border border-red-200 rounded-lg bg-red-50">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </Card>

      {/* Quantum Threat Timeline */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Quantum Threat Timeline</h3>
          </div>
          
          <div className="p-4 rounded-lg bg-orange-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Cryptographically Relevant Quantum Computer</span>
              <Badge variant={yearsUntilThreat <= 10 ? 'error' : 'warning'}>
                ~{threatTimeline.cryptographicallyRelevant}
              </Badge>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 transition-all duration-300 bg-orange-600 rounded-full"
                style={{ width: `${Math.max(10, 100 - (yearsUntilThreat / 20) * 100)}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Estimated {yearsUntilThreat} years until quantum computers can break current encryption
            </p>
          </div>
        </div>
      </Card>

      {/* Channel Status */}
      {!activeChannel ? (
        <Card className="p-6">
          <div className="space-y-4 text-center">
            <LockClosedIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="text-lg font-semibold">No Quantum Channel Active</h3>
            <p className="text-gray-600">
              Establish a quantum-secure communication channel for this meeting.
            </p>
            <Button onClick={() => setShowCreateChannel(true)}>
              <SignalIcon className="w-4 h-4 mr-2" />
              Create Quantum Channel
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Active Channel Info */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Quantum Channel</h3>
                <Button size="sm" variant="destructive" onClick={handleTerminateChannel}>
                  Terminate Channel
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Algorithm</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900">{activeChannel.algorithm}</span>
                    <Badge variant={getAlgorithmBadgeColor(activeChannel.algorithm) as any} size="sm">
                      {getAlgorithmInfo(activeChannel.algorithm).standardized ? 'NIST' : 'Experimental'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Key Distribution</label>
                  <p className="text-gray-900">{activeChannel.keyDistribution}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Participants</label>
                  <p className="text-gray-900">{activeChannel.participants.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge variant={activeChannel.status === 'active' ? 'success' : 'warning'}>
                    {activeChannel.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Real-time Metrics */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Channel Metrics</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <CpuChipIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Key Generation Rate</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    {Math.round(metrics.keyGenerationRate)}
                  </p>
                  <p className="text-xs text-blue-600">keys/second</p>
                </div>

                <div className="p-4 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Secure Key Rate</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-green-900">
                    {Math.round(metrics.secureKeyRate)}
                  </p>
                  <p className="text-xs text-green-600">keys/second</p>
                </div>

                <div className="p-4 rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium">Quantum Bit Error Rate</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-yellow-900">
                    {(metrics.quantumBitErrorRate * 100).toFixed(3)}%
                  </p>
                  <p className="text-xs text-yellow-600">error rate</p>
                </div>

                <div className="p-4 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium">Threat Level</span>
                  </div>
                  <p className="mt-1">
                    <Badge variant={getThreatLevelColor(metrics.threatLevel) as any}>
                      {metrics.threatLevel.toUpperCase()}
                    </Badge>
                  </p>
                  <p className="text-xs text-red-600">
                    {metrics.eavesdroppingDetected ? 'Eavesdropping detected!' : 'Secure'}
                  </p>
                </div>
              </div>

              {metrics.eavesdroppingDetected && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Security Alert</span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    Potential eavesdropping detected. The quantum channel will automatically re-establish secure keys.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Key Management */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quantum Key Pairs</h3>
            <Button size="sm" onClick={() => setShowKeyGeneration(true)}>
              <KeyIcon className="w-4 h-4 mr-2" />
              Generate Key Pair
            </Button>
          </div>

          {keyPairs.length === 0 ? (
            <div className="py-8 text-center">
              <KeyIcon className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">No quantum key pairs generated</p>
              <p className="text-sm text-gray-500">Generate your first quantum-safe key pair</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keyPairs.map((keyPair) => (
                <div key={keyPair.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{keyPair.algorithm}</h4>
                        <Badge variant={keyPair.quantumSafe ? 'success' : 'error'} size="sm">
                          {keyPair.quantumSafe ? 'Quantum-Safe' : 'Classical'}
                        </Badge>
                        <Badge variant={keyPair.status === 'active' ? 'success' : 'secondary'} size="sm">
                          {keyPair.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Key Size: {keyPair.keySize} bits
                      </p>
                      <p className="text-sm text-gray-600">
                        Usage: {keyPair.usage.join(', ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {keyPair.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {keyPair.quantumSafe && (
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Create Channel Modal */}
      <Modal
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        title="Create Quantum Channel"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Quantum Algorithm</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={channelConfig.algorithm}
              onChange={(e) => setChannelConfig({ ...channelConfig, algorithm: e.target.value as QuantumAlgorithm })}
              aria-label="Select quantum algorithm"
            >
              <option value="CRYSTALS-Kyber">CRYSTALS-Kyber (NIST Standard)</option>
              <option value="CRYSTALS-Dilithium">CRYSTALS-Dilithium (NIST Standard)</option>
              <option value="FALCON">FALCON (NIST Standard)</option>
              <option value="SPHINCS+">SPHINCS+ (NIST Standard)</option>
              <option value="Classic-McEliece">Classic McEliece</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Key Distribution Method</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={channelConfig.keyDistribution}
              onChange={(e) => setChannelConfig({ ...channelConfig, keyDistribution: e.target.value as any })}
              aria-label="Select key distribution method"
            >
              <option value="BB84">BB84 Protocol</option>
              <option value="E91">E91 Protocol</option>
              <option value="SARG04">SARG04 Protocol</option>
              <option value="Decoy-State">Decoy State Method</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Security Level</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={channelConfig.securityLevel}
              onChange={(e) => setChannelConfig({ ...channelConfig, securityLevel: parseInt(e.target.value) as any })}
              aria-label="Select security level"
            >
              <option value={1}>Level 1 - {getSecurityLevelDescription(1)}</option>
              <option value={3}>Level 3 - {getSecurityLevelDescription(3)}</option>
              <option value={5}>Level 5 - {getSecurityLevelDescription(5)}</option>
            </select>
          </div>

          <div className="p-3 rounded-lg bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>Participants:</strong> {participants.length} users will be included in this quantum-secure channel.
            </p>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="ghost" onClick={() => setShowCreateChannel(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel} disabled={isLoading}>
              Create Secure Channel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Generate Key Pair Modal */}
      <Modal
        isOpen={showKeyGeneration}
        onClose={() => setShowKeyGeneration(false)}
        title="Generate Quantum Key Pair"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Algorithm</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={keyConfig.algorithm}
              onChange={(e) => setKeyConfig({ ...keyConfig, algorithm: e.target.value as QuantumAlgorithm })}
              aria-label="Select key algorithm"
            >
              <option value="CRYSTALS-Kyber">CRYSTALS-Kyber</option>
              <option value="CRYSTALS-Dilithium">CRYSTALS-Dilithium</option>
              <option value="FALCON">FALCON</option>
              <option value="SPHINCS+">SPHINCS+</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Security Level</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={keyConfig.securityLevel}
              onChange={(e) => setKeyConfig({ ...keyConfig, securityLevel: parseInt(e.target.value) as any })}
              aria-label="Select key security level"
            >
              <option value={1}>Level 1 - {getSecurityLevelDescription(1)}</option>
              <option value={3}>Level 3 - {getSecurityLevelDescription(3)}</option>
              <option value={5}>Level 5 - {getSecurityLevelDescription(5)}</option>
            </select>
          </div>

          {/* Security Assessment */}
          <div className="p-3 rounded-lg bg-green-50">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Quantum Safety Assessment</span>
            </div>
            <div className="mt-2 text-sm text-green-700">
              {(() => {
                const safety = validateQuantumSafety(keyConfig.algorithm, keyConfig.securityLevel);
                return (
                  <div>
                    <p><strong>Quantum Safe:</strong> {safety.isQuantumSafe ? 'Yes' : 'No'}</p>
                    <p><strong>Risk Level:</strong> {safety.riskLevel}</p>
                    <p><strong>Recommended Until:</strong> {safety.recommendedUntil}</p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="ghost" onClick={() => setShowKeyGeneration(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateKeyPair} disabled={isLoading}>
              Generate Key Pair
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuantumEncryption;