"""
Blockchain Service for Univo Platform
Implements decentralized identity, verifiable credentials, and reputation system
"""

import asyncio
import logging
import hashlib
import json
import secrets
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import base64

# Blockchain and Web3 imports
try:
    from web3 import Web3
    from eth_account import Account
    from eth_keys import keys
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    logging.warning("Web3.py not available - using mock blockchain implementation")

# Cryptography imports
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key

logger = logging.getLogger(__name__)

class MockBlockchain:
    """Mock blockchain implementation for development/testing"""
    
    def __init__(self):
        self.blocks = []
        self.pending_transactions = []
        self.accounts = {}
        self.contracts = {}
        
    def create_account(self) -> Dict[str, str]:
        """Create a new blockchain account"""
        private_key = secrets.token_hex(32)
        # Simple address generation (not cryptographically secure)
        address = "0x" + hashlib.sha256(private_key.encode()).hexdigest()[:40]
        
        self.accounts[address] = {
            'private_key': private_key,
            'balance': 1000,  # Starting balance
            'nonce': 0
        }
        
        return {
            'address': address,
            'private_key': private_key
        }
    
    def deploy_contract(self, contract_code: str, deployer: str) -> str:
        """Deploy a smart contract"""
        contract_address = "0x" + hashlib.sha256(
            (contract_code + deployer + str(len(self.contracts))).encode()
        ).hexdigest()[:40]
        
        self.contracts[contract_address] = {
            'code': contract_code,
            'deployer': deployer,
            'storage': {},
            'deployed_at': datetime.utcnow()
        }
        
        return contract_address
    
    def call_contract(self, contract_address: str, method: str, params: Dict) -> Any:
        """Call a smart contract method"""
        if contract_address not in self.contracts:
            raise ValueError("Contract not found")
        
        # Mock contract execution
        contract = self.contracts[contract_address]
        
        if method == 'createIdentity':
            identity_id = hashlib.sha256(json.dumps(params).encode()).hexdigest()
            contract['storage'][identity_id] = params
            return identity_id
        
        elif method == 'getIdentity':
            return contract['storage'].get(params['identity_id'])
        
        elif method == 'issueCredential':
            credential_id = hashlib.sha256(json.dumps(params).encode()).hexdigest()
            contract['storage'][credential_id] = params
            return credential_id
        
        elif method == 'verifyCredential':
            credential = contract['storage'].get(params['credential_id'])
            return {'valid': credential is not None, 'credential': credential}
        
        return None

class VerifiableCredential:
    """W3C Verifiable Credential implementation"""
    
    def __init__(self):
        self.context = [
            "https://www.w3.org/2018/credentials/v1",
            "https://univo.app/credentials/v1"
        ]
    
    def create_credential(self, issuer: str, subject: str, claims: Dict[str, Any], 
                         private_key: str) -> Dict[str, Any]:
        """Create a verifiable credential"""
        credential = {
            "@context": self.context,
            "type": ["VerifiableCredential"],
            "issuer": issuer,
            "issuanceDate": datetime.utcnow().isoformat() + "Z",
            "expirationDate": (datetime.utcnow() + timedelta(days=365)).isoformat() + "Z",
            "credentialSubject": {
                "id": subject,
                **claims
            }
        }
        
        # Sign the credential
        signature = self._sign_credential(credential, private_key)
        credential["proof"] = {
            "type": "RsaSignature2018",
            "created": datetime.utcnow().isoformat() + "Z",
            "verificationMethod": f"{issuer}#keys-1",
            "proofPurpose": "assertionMethod",
            "jws": signature
        }
        
        return credential
    
    def verify_credential(self, credential: Dict[str, Any], public_key: str) -> bool:
        """Verify a verifiable credential"""
        try:
            # Extract proof
            proof = credential.get("proof", {})
            signature = proof.get("jws", "")
            
            # Remove proof for verification
            credential_copy = credential.copy()
            del credential_copy["proof"]
            
            # Verify signature
            return self._verify_signature(credential_copy, signature, public_key)
        
        except Exception as e:
            logger.error(f"Error verifying credential: {str(e)}")
            return False
    
    def _sign_credential(self, credential: Dict[str, Any], private_key_pem: str) -> str:
        """Sign credential with RSA private key"""
        try:
            # Load private key
            private_key = load_pem_private_key(
                private_key_pem.encode(),
                password=None,
                backend=default_backend()
            )
            
            # Create canonical JSON
            canonical_json = json.dumps(credential, sort_keys=True, separators=(',', ':'))
            
            # Sign
            signature = private_key.sign(
                canonical_json.encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            # Return base64 encoded signature
            return base64.b64encode(signature).decode()
        
        except Exception as e:
            logger.error(f"Error signing credential: {str(e)}")
            return ""
    
    def _verify_signature(self, credential: Dict[str, Any], signature: str, public_key_pem: str) -> bool:
        """Verify credential signature"""
        try:
            # Load public key
            public_key = load_pem_public_key(
                public_key_pem.encode(),
                backend=default_backend()
            )
            
            # Create canonical JSON
            canonical_json = json.dumps(credential, sort_keys=True, separators=(',', ':'))
            
            # Decode signature
            signature_bytes = base64.b64decode(signature)
            
            # Verify
            public_key.verify(
                signature_bytes,
                canonical_json.encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            return True
        
        except Exception:
            return False

class ReputationSystem:
    """Blockchain-based reputation system"""
    
    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.reputation_scores = {}
        
    def calculate_reputation(self, identity_id: str) -> Dict[str, Any]:
        """Calculate reputation score for an identity"""
        if identity_id not in self.reputation_scores:
            self.reputation_scores[identity_id] = {
                'score': 50,  # Starting score
                'meeting_count': 0,
                'positive_feedback': 0,
                'negative_feedback': 0,
                'credentials_verified': 0,
                'last_updated': datetime.utcnow()
            }
        
        reputation = self.reputation_scores[identity_id]
        
        # Calculate weighted score
        base_score = 50
        meeting_bonus = min(reputation['meeting_count'] * 2, 30)
        feedback_score = (reputation['positive_feedback'] - reputation['negative_feedback']) * 5
        credential_bonus = min(reputation['credentials_verified'] * 10, 20)
        
        final_score = max(0, min(100, base_score + meeting_bonus + feedback_score + credential_bonus))
        
        return {
            'identity_id': identity_id,
            'reputation_score': final_score,
            'breakdown': {
                'base_score': base_score,
                'meeting_bonus': meeting_bonus,
                'feedback_score': feedback_score,
                'credential_bonus': credential_bonus
            },
            'statistics': reputation,
            'last_updated': reputation['last_updated'].isoformat()
        }
    
    def update_reputation(self, identity_id: str, event_type: str, data: Dict[str, Any]):
        """Update reputation based on events"""
        if identity_id not in self.reputation_scores:
            self.reputation_scores[identity_id] = {
                'score': 50,
                'meeting_count': 0,
                'positive_feedback': 0,
                'negative_feedback': 0,
                'credentials_verified': 0,
                'last_updated': datetime.utcnow()
            }
        
        reputation = self.reputation_scores[identity_id]
        
        if event_type == 'meeting_completed':
            reputation['meeting_count'] += 1
        elif event_type == 'positive_feedback':
            reputation['positive_feedback'] += 1
        elif event_type == 'negative_feedback':
            reputation['negative_feedback'] += 1
        elif event_type == 'credential_verified':
            reputation['credentials_verified'] += 1
        
        reputation['last_updated'] = datetime.utcnow()

class BlockchainService:
    """Advanced blockchain service for decentralized identity"""
    
    def __init__(self):
        self.blockchain = MockBlockchain() if not WEB3_AVAILABLE else None
        self.web3 = None
        self.credentials = VerifiableCredential()
        self.reputation = ReputationSystem(self.blockchain)
        self.identity_registry = {}
        self.contract_addresses = {}
        
        if WEB3_AVAILABLE:
            # In production, connect to actual blockchain network
            self.web3 = Web3(Web3.HTTPProvider('http://localhost:8545'))  # Local node
        
        logger.info(f"Blockchain Service initialized (Web3: {WEB3_AVAILABLE})")
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for blockchain service"""
        return {
            "status": "healthy",
            "web3_available": WEB3_AVAILABLE,
            "blockchain_connected": self.web3.isConnected() if self.web3 else False,
            "identities_registered": len(self.identity_registry),
            "contracts_deployed": len(self.contract_addresses)
        }
    
    async def create_identity(self, identity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create decentralized identity on blockchain"""
        try:
            # Generate key pair for the identity
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
                backend=default_backend()
            )
            
            public_key = private_key.public_key()
            
            # Serialize keys
            private_pem = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ).decode()
            
            public_pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ).decode()
            
            # Create blockchain account
            if WEB3_AVAILABLE and self.web3:
                account = Account.create()
                blockchain_address = account.address
                blockchain_private_key = account.privateKey.hex()
            else:
                account_data = self.blockchain.create_account()
                blockchain_address = account_data['address']
                blockchain_private_key = account_data['private_key']
            
            # Create DID (Decentralized Identifier)
            did = f"did:univo:{blockchain_address}"
            
            # Create DID document
            did_document = {
                "@context": [
                    "https://www.w3.org/ns/did/v1",
                    "https://univo.app/did/v1"
                ],
                "id": did,
                "verificationMethod": [{
                    "id": f"{did}#keys-1",
                    "type": "RsaVerificationKey2018",
                    "controller": did,
                    "publicKeyPem": public_pem
                }],
                "authentication": [f"{did}#keys-1"],
                "assertionMethod": [f"{did}#keys-1"],
                "service": [{
                    "id": f"{did}#univo-profile",
                    "type": "UnivoProfile",
                    "serviceEndpoint": "https://univo.app/profiles/" + blockchain_address
                }]
            }
            
            # Store on blockchain
            identity_record = {
                'did': did,
                'did_document': did_document,
                'profile': identity_data,
                'created_at': datetime.utcnow().isoformat(),
                'blockchain_address': blockchain_address
            }
            
            if WEB3_AVAILABLE and self.web3:
                # Deploy to actual blockchain
                identity_id = await self._deploy_identity_to_blockchain(identity_record)
            else:
                # Store in mock blockchain
                identity_id = self.blockchain.call_contract(
                    self._get_identity_contract(),
                    'createIdentity',
                    identity_record
                )
            
            # Store locally
            self.identity_registry[did] = {
                'identity_id': identity_id,
                'did_document': did_document,
                'private_key': private_pem,
                'public_key': public_pem,
                'blockchain_address': blockchain_address,
                'blockchain_private_key': blockchain_private_key,
                'profile': identity_data,
                'created_at': datetime.utcnow()
            }
            
            # Initialize reputation
            self.reputation.calculate_reputation(identity_id)
            
            return {
                'did': did,
                'identity_id': identity_id,
                'did_document': did_document,
                'blockchain_address': blockchain_address,
                'verification_keys': {
                    'public_key': public_pem,
                    # Don't return private key in response for security
                },
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating blockchain identity: {str(e)}")
            raise
    
    async def verify_credential(self, credential_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify blockchain-based credentials"""
        try:
            credential = credential_data['credential']
            
            # Extract issuer DID
            issuer_did = credential.get('issuer')
            if not issuer_did:
                return {'valid': False, 'reason': 'No issuer specified'}
            
            # Get issuer's public key
            issuer_info = self.identity_registry.get(issuer_did)
            if not issuer_info:
                return {'valid': False, 'reason': 'Issuer not found'}
            
            # Verify credential signature
            is_valid = self.credentials.verify_credential(
                credential,
                issuer_info['public_key']
            )
            
            if not is_valid:
                return {'valid': False, 'reason': 'Invalid signature'}
            
            # Check expiration
            expiration_date = credential.get('expirationDate')
            if expiration_date:
                exp_date = datetime.fromisoformat(expiration_date.replace('Z', '+00:00'))
                if datetime.utcnow().replace(tzinfo=exp_date.tzinfo) > exp_date:
                    return {'valid': False, 'reason': 'Credential expired'}
            
            # Verify on blockchain
            blockchain_verification = await self._verify_on_blockchain(credential)
            
            # Update reputation for successful verification
            subject_did = credential.get('credentialSubject', {}).get('id')
            if subject_did:
                subject_info = self.identity_registry.get(subject_did)
                if subject_info:
                    self.reputation.update_reputation(
                        subject_info['identity_id'],
                        'credential_verified',
                        {'credential_type': credential.get('type', [])}
                    )
            
            return {
                'valid': True,
                'credential': credential,
                'issuer_did': issuer_did,
                'subject_did': subject_did,
                'blockchain_verified': blockchain_verification,
                'verified_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error verifying credential: {str(e)}")
            return {'valid': False, 'reason': f'Verification error: {str(e)}'}
    
    async def issue_credential(self, issuer_did: str, subject_did: str, 
                              credential_type: str, claims: Dict[str, Any]) -> Dict[str, Any]:
        """Issue a verifiable credential"""
        try:
            # Get issuer information
            issuer_info = self.identity_registry.get(issuer_did)
            if not issuer_info:
                raise ValueError("Issuer not found")
            
            # Create credential
            credential = self.credentials.create_credential(
                issuer=issuer_did,
                subject=subject_did,
                claims={
                    'type': credential_type,
                    **claims
                },
                private_key=issuer_info['private_key']
            )
            
            # Store on blockchain
            credential_id = await self._store_credential_on_blockchain(credential)
            
            # Update reputation
            subject_info = self.identity_registry.get(subject_did)
            if subject_info:
                self.reputation.update_reputation(
                    subject_info['identity_id'],
                    'credential_verified',
                    {'credential_type': credential_type}
                )
            
            return {
                'credential_id': credential_id,
                'credential': credential,
                'issued_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error issuing credential: {str(e)}")
            raise
    
    async def get_reputation(self, identity_did: str) -> Dict[str, Any]:
        """Get reputation score for an identity"""
        try:
            identity_info = self.identity_registry.get(identity_did)
            if not identity_info:
                raise ValueError("Identity not found")
            
            reputation_data = self.reputation.calculate_reputation(identity_info['identity_id'])
            
            return {
                'did': identity_did,
                'reputation': reputation_data,
                'retrieved_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting reputation: {str(e)}")
            raise
    
    async def update_reputation(self, identity_did: str, event_type: str, 
                               event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update reputation based on meeting events"""
        try:
            identity_info = self.identity_registry.get(identity_did)
            if not identity_info:
                raise ValueError("Identity not found")
            
            # Update reputation
            self.reputation.update_reputation(
                identity_info['identity_id'],
                event_type,
                event_data
            )
            
            # Get updated reputation
            updated_reputation = self.reputation.calculate_reputation(identity_info['identity_id'])
            
            return {
                'did': identity_did,
                'event_type': event_type,
                'updated_reputation': updated_reputation,
                'updated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error updating reputation: {str(e)}")
            raise
    
    async def resolve_did(self, did: str) -> Dict[str, Any]:
        """Resolve DID to DID document"""
        try:
            identity_info = self.identity_registry.get(did)
            if not identity_info:
                return {'found': False}
            
            return {
                'found': True,
                'did_document': identity_info['did_document'],
                'resolved_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error resolving DID: {str(e)}")
            raise
    
    # Helper methods
    def _get_identity_contract(self) -> str:
        """Get or deploy identity contract"""
        if 'identity' not in self.contract_addresses:
            # Mock contract deployment
            contract_code = """
            contract IdentityRegistry {
                mapping(bytes32 => Identity) public identities;
                
                struct Identity {
                    string did;
                    string didDocument;
                    address owner;
                    uint256 createdAt;
                }
                
                function createIdentity(string memory did, string memory didDocument) public returns (bytes32) {
                    bytes32 identityId = keccak256(abi.encodePacked(did, block.timestamp));
                    identities[identityId] = Identity(did, didDocument, msg.sender, block.timestamp);
                    return identityId;
                }
            }
            """
            
            contract_address = self.blockchain.deploy_contract(contract_code, "system")
            self.contract_addresses['identity'] = contract_address
        
        return self.contract_addresses['identity']
    
    async def _deploy_identity_to_blockchain(self, identity_record: Dict[str, Any]) -> str:
        """Deploy identity to actual blockchain"""
        # In production, deploy to Ethereum, Polygon, or other blockchain
        # This is a placeholder for actual blockchain deployment
        identity_hash = hashlib.sha256(json.dumps(identity_record).encode()).hexdigest()
        return identity_hash
    
    async def _verify_on_blockchain(self, credential: Dict[str, Any]) -> bool:
        """Verify credential on blockchain"""
        # In production, verify against blockchain records
        # This is a simplified verification
        return True
    
    async def _store_credential_on_blockchain(self, credential: Dict[str, Any]) -> str:
        """Store credential on blockchain"""
        # In production, store credential hash on blockchain
        credential_hash = hashlib.sha256(json.dumps(credential).encode()).hexdigest()
        
        if WEB3_AVAILABLE and self.web3:
            # Store on actual blockchain
            pass
        else:
            # Store in mock blockchain
            self.blockchain.call_contract(
                self._get_identity_contract(),
                'issueCredential',
                {'credential_hash': credential_hash, 'credential': credential}
            )
        
        return credential_hash
    
    async def get_identity_analytics(self) -> Dict[str, Any]:
        """Get analytics about blockchain identities"""
        total_identities = len(self.identity_registry)
        
        # Calculate reputation distribution
        reputation_scores = []
        for did, info in self.identity_registry.items():
            rep_data = self.reputation.calculate_reputation(info['identity_id'])
            reputation_scores.append(rep_data['reputation_score'])
        
        avg_reputation = sum(reputation_scores) / len(reputation_scores) if reputation_scores else 0
        
        return {
            'total_identities': total_identities,
            'average_reputation': avg_reputation,
            'reputation_distribution': {
                'high': len([s for s in reputation_scores if s >= 80]),
                'medium': len([s for s in reputation_scores if 50 <= s < 80]),
                'low': len([s for s in reputation_scores if s < 50])
            },
            'generated_at': datetime.utcnow().isoformat()
        }