// Blockchain Identity and Credentials Service for Univo
// Handles decentralized identity, verifiable credentials, and blockchain authentication

export interface BlockchainIdentity {
  id: string;
  did: string; // Decentralized Identifier
  publicKey: string;
  privateKey?: string; // Only stored locally, never transmitted
  walletAddress: string;
  chainId: number;
  profile: IdentityProfile;
  credentials: VerifiableCredential[];
  reputation: ReputationScore;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
}

export interface IdentityProfile {
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  organization?: string;
  title?: string;
  location?: string;
  website?: string;
  socialLinks: SocialLink[];
  preferences: ProfilePreferences;
  privacy: PrivacySettings;
}

export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'github' | 'discord' | 'telegram' | 'custom';
  url: string;
  verified: boolean;
}

export interface ProfilePreferences {
  language: string;
  timezone: string;
  currency: string;
  notifications: NotificationSettings;
  meetingDefaults: MeetingDefaults;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  blockchain: boolean;
}

export interface MeetingDefaults {
  defaultRole: 'host' | 'participant' | 'observer';
  autoJoin: boolean;
  microphoneDefault: boolean;
  cameraDefault: boolean;
  recordingConsent: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'contacts' | 'private';
  credentialVisibility: 'public' | 'selective' | 'private';
  meetingHistory: 'public' | 'contacts' | 'private';
  reputationVisible: boolean;
}

export interface VerifiableCredential {
  id: string;
  type: CredentialType;
  issuer: CredentialIssuer;
  subject: string; // DID of the credential holder
  claims: CredentialClaim[];
  proof: CryptographicProof;
  issuanceDate: Date;
  expirationDate?: Date;
  status: 'active' | 'revoked' | 'expired' | 'suspended';
  verificationStatus: 'verified' | 'pending' | 'failed' | 'unknown';
  metadata: CredentialMetadata;
}

export type CredentialType = 
  | 'education_degree'
  | 'professional_certification'
  | 'employment_verification'
  | 'identity_verification'
  | 'skill_badge'
  | 'meeting_attendance'
  | 'speaker_certification'
  | 'organization_membership'
  | 'security_clearance'
  | 'custom';

export interface CredentialIssuer {
  did: string;
  name: string;
  type: 'university' | 'company' | 'government' | 'certification_body' | 'platform' | 'individual';
  website?: string;
  logo?: string;
  trustScore: number;
  verificationMethod: string;
}

export interface CredentialClaim {
  property: string;
  value: any;
  confidence: number;
  source?: string;
  verifiedAt?: Date;
}

export interface CryptographicProof {
  type: 'Ed25519Signature2020' | 'EcdsaSecp256k1Signature2019' | 'RsaSignature2018';
  created: Date;
  verificationMethod: string;
  proofPurpose: 'assertionMethod' | 'authentication' | 'keyAgreement';
  signature: string;
  nonce?: string;
}

export interface CredentialMetadata {
  schema: string;
  context: string[];
  tags: string[];
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  visibility: 'public' | 'private' | 'selective';
  shareableLink?: string;
}

export interface ReputationScore {
  overall: number;
  categories: ReputationCategory[];
  history: ReputationEvent[];
  lastUpdated: Date;
  trustLevel: 'new' | 'developing' | 'established' | 'expert' | 'authority';
}

export interface ReputationCategory {
  name: string;
  score: number;
  weight: number;
  evidence: ReputationEvidence[];
}

export interface ReputationEvidence {
  type: 'meeting_attendance' | 'positive_feedback' | 'credential_verification' | 'peer_endorsement' | 'contribution';
  value: number;
  source: string;
  timestamp: Date;
  verified: boolean;
}

export interface ReputationEvent {
  id: string;
  type: 'increase' | 'decrease' | 'verification' | 'challenge';
  amount: number;
  reason: string;
  source: string;
  timestamp: Date;
  transactionHash?: string;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'identity_creation' | 'credential_issuance' | 'credential_verification' | 'reputation_update';
}

export interface SmartContract {
  address: string;
  abi: any[];
  network: string;
  version: string;
  deployedAt: Date;
}

export interface IdentityVerificationRequest {
  id: string;
  requester: string;
  subject: string;
  credentialTypes: CredentialType[];
  purpose: string;
  deadline?: Date;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  response?: VerificationResponse;
  createdAt: Date;
}

export interface VerificationResponse {
  approved: boolean;
  sharedCredentials: string[];
  conditions: string[];
  expiresAt?: Date;
  signature: string;
}

export interface TrustNetwork {
  connections: TrustConnection[];
  endorsements: Endorsement[];
  mutualConnections: string[];
  trustScore: number;
}

export interface TrustConnection {
  did: string;
  name: string;
  relationship: 'colleague' | 'friend' | 'professional' | 'academic' | 'family';
  trustLevel: number;
  establishedAt: Date;
  lastInteraction: Date;
  mutualConnections: number;
}

export interface Endorsement {
  id: string;
  endorser: string;
  endorsee: string;
  skill: string;
  strength: number;
  comment?: string;
  timestamp: Date;
  signature: string;
}

class BlockchainIdentityService {
  private web3Provider: any = null;
  private identityContract: SmartContract | null = null;
  private credentialContract: SmartContract | null = null;
  private reputationContract: SmartContract | null = null;
  private currentIdentity: BlockchainIdentity | null = null;
  private keyPair: CryptoKeyPair | null = null;

  // Initialize blockchain connection
  async initialize(providerUrl?: string): Promise<boolean> {
    try {
      // In a real implementation, this would connect to Web3 provider
      console.log('Initializing blockchain identity service...');
      
      // Mock initialization for demo
      this.identityContract = {
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        network: 'ethereum',
        version: '1.0.0',
        deployedAt: new Date()
      };

      this.credentialContract = {
        address: '0x2345678901234567890123456789012345678901',
        abi: [],
        network: 'ethereum',
        version: '1.0.0',
        deployedAt: new Date()
      };

      this.reputationContract = {
        address: '0x3456789012345678901234567890123456789012',
        abi: [],
        network: 'ethereum',
        version: '1.0.0',
        deployedAt: new Date()
      };

      // Generate key pair for cryptographic operations
      await this.generateKeyPair();

      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain identity service:', error);
      return false;
    }
  }

  // Generate cryptographic key pair
  private async generateKeyPair(): Promise<void> {
    try {
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'Ed25519',
          namedCurve: 'Ed25519'
        },
        true,
        ['sign', 'verify']
      );
    } catch (error) {
      // Fallback to RSA if Ed25519 is not supported
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );
    }
  }

  // Create new blockchain identity
  async createIdentity(profile: Partial<IdentityProfile>): Promise<BlockchainIdentity> {
    try {
      if (!this.keyPair) {
        await this.generateKeyPair();
      }

      // Generate DID (Decentralized Identifier)
      const did = await this.generateDID();
      
      // Export public key
      const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', this.keyPair!.publicKey);
      const publicKey = this.arrayBufferToBase64(publicKeyBuffer);

      // Generate wallet address (mock)
      const walletAddress = this.generateWalletAddress();

      const identity: BlockchainIdentity = {
        id: `identity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        did,
        publicKey,
        walletAddress,
        chainId: 1, // Ethereum mainnet
        profile: {
          name: profile.name || 'Anonymous User',
          email: profile.email,
          avatar: profile.avatar,
          bio: profile.bio,
          organization: profile.organization,
          title: profile.title,
          location: profile.location,
          website: profile.website,
          socialLinks: profile.socialLinks || [],
          preferences: {
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currency: 'USD',
            notifications: {
              email: true,
              push: true,
              sms: false,
              blockchain: true
            },
            meetingDefaults: {
              defaultRole: 'participant',
              autoJoin: false,
              microphoneDefault: false,
              cameraDefault: false,
              recordingConsent: false
            }
          },
          privacy: {
            profileVisibility: 'public',
            credentialVisibility: 'selective',
            meetingHistory: 'private',
            reputationVisible: true
          }
        },
        credentials: [],
        reputation: {
          overall: 0,
          categories: [
            { name: 'Meeting Participation', score: 0, weight: 0.3, evidence: [] },
            { name: 'Professional Skills', score: 0, weight: 0.4, evidence: [] },
            { name: 'Community Contribution', score: 0, weight: 0.2, evidence: [] },
            { name: 'Trustworthiness', score: 0, weight: 0.1, evidence: [] }
          ],
          history: [],
          lastUpdated: new Date(),
          trustLevel: 'new'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        verificationLevel: 'basic'
      };

      // Store identity on blockchain (mock)
      await this.storeIdentityOnChain(identity);

      this.currentIdentity = identity;
      return identity;
    } catch (error) {
      console.error('Failed to create blockchain identity:', error);
      throw new Error('Identity creation failed');
    }
  }

  // Issue verifiable credential
  async issueCredential(
    subjectDid: string,
    credentialData: {
      type: CredentialType;
      claims: CredentialClaim[];
      expirationDate?: Date;
      metadata?: Partial<CredentialMetadata>;
    }
  ): Promise<VerifiableCredential> {
    try {
      if (!this.currentIdentity) {
        throw new Error('No identity available for issuing credentials');
      }

      const credential: VerifiableCredential = {
        id: `credential_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: credentialData.type,
        issuer: {
          did: this.currentIdentity.did,
          name: this.currentIdentity.profile.name,
          type: 'platform',
          trustScore: this.currentIdentity.reputation.overall,
          verificationMethod: `${this.currentIdentity.did}#key-1`
        },
        subject: subjectDid,
        claims: credentialData.claims,
        proof: await this.generateProof(credentialData),
        issuanceDate: new Date(),
        expirationDate: credentialData.expirationDate,
        status: 'active',
        verificationStatus: 'verified',
        metadata: {
          schema: 'https://univo.com/schemas/credential/v1',
          context: ['https://www.w3.org/2018/credentials/v1'],
          tags: [],
          category: credentialData.type,
          priority: 'medium',
          visibility: 'selective',
          ...credentialData.metadata
        }
      };

      // Store credential on blockchain
      await this.storeCredentialOnChain(credential);

      return credential;
    } catch (error) {
      console.error('Failed to issue credential:', error);
      throw new Error('Credential issuance failed');
    }
  }

  // Verify credential
  async verifyCredential(credential: VerifiableCredential): Promise<boolean> {
    try {
      // Verify signature
      const isSignatureValid = await this.verifySignature(credential);
      
      // Check expiration
      const isNotExpired = !credential.expirationDate || credential.expirationDate > new Date();
      
      // Check revocation status
      const isNotRevoked = credential.status === 'active';
      
      // Verify issuer
      const isIssuerTrusted = await this.verifyIssuer(credential.issuer);

      return isSignatureValid && isNotExpired && isNotRevoked && isIssuerTrusted;
    } catch (error) {
      console.error('Failed to verify credential:', error);
      return false;
    }
  }

  // Request credential verification
  async requestVerification(
    targetDid: string,
    credentialTypes: CredentialType[],
    purpose: string,
    deadline?: Date
  ): Promise<string> {
    try {
      const request: IdentityVerificationRequest = {
        id: `verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requester: this.currentIdentity?.did || '',
        subject: targetDid,
        credentialTypes,
        purpose,
        deadline,
        status: 'pending',
        createdAt: new Date()
      };

      // Store request on blockchain or send via secure channel
      await this.storeVerificationRequest(request);

      return request.id;
    } catch (error) {
      console.error('Failed to request verification:', error);
      throw new Error('Verification request failed');
    }
  }

  // Respond to verification request
  async respondToVerification(
    requestId: string,
    approved: boolean,
    sharedCredentials: string[] = [],
    conditions: string[] = []
  ): Promise<void> {
    try {
      if (!this.currentIdentity) {
        throw new Error('No identity available');
      }

      const response: VerificationResponse = {
        approved,
        sharedCredentials,
        conditions,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        signature: await this.signData({ requestId, approved, sharedCredentials, conditions })
      };

      // Update request with response
      await this.updateVerificationRequest(requestId, response);
    } catch (error) {
      console.error('Failed to respond to verification:', error);
      throw new Error('Verification response failed');
    }
  }

  // Update reputation score
  async updateReputation(
    targetDid: string,
    category: string,
    change: number,
    evidence: ReputationEvidence
  ): Promise<void> {
    try {
      const reputationEvent: ReputationEvent = {
        id: `reputation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: change > 0 ? 'increase' : 'decrease',
        amount: Math.abs(change),
        reason: evidence.type,
        source: evidence.source,
        timestamp: new Date(),
        transactionHash: await this.submitReputationTransaction(targetDid, change, evidence)
      };

      // Update reputation on blockchain
      await this.storeReputationEvent(reputationEvent);
    } catch (error) {
      console.error('Failed to update reputation:', error);
      throw new Error('Reputation update failed');
    }
  }

  // Create endorsement
  async createEndorsement(
    endorseeDid: string,
    skill: string,
    strength: number,
    comment?: string
  ): Promise<Endorsement> {
    try {
      if (!this.currentIdentity) {
        throw new Error('No identity available');
      }

      const endorsement: Endorsement = {
        id: `endorsement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        endorser: this.currentIdentity.did,
        endorsee: endorseeDid,
        skill,
        strength: Math.max(0, Math.min(10, strength)), // Clamp between 0-10
        comment,
        timestamp: new Date(),
        signature: await this.signData({ endorseeDid, skill, strength, comment })
      };

      // Store endorsement on blockchain
      await this.storeEndorsement(endorsement);

      return endorsement;
    } catch (error) {
      console.error('Failed to create endorsement:', error);
      throw new Error('Endorsement creation failed');
    }
  }

  // Get identity by DID
  async getIdentity(did: string): Promise<BlockchainIdentity | null> {
    try {
      // In a real implementation, this would query the blockchain
      console.log(`Fetching identity for DID: ${did}`);
      
      // Mock response for demo
      if (this.currentIdentity?.did === did) {
        return this.currentIdentity;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get identity:', error);
      return null;
    }
  }

  // Get credentials for identity
  async getCredentials(did: string, types?: CredentialType[]): Promise<VerifiableCredential[]> {
    try {
      const identity = await this.getIdentity(did);
      if (!identity) return [];

      let credentials = identity.credentials;
      
      if (types && types.length > 0) {
        credentials = credentials.filter(cred => types.includes(cred.type));
      }

      return credentials;
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return [];
    }
  }

  // Get trust network
  async getTrustNetwork(did: string): Promise<TrustNetwork> {
    try {
      // Mock trust network for demo
      return {
        connections: [],
        endorsements: [],
        mutualConnections: [],
        trustScore: 0
      };
    } catch (error) {
      console.error('Failed to get trust network:', error);
      throw new Error('Trust network retrieval failed');
    }
  }

  // Private helper methods
  private async generateDID(): Promise<string> {
    // Generate a simple DID for demo purposes
    const identifier = Math.random().toString(36).substr(2, 32);
    return `did:univo:${identifier}`;
  }

  private generateWalletAddress(): string {
    // Generate a mock Ethereum address
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async generateProof(data: any): Promise<CryptographicProof> {
    try {
      if (!this.keyPair) {
        throw new Error('No key pair available');
      }

      const dataString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataString);

      const signature = await window.crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        this.keyPair.privateKey,
        dataBuffer
      );

      return {
        type: 'RsaSignature2018',
        created: new Date(),
        verificationMethod: `${this.currentIdentity?.did}#key-1`,
        proofPurpose: 'assertionMethod',
        signature: this.arrayBufferToBase64(signature)
      };
    } catch (error) {
      console.error('Failed to generate proof:', error);
      throw new Error('Proof generation failed');
    }
  }

  private async verifySignature(credential: VerifiableCredential): Promise<boolean> {
    try {
      // In a real implementation, this would verify the cryptographic signature
      console.log('Verifying signature for credential:', credential.id);
      return true; // Mock verification
    } catch (error) {
      console.error('Failed to verify signature:', error);
      return false;
    }
  }

  private async verifyIssuer(issuer: CredentialIssuer): Promise<boolean> {
    try {
      // In a real implementation, this would check issuer reputation and trust
      console.log('Verifying issuer:', issuer.name);
      return issuer.trustScore > 0.5; // Mock verification
    } catch (error) {
      console.error('Failed to verify issuer:', error);
      return false;
    }
  }

  private async signData(data: any): Promise<string> {
    try {
      if (!this.keyPair) {
        throw new Error('No key pair available');
      }

      const dataString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataString);

      const signature = await window.crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        this.keyPair.privateKey,
        dataBuffer
      );

      return this.arrayBufferToBase64(signature);
    } catch (error) {
      console.error('Failed to sign data:', error);
      throw new Error('Data signing failed');
    }
  }

  // Blockchain interaction methods (mocked for demo)
  private async storeIdentityOnChain(identity: BlockchainIdentity): Promise<string> {
    console.log('Storing identity on blockchain:', identity.did);
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeCredentialOnChain(credential: VerifiableCredential): Promise<string> {
    console.log('Storing credential on blockchain:', credential.id);
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeVerificationRequest(request: IdentityVerificationRequest): Promise<string> {
    console.log('Storing verification request:', request.id);
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async updateVerificationRequest(requestId: string, response: VerificationResponse): Promise<string> {
    console.log('Updating verification request:', requestId);
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async submitReputationTransaction(targetDid: string, change: number, evidence: ReputationEvidence): Promise<string> {
    console.log('Submitting reputation transaction for:', targetDid);
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeReputationEvent(event: ReputationEvent): Promise<string> {
    console.log('Storing reputation event:', event.id);
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeEndorsement(endorsement: Endorsement): Promise<string> {
    console.log('Storing endorsement:', endorsement.id);
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public getters
  getCurrentIdentity(): BlockchainIdentity | null {
    return this.currentIdentity;
  }

  isInitialized(): boolean {
    return this.identityContract !== null;
  }

  getContractAddresses(): { identity: string; credential: string; reputation: string } | null {
    if (!this.identityContract || !this.credentialContract || !this.reputationContract) {
      return null;
    }

    return {
      identity: this.identityContract.address,
      credential: this.credentialContract.address,
      reputation: this.reputationContract.address
    };
  }
}

// Export singleton instance
export const blockchainIdentityService = new BlockchainIdentityService();

// Utility functions
export const validateDID = (did: string): boolean => {
  const didRegex = /^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/;
  return didRegex.test(did);
};

export const calculateReputationScore = (categories: ReputationCategory[]): number => {
  const weightedSum = categories.reduce((sum, category) => {
    return sum + (category.score * category.weight);
  }, 0);
  
  const totalWeight = categories.reduce((sum, category) => sum + category.weight, 0);
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

export const getTrustLevel = (score: number): ReputationScore['trustLevel'] => {
  if (score < 0.2) return 'new';
  if (score < 0.4) return 'developing';
  if (score < 0.7) return 'established';
  if (score < 0.9) return 'expert';
  return 'authority';
};

export const formatDID = (did: string): string => {
  if (did.length <= 20) return did;
  return `${did.substring(0, 10)}...${did.substring(did.length - 10)}`;
};

export const getCredentialTypeLabel = (type: CredentialType): string => {
  const labels: Record<CredentialType, string> = {
    'education_degree': 'Education Degree',
    'professional_certification': 'Professional Certification',
    'employment_verification': 'Employment Verification',
    'identity_verification': 'Identity Verification',
    'skill_badge': 'Skill Badge',
    'meeting_attendance': 'Meeting Attendance',
    'speaker_certification': 'Speaker Certification',
    'organization_membership': 'Organization Membership',
    'security_clearance': 'Security Clearance',
    'custom': 'Custom Credential'
  };
  
  return labels[type] || type;
};

export const isCredentialExpired = (credential: VerifiableCredential): boolean => {
  return credential.expirationDate ? credential.expirationDate < new Date() : false;
};

export const getCredentialValidityPeriod = (credential: VerifiableCredential): string => {
  if (!credential.expirationDate) return 'No expiration';
  
  const now = new Date();
  const expiry = credential.expirationDate;
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  if (diffDays < 30) return `Expires in ${diffDays} days`;
  if (diffDays < 365) return `Expires in ${Math.ceil(diffDays / 30)} months`;
  return `Expires in ${Math.ceil(diffDays / 365)} years`;
};