/**
 * Univo Chrome Extension - Biometric Service Module
 * Advanced biometric authentication and security
 */

export class BiometricService {
    static instance = null;
    static isInitialized = false;
    static supportedMethods = [];
    static activeAuthentications = new Map();

    // Initialize Biometric Service
    static async initialize(config = {}) {
        if (this.isInitialized) {
            return this.instance;
        }

        console.log('🔐 Initializing Biometric Service...');

        this.config = {
            supportedMethods: config.supportedMethods || ['fingerprint', 'face-recognition', 'voice-recognition'],
            securityLevel: config.securityLevel || 'high',
            timeout: config.timeout || 30000, // 30 seconds
            maxAttempts: config.maxAttempts || 3,
            ...config
        };

        try {
            // Check browser support
            await this.checkBrowserSupport();
            
            // Initialize biometric methods
            await this.initializeBiometricMethods();
            
            this.isInitialized = true;
            this.instance = this;
            
            console.log('✅ Biometric Service initialized successfully');
            return this.instance;
            
        } catch (error) {
            console.error('❌ Biometric Service initialization failed:', error);
            throw error;
        }
    }

    // Check browser support for biometric authentication
    static async checkBrowserSupport() {
        console.log('🔍 Checking browser biometric support...');
        
        this.browserSupport = {
            webAuthn: !!window.PublicKeyCredential,
            fingerprint: !!navigator.credentials,
            faceRecognition: !!navigator.mediaDevices,
            voiceRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
            touchId: /iPhone|iPad|iPod/.test(navigator.userAgent),
            faceId: /iPhone|iPad|iPod/.test(navigator.userAgent) && 'FaceID' in window
        };
        
        console.log('Browser support:', this.browserSupport);
    }

    // Initialize biometric methods
    static async initializeBiometricMethods() {
        console.log('🔧 Initializing biometric methods...');
        
        for (const method of this.config.supportedMethods) {
            try {
                switch (method) {
                    case 'fingerprint':
                        if (this.browserSupport.webAuthn) {
                            this.supportedMethods.push({
                                type: 'fingerprint',
                                name: 'Fingerprint Authentication',
                                available: true,
                                icon: '👆'
                            });
                        }
                        break;
                        
                    case 'face-recognition':
                        if (this.browserSupport.faceRecognition) {
                            this.supportedMethods.push({
                                type: 'face-recognition',
                                name: 'Face Recognition',
                                available: true,
                                icon: '👤'
                            });
                        }
                        break;
                        
                    case 'voice-recognition':
                        if (this.browserSupport.voiceRecognition) {
                            this.supportedMethods.push({
                                type: 'voice-recognition',
                                name: 'Voice Recognition',
                                available: true,
                                icon: '🎤'
                            });
                        }
                        break;
                }
            } catch (error) {
                console.warn(`Failed to initialize ${method}:`, error);
            }
        }
        
        console.log(`✅ Initialized ${this.supportedMethods.length} biometric methods`);
    }

    // Authenticate using biometrics
    static async authenticate(method = 'fingerprint', options = {}) {
        console.log(`🔐 Starting biometric authentication: ${method}`);
        
        try {
            const authMethod = this.supportedMethods.find(m => m.type === method);
            if (!authMethod || !authMethod.available) {
                throw new Error(`Biometric method not available: ${method}`);
            }
            
            const authId = `auth-${Date.now().toString(36)}`;
            const authentication = {
                id: authId,
                method: method,
                startTime: Date.now(),
                status: 'in-progress',
                attempts: 0,
                maxAttempts: options.maxAttempts || this.config.maxAttempts
            };
            
            this.activeAuthentications.set(authId, authentication);
            
            let result;
            switch (method) {
                case 'fingerprint':
                    result = await this.authenticateFingerprint(options);
                    break;
                case 'face-recognition':
                    result = await this.authenticateFace(options);
                    break;
                case 'voice-recognition':
                    result = await this.authenticateVoice(options);
                    break;
                default:
                    throw new Error(`Unsupported authentication method: ${method}`);
            }
            
            authentication.status = result.success ? 'success' : 'failed';
            authentication.endTime = Date.now();
            authentication.result = result;
            
            console.log(`✅ Biometric authentication ${result.success ? 'successful' : 'failed'}`);
            return result;
            
        } catch (error) {
            console.error('❌ Biometric authentication failed:', error);
            throw error;
        }
    }

    // Authenticate using fingerprint
    static async authenticateFingerprint(options = {}) {
        console.log('👆 Starting fingerprint authentication...');
        
        try {
            // Create WebAuthn credential request
            const credentialRequestOptions = {
                publicKey: {
                    challenge: new Uint8Array(32),
                    timeout: options.timeout || this.config.timeout,
                    rpId: window.location.hostname,
                    allowCredentials: options.allowCredentials || [],
                    userVerification: 'required'
                }
            };
            
            // Fill challenge with random data
            crypto.getRandomValues(credentialRequestOptions.publicKey.challenge);
            
            // Request credential (simulate fingerprint scan)
            const credential = await this.simulateWebAuthnAuthentication(credentialRequestOptions);
            
            if (credential) {
                return {
                    success: true,
                    method: 'fingerprint',
                    credentialId: credential.id,
                    timestamp: Date.now(),
                    confidence: 0.95
                };
            } else {
                return {
                    success: false,
                    method: 'fingerprint',
                    error: 'Fingerprint not recognized',
                    timestamp: Date.now()
                };
            }
            
        } catch (error) {
            console.error('❌ Fingerprint authentication failed:', error);
            return {
                success: false,
                method: 'fingerprint',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    // Authenticate using face recognition
    static async authenticateFace(options = {}) {
        console.log('👤 Starting face recognition authentication...');
        
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            });
            
            // Create video element for face capture
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
            });
            
            // Capture face image
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Stop video stream
            stream.getTracks().forEach(track => track.stop());
            
            // Simulate face recognition processing
            const faceData = canvas.toDataURL('image/jpeg', 0.8);
            const recognition = await this.processFaceRecognition(faceData);
            
            return {
                success: recognition.match,
                method: 'face-recognition',
                confidence: recognition.confidence,
                faceData: recognition.features,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('❌ Face recognition failed:', error);
            return {
                success: false,
                method: 'face-recognition',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    // Authenticate using voice recognition
    static async authenticateVoice(options = {}) {
        console.log('🎤 Starting voice recognition authentication...');
        
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = options.language || 'en-US';
            
            const phrase = options.phrase || 'Hello Univo, authenticate me';
            
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    recognition.stop();
                    resolve({
                        success: false,
                        method: 'voice-recognition',
                        error: 'Voice recognition timeout',
                        timestamp: Date.now()
                    });
                }, options.timeout || this.config.timeout);
                
                recognition.onresult = (event) => {
                    clearTimeout(timeout);
                    const transcript = event.results[0][0].transcript.toLowerCase();
                    const confidence = event.results[0][0].confidence;
                    
                    // Simple phrase matching (in production, use voice biometrics)
                    const match = transcript.includes('hello') && transcript.includes('univo');
                    
                    resolve({
                        success: match && confidence > 0.7,
                        method: 'voice-recognition',
                        transcript: transcript,
                        confidence: confidence,
                        expectedPhrase: phrase,
                        timestamp: Date.now()
                    });
                };
                
                recognition.onerror = (event) => {
                    clearTimeout(timeout);
                    resolve({
                        success: false,
                        method: 'voice-recognition',
                        error: event.error,
                        timestamp: Date.now()
                    });
                };
                
                recognition.start();
            });
            
        } catch (error) {
            console.error('❌ Voice recognition failed:', error);
            return {
                success: false,
                method: 'voice-recognition',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    // Simulate WebAuthn authentication
    static async simulateWebAuthnAuthentication(options) {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success/failure (80% success rate for demo)
        if (Math.random() > 0.2) {
            return {
                id: 'credential-' + Date.now().toString(36),
                type: 'public-key',
                rawId: new ArrayBuffer(32),
                response: {
                    authenticatorData: new ArrayBuffer(37),
                    signature: new ArrayBuffer(64),
                    userHandle: new ArrayBuffer(16)
                }
            };
        } else {
            throw new Error('Biometric authentication failed');
        }
    }

    // Process face recognition
    static async processFaceRecognition(imageData) {
        // Simulate face recognition processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate face detection and matching
        const features = {
            faceDetected: true,
            eyeDistance: Math.random() * 100 + 50,
            noseWidth: Math.random() * 20 + 15,
            mouthWidth: Math.random() * 30 + 25,
            faceShape: 'oval'
        };
        
        // Simulate matching against stored template
        const confidence = Math.random() * 0.3 + 0.7; // 70-100%
        const match = confidence > 0.8;
        
        return {
            match: match,
            confidence: confidence,
            features: features
        };
    }

    // Register biometric template
    static async registerBiometric(method, userData = {}) {
        console.log(`📝 Registering biometric template: ${method}`);
        
        try {
            let template;
            
            switch (method) {
                case 'fingerprint':
                    template = await this.registerFingerprint(userData);
                    break;
                case 'face-recognition':
                    template = await this.registerFace(userData);
                    break;
                case 'voice-recognition':
                    template = await this.registerVoice(userData);
                    break;
                default:
                    throw new Error(`Unsupported registration method: ${method}`);
            }
            
            // Store template
            const registration = {
                id: `template-${Date.now().toString(36)}`,
                method: method,
                template: template,
                userId: userData.userId || 'anonymous',
                created: Date.now(),
                lastUsed: null,
                useCount: 0
            };
            
            // Save to storage
            const storageKey = `biometric_${method}_${registration.id}`;
            await chrome.storage.local.set({ [storageKey]: registration });
            
            console.log('✅ Biometric template registered successfully');
            return registration;
            
        } catch (error) {
            console.error('❌ Biometric registration failed:', error);
            throw error;
        }
    }

    // Register fingerprint template
    static async registerFingerprint(userData) {
        // Simulate fingerprint template creation
        const template = {
            minutiae: Array.from({ length: 20 }, () => ({
                x: Math.random() * 256,
                y: Math.random() * 256,
                angle: Math.random() * 360,
                type: Math.random() > 0.5 ? 'ridge_ending' : 'bifurcation'
            })),
            quality: Math.random() * 0.2 + 0.8 // 80-100%
        };
        
        return template;
    }

    // Register face template
    static async registerFace(userData) {
        // Request camera for face registration
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Capture multiple face images for better template
        const faceImages = [];
        for (let i = 0; i < 3; i++) {
            const canvas = document.createElement('canvas');
            const video = document.createElement('video');
            video.srcObject = stream;
            
            await new Promise(resolve => {
                video.onloadedmetadata = resolve;
                video.play();
            });
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            faceImages.push(canvas.toDataURL('image/jpeg', 0.8));
            
            // Wait between captures
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        stream.getTracks().forEach(track => track.stop());
        
        // Create face template
        const template = {
            images: faceImages,
            features: {
                eyeDistance: Math.random() * 100 + 50,
                noseWidth: Math.random() * 20 + 15,
                mouthWidth: Math.random() * 30 + 25,
                faceShape: 'oval'
            },
            quality: Math.random() * 0.2 + 0.8
        };
        
        return template;
    }

    // Register voice template
    static async registerVoice(userData) {
        // Record voice samples for template
        const voiceSamples = [];
        const phrases = [
            'Hello Univo, this is my voice',
            'Authenticate me with voice recognition',
            'My voice is my password'
        ];
        
        for (const phrase of phrases) {
            const sample = await this.recordVoiceSample(phrase);
            voiceSamples.push(sample);
        }
        
        // Create voice template
        const template = {
            samples: voiceSamples,
            features: {
                pitch: Math.random() * 100 + 100, // Hz
                formants: [Math.random() * 500 + 500, Math.random() * 1000 + 1000],
                tempo: Math.random() * 50 + 150 // words per minute
            },
            quality: Math.random() * 0.2 + 0.8
        };
        
        return template;
    }

    // Record voice sample
    static async recordVoiceSample(phrase) {
        return new Promise((resolve) => {
            // Simulate voice recording
            setTimeout(() => {
                resolve({
                    phrase: phrase,
                    duration: 3000,
                    audioData: new ArrayBuffer(48000), // Simulated audio data
                    timestamp: Date.now()
                });
            }, 3000);
        });
    }

    // Get biometric status
    static getBiometricStatus() {
        return {
            initialized: this.isInitialized,
            browserSupport: this.browserSupport,
            supportedMethods: this.supportedMethods,
            activeAuthentications: this.activeAuthentications.size,
            securityLevel: this.config.securityLevel
        };
    }

    // Clean up biometric resources
    static cleanup() {
        console.log('🧹 Cleaning up Biometric Service...');
        
        // Clear active authentications
        this.activeAuthentications.clear();
        this.supportedMethods = [];
        
        this.isInitialized = false;
        this.instance = null;
        
        console.log('✅ Biometric Service cleanup completed');
    }
}

export default BiometricService;