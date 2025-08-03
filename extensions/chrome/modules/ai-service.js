/**
 * Univo Chrome Extension - AI Service Module
 * Advanced AI capabilities for meeting enhancement
 */

export class AIService {
    static instance = null;
    static isInitialized = false;
    static config = {};
    static models = {};
    static apiEndpoint = '';

    // Initialize AI Service
    static async initialize(config = {}) {
        if (this.isInitialized) {
            return this.instance;
        }

        console.log('🤖 Initializing AI Service...');

        this.config = {
            apiEndpoint: config.apiEndpoint || 'https://api.univo.app',
            features: config.features || ['transcription', 'translation', 'emotion-recognition'],
            models: {
                transcription: 'whisper-large-v2',
                translation: 'mbart-large-50',
                emotion: 'emotion-recognition-v1',
                gesture: 'gesture-detection-v1'
            },
            ...config
        };

        this.apiEndpoint = this.config.apiEndpoint;

        try {
            // Initialize AI models
            await this.loadModels();
            
            // Set up real-time processing
            this.setupRealTimeProcessing();
            
            this.isInitialized = true;
            this.instance = this;
            
            console.log('✅ AI Service initialized successfully');
            return this.instance;
            
        } catch (error) {
            console.error('❌ AI Service initialization failed:', error);
            throw error;
        }
    }

    // Load AI models
    static async loadModels() {
        console.log('📦 Loading AI models...');
        
        const modelPromises = Object.entries(this.config.models).map(async ([type, model]) => {
            try {
                const response = await fetch(`${this.apiEndpoint}/ai/models/${model}/load`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await this.getAuthToken()}`
                    }
                });
                
                if (response.ok) {
                    this.models[type] = { name: model, loaded: true };
                    console.log(`✅ Loaded ${type} model: ${model}`);
                } else {
                    console.warn(`⚠️ Failed to load ${type} model: ${model}`);
                    this.models[type] = { name: model, loaded: false };
                }
            } catch (error) {
                console.error(`❌ Error loading ${type} model:`, error);
                this.models[type] = { name: model, loaded: false, error: error.message };
            }
        });

        await Promise.all(modelPromises);
        console.log('📦 Model loading completed');
    }

    // Set up real-time processing
    static setupRealTimeProcessing() {
        // Audio processing for transcription
        if (this.config.features.includes('transcription')) {
            this.setupAudioProcessing();
        }

        // Video processing for emotion/gesture recognition
        if (this.config.features.includes('emotion-recognition') || 
            this.config.features.includes('gesture-recognition')) {
            this.setupVideoProcessing();
        }
    }

    // Set up audio processing
    static setupAudioProcessing() {
        this.audioContext = null;
        this.audioProcessor = null;
        this.isTranscribing = false;
    }

    // Set up video processing
    static setupVideoProcessing() {
        this.videoProcessor = null;
        this.isProcessingVideo = false;
        this.emotionData = [];
        this.gestureData = [];
    }

    // Start meeting assistant
    static async startMeetingAssistant(context) {
        console.log('🤖 Starting AI meeting assistant...');
        
        try {
            const response = await fetch(`${this.apiEndpoint}/ai/assistant/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    context: context,
                    features: this.config.features,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ AI assistant started:', result);
                return result;
            } else {
                throw new Error(`Failed to start AI assistant: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Failed to start AI assistant:', error);
            throw error;
        }
    }

    // Start transcription
    static async startTranscription(audioStream) {
        if (!this.models.transcription?.loaded) {
            throw new Error('Transcription model not loaded');
        }

        console.log('🎤 Starting real-time transcription...');
        
        try {
            // Set up audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(audioStream);
            
            // Create audio processor
            this.audioProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
            
            this.audioProcessor.onaudioprocess = async (event) => {
                if (this.isTranscribing) {
                    const audioData = event.inputBuffer.getChannelData(0);
                    await this.processAudioChunk(audioData);
                }
            };
            
            source.connect(this.audioProcessor);
            this.audioProcessor.connect(this.audioContext.destination);
            
            this.isTranscribing = true;
            console.log('✅ Transcription started');
            
        } catch (error) {
            console.error('❌ Failed to start transcription:', error);
            throw error;
        }
    }

    // Process audio chunk
    static async processAudioChunk(audioData) {
        try {
            const response = await fetch(`${this.apiEndpoint}/ai/transcribe/chunk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    audioData: Array.from(audioData),
                    sampleRate: this.audioContext.sampleRate,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.text) {
                    this.onTranscriptionResult(result);
                }
            }
        } catch (error) {
            console.error('❌ Audio processing error:', error);
        }
    }

    // Handle transcription result
    static onTranscriptionResult(result) {
        // Dispatch custom event with transcription
        const event = new CustomEvent('univoTranscription', {
            detail: {
                text: result.text,
                confidence: result.confidence,
                timestamp: result.timestamp,
                language: result.language
            }
        });
        document.dispatchEvent(event);
    }

    // Translate text
    static async translateText(options) {
        const { text, from, to } = options;
        
        if (!this.models.translation?.loaded) {
            throw new Error('Translation model not loaded');
        }

        console.log(`🌍 Translating text from ${from} to ${to}...`);
        
        try {
            const response = await fetch(`${this.apiEndpoint}/ai/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    text: text,
                    source_language: from,
                    target_language: to,
                    model: this.models.translation.name
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Translation completed');
                return result;
            } else {
                throw new Error(`Translation failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Translation error:', error);
            throw error;
        }
    }

    // Detect language
    static async detectLanguage(text) {
        try {
            const response = await fetch(`${this.apiEndpoint}/ai/detect-language`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({ text: text })
            });

            if (response.ok) {
                const result = await response.json();
                return result.language;
            } else {
                return 'en'; // Default to English
            }
        } catch (error) {
            console.error('❌ Language detection error:', error);
            return 'en';
        }
    }

    // Start emotion recognition
    static async startEmotionRecognition(videoStream) {
        if (!this.models.emotion?.loaded) {
            throw new Error('Emotion recognition model not loaded');
        }

        console.log('😊 Starting emotion recognition...');
        
        try {
            const video = document.createElement('video');
            video.srcObject = videoStream;
            video.play();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const processFrame = async () => {
                if (this.isProcessingVideo && video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0);
                    
                    const imageData = canvas.toDataURL('image/jpeg', 0.8);
                    await this.processEmotionFrame(imageData);
                }
                
                if (this.isProcessingVideo) {
                    requestAnimationFrame(processFrame);
                }
            };

            this.isProcessingVideo = true;
            processFrame();
            
            console.log('✅ Emotion recognition started');
            
        } catch (error) {
            console.error('❌ Failed to start emotion recognition:', error);
            throw error;
        }
    }

    // Process emotion frame
    static async processEmotionFrame(imageData) {
        try {
            const response = await fetch(`${this.apiEndpoint}/ai/emotion/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    image: imageData,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.onEmotionResult(result);
            }
        } catch (error) {
            console.error('❌ Emotion processing error:', error);
        }
    }

    // Handle emotion result
    static onEmotionResult(result) {
        this.emotionData.push(result);
        
        // Keep only last 10 results
        if (this.emotionData.length > 10) {
            this.emotionData.shift();
        }

        // Dispatch custom event
        const event = new CustomEvent('univoEmotion', {
            detail: {
                emotions: result.emotions,
                confidence: result.confidence,
                timestamp: result.timestamp
            }
        });
        document.dispatchEvent(event);
    }

    // Start gesture recognition
    static async startGestureRecognition(videoStream) {
        if (!this.models.gesture?.loaded) {
            throw new Error('Gesture recognition model not loaded');
        }

        console.log('👋 Starting gesture recognition...');
        
        try {
            // Similar to emotion recognition but for gestures
            const video = document.createElement('video');
            video.srcObject = videoStream;
            video.play();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const processFrame = async () => {
                if (this.isProcessingVideo && video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0);
                    
                    const imageData = canvas.toDataURL('image/jpeg', 0.8);
                    await this.processGestureFrame(imageData);
                }
                
                if (this.isProcessingVideo) {
                    requestAnimationFrame(processFrame);
                }
            };

            processFrame();
            console.log('✅ Gesture recognition started');
            
        } catch (error) {
            console.error('❌ Failed to start gesture recognition:', error);
            throw error;
        }
    }

    // Process gesture frame
    static async processGestureFrame(imageData) {
        try {
            const response = await fetch(`${this.apiEndpoint}/ai/gesture/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    image: imageData,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.onGestureResult(result);
            }
        } catch (error) {
            console.error('❌ Gesture processing error:', error);
        }
    }

    // Handle gesture result
    static onGestureResult(result) {
        this.gestureData.push(result);
        
        // Keep only last 5 results
        if (this.gestureData.length > 5) {
            this.gestureData.shift();
        }

        // Dispatch custom event
        const event = new CustomEvent('univoGesture', {
            detail: {
                gesture: result.gesture,
                confidence: result.confidence,
                coordinates: result.coordinates,
                timestamp: result.timestamp
            }
        });
        document.dispatchEvent(event);
    }

    // Generate meeting summary
    static async generateSummary(meetingData) {
        console.log('📝 Generating meeting summary...');
        
        try {
            const response = await fetch(`${this.apiEndpoint}/ai/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    transcription: meetingData.transcription,
                    duration: meetingData.duration,
                    participants: meetingData.participants,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Summary generated');
                return result;
            } else {
                throw new Error(`Summary generation failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Summary generation error:', error);
            throw error;
        }
    }

    // Stop all AI processing
    static stopProcessing() {
        console.log('🛑 Stopping AI processing...');
        
        // Stop transcription
        if (this.audioProcessor) {
            this.audioProcessor.disconnect();
            this.audioProcessor = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.isTranscribing = false;
        this.isProcessingVideo = false;
        
        console.log('✅ AI processing stopped');
    }

    // Get authentication token
    static async getAuthToken() {
        try {
            // Try to get token from storage
            const result = await chrome.storage.local.get('authToken');
            if (result.authToken) {
                return result.authToken;
            }
            
            // Generate temporary token for demo
            const tempToken = btoa(`univo-extension-${Date.now()}`);
            await chrome.storage.local.set({ authToken: tempToken });
            return tempToken;
            
        } catch (error) {
            console.error('❌ Failed to get auth token:', error);
            return 'demo-token';
        }
    }

    // Get current status
    static getStatus() {
        return {
            initialized: this.isInitialized,
            models: this.models,
            transcribing: this.isTranscribing,
            processingVideo: this.isProcessingVideo,
            features: this.config.features,
            emotionData: this.emotionData.slice(-3), // Last 3 emotions
            gestureData: this.gestureData.slice(-2)  // Last 2 gestures
        };
    }

    // Clean up resources
    static cleanup() {
        console.log('🧹 Cleaning up AI Service...');
        
        this.stopProcessing();
        this.emotionData = [];
        this.gestureData = [];
        this.models = {};
        this.isInitialized = false;
        this.instance = null;
        
        console.log('✅ AI Service cleanup completed');
    }
}

// Export for use in other modules
export default AIService;