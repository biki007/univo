'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  ShieldCheckIcon,
  IdentificationIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  blockchainIdentityService, 
  type BlockchainIdentity,
  VerifiableCredential, 
  CredentialType,
  getCredentialTypeLabel,
  isCredentialExpired,
  getCredentialValidityPeriod
} from '@/lib/blockchain-identity-service';

interface BlockchainIdentityProps {
  userId: string;
  onClose?: () => void;
}

const BlockchainIdentity: React.FC<BlockchainIdentityProps> = ({
  userId,
  onClose
}) => {
  const [identity, setIdentity] = useState<BlockchainIdentity | null>(null);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateIdentity, setShowCreateIdentity] = useState(false);
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [showShareCredential, setShowShareCredential] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null);
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    organization: '',
    title: '',
    bio: ''
  });
  
  const [credentialData, setCredentialData] = useState({
    type: 'professional_certification' as CredentialType,
    title: '',
    issuer: '',
    description: '',
    skills: ''
  });

  useEffect(() => {
    loadIdentityData();
  }, [userId]);

  const loadIdentityData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize service if needed
      const initialized = await blockchainIdentityService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize blockchain identity service');
      }

      // Try to load existing identity
      const existingIdentity = await blockchainIdentityService.getCurrentIdentity();
      
      if (existingIdentity) {
        setIdentity(existingIdentity);
        const userCredentials = await blockchainIdentityService.getCredentials(existingIdentity.did);
        setCredentials(userCredentials);
      }
    } catch (error) {
      console.error('Failed to load identity data:', error);
      setError('Failed to load blockchain identity data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIdentity = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newIdentity = await blockchainIdentityService.createIdentity({
        name: profileData.name,
        email: profileData.email,
        organization: profileData.organization,
        title: profileData.title,
        bio: profileData.bio
      });

      setIdentity(newIdentity);
      setShowCreateIdentity(false);
      
      // Reset form
      setProfileData({
        name: '',
        email: '',
        organization: '',
        title: '',
        bio: ''
      });
    } catch (error) {
      console.error('Failed to create identity:', error);
      setError('Failed to create blockchain identity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredential = async () => {
    try {
      if (!identity) return;

      setIsLoading(true);
      setError(null);

      const credential = await blockchainIdentityService.issueCredential(
        identity.did,
        {
          type: credentialData.type,
          claims: [
            { property: 'title', value: credentialData.title, confidence: 1.0 },
            { property: 'issuer', value: credentialData.issuer, confidence: 1.0 },
            { property: 'description', value: credentialData.description, confidence: 1.0 },
            { property: 'skills', value: credentialData.skills.split(',').map(s => s.trim()), confidence: 1.0 }
          ],
          metadata: {
            category: credentialData.type,
            priority: 'medium',
            visibility: 'selective'
          }
        }
      );

      setCredentials([...credentials, credential]);
      setShowAddCredential(false);
      
      // Reset form
      setCredentialData({
        type: 'professional_certification',
        title: '',
        issuer: '',
        description: '',
        skills: ''
      });
    } catch (error) {
      console.error('Failed to add credential:', error);
      setError('Failed to add credential');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareCredential = async (credentialId: string, targetDid: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const requestId = await blockchainIdentityService.requestVerification(
        targetDid,
        [selectedCredential!.type],
        'Meeting verification',
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      );

      console.log('Verification request sent:', requestId);
      setShowShareCredential(false);
      setSelectedCredential(null);
    } catch (error) {
      console.error('Failed to share credential:', error);
      setError('Failed to share credential');
    } finally {
      setIsLoading(false);
    }
  };

  const getCredentialStatusColor = (credential: VerifiableCredential): string => {
    if (credential.status === 'revoked') return 'error';
    if (isCredentialExpired(credential)) return 'warning';
    if (credential.verificationStatus === 'verified') return 'success';
    return 'secondary';
  };

  const getReputationColor = (score: number): string => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'primary';
    if (score >= 0.4) return 'warning';
    return 'error';
  };

  if (isLoading && !identity) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span>Loading blockchain identity...</span>
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
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Blockchain Identity</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
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

      {!identity ? (
        /* Create Identity */
        <Card className="p-6">
          <div className="space-y-4 text-center">
            <IdentificationIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="text-lg font-semibold">No Blockchain Identity Found</h3>
            <p className="text-gray-600">
              Create a decentralized identity to manage your credentials and build trust in the metaverse.
            </p>
            <Button onClick={() => setShowCreateIdentity(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Identity
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Identity Overview */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Identity Overview</h3>
                <Badge variant={identity.isVerified ? 'success' : 'warning'}>
                  {identity.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{identity.profile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Organization</label>
                  <p className="text-gray-900">{identity.profile.organization || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">DID</label>
                  <p className="font-mono text-xs text-gray-600 break-all">{identity.did}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                  <p className="font-mono text-xs text-gray-600 break-all">{identity.walletAddress}</p>
                </div>
              </div>

              {/* Reputation Score */}
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Reputation Score</span>
                  <Badge variant={getReputationColor(identity.reputation.overall) as any}>
                    {Math.round(identity.reputation.overall * 100)}/100
                  </Badge>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                    style={{ width: `${identity.reputation.overall * 100}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Trust Level: {identity.reputation.trustLevel}
                </p>
              </div>
            </div>
          </Card>

          {/* Credentials */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Verifiable Credentials</h3>
                <Button size="sm" onClick={() => setShowAddCredential(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Credential
                </Button>
              </div>

              {credentials.length === 0 ? (
                <div className="py-8 text-center">
                  <AcademicCapIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">No credentials yet</p>
                  <p className="text-sm text-gray-500">Add your first credential to build trust</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {credentials.map((credential) => (
                    <div key={credential.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{getCredentialTypeLabel(credential.type)}</h4>
                            <Badge variant={getCredentialStatusColor(credential) as any} size="sm">
                              {credential.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            Issued by: {credential.issuer.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {getCredentialValidityPeriod(credential)}
                          </p>
                          
                          {/* Claims */}
                          <div className="mt-2">
                            {credential.claims.slice(0, 2).map((claim, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{claim.property}:</span>{' '}
                                <span className="text-gray-700">
                                  {Array.isArray(claim.value) ? claim.value.join(', ') : claim.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {credential.verificationStatus === 'verified' && (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCredential(credential);
                              setShowShareCredential(true);
                            }}
                          >
                            <ShareIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Create Identity Modal */}
      <Modal
        isOpen={showCreateIdentity}
        onClose={() => setShowCreateIdentity(false)}
        title="Create Blockchain Identity"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            placeholder="Enter your full name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            placeholder="Enter your email"
          />
          <Input
            label="Organization"
            value={profileData.organization}
            onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
            placeholder="Enter your organization"
          />
          <Input
            label="Title"
            value={profileData.title}
            onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
            placeholder="Enter your job title"
          />
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Bio</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="ghost" onClick={() => setShowCreateIdentity(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateIdentity}
              disabled={!profileData.name.trim()}
            >
              Create Identity
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Credential Modal */}
      <Modal
        isOpen={showAddCredential}
        onClose={() => setShowAddCredential(false)}
        title="Add Verifiable Credential"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Credential Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={credentialData.type}
              onChange={(e) => setCredentialData({ ...credentialData, type: e.target.value as CredentialType })}
              aria-label="Select credential type"
            >
              <option value="professional_certification">Professional Certification</option>
              <option value="education_degree">Education Degree</option>
              <option value="employment_verification">Employment Verification</option>
              <option value="skill_badge">Skill Badge</option>
              <option value="speaker_certification">Speaker Certification</option>
            </select>
          </div>

          <Input
            label="Title"
            value={credentialData.title}
            onChange={(e) => setCredentialData({ ...credentialData, title: e.target.value })}
            placeholder="e.g., AWS Solutions Architect"
            required
          />

          <Input
            label="Issuer"
            value={credentialData.issuer}
            onChange={(e) => setCredentialData({ ...credentialData, issuer: e.target.value })}
            placeholder="e.g., Amazon Web Services"
            required
          />

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={credentialData.description}
              onChange={(e) => setCredentialData({ ...credentialData, description: e.target.value })}
              placeholder="Describe this credential"
            />
          </div>

          <Input
            label="Skills (comma-separated)"
            value={credentialData.skills}
            onChange={(e) => setCredentialData({ ...credentialData, skills: e.target.value })}
            placeholder="e.g., Cloud Architecture, DevOps, Security"
          />

          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="ghost" onClick={() => setShowAddCredential(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCredential}
              disabled={!credentialData.title.trim() || !credentialData.issuer.trim()}
            >
              Add Credential
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Credential Modal */}
      <Modal
        isOpen={showShareCredential}
        onClose={() => setShowShareCredential(false)}
        title="Share Credential"
      >
        <div className="space-y-4">
          {selectedCredential && (
            <>
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="font-medium">{getCredentialTypeLabel(selectedCredential.type)}</h4>
                <p className="text-sm text-gray-600">Issued by: {selectedCredential.issuer.name}</p>
              </div>

              <Input
                label="Recipient DID"
                placeholder="did:univo:..."
                // This would be populated from meeting participants or contacts
              />

              <div className="flex justify-end pt-4 space-x-3">
                <Button variant="ghost" onClick={() => setShowShareCredential(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleShareCredential(selectedCredential.id, '')}>
                  Share Credential
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default BlockchainIdentity;