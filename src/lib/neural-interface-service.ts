// Neural Interface Integration Service for Univo
// Handles brain-computer interfaces, neural signals, and accessibility features

export interface NeuralInterface {
  id: string;
  userId: string;
  deviceType: NeuralDeviceType;
  deviceInfo: DeviceInfo;
  capabilities: NeuralCapabilities;
  calibration: CalibrationData;
  signalProcessing: SignalProcessingConfig;
  commands: NeuralCommand[];
  accessibility: AccessibilityFeatures;
  privacy: PrivacySettings;
  status: 'disconnected' | 'connecting' | 'connected' | 'calibrating' | 'active' | 'error';
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NeuralDeviceType = 
  | 'eeg_headset'
  | 'implanted_bci'
  | 'non_invasive_bci'
  | 'eye_tracker'
  | 'emg_sensor'
  | 'fnirs'
  | 'ecog'
  | 'hybrid_bci'
  | 'custom';

export interface DeviceInfo {
  manufacturer: string;
  model: string;
  version: string;
  serialNumber: string;
  channels: number;
  samplingRate: number;
  resolution: number;
  bandwidth: FrequencyRange;
  connectivity: 'usb' | 'bluetooth' | 'wifi' | 'wireless' | 'wired';
  batteryLevel?: number;
  signalQuality: SignalQuality;
  lastCalibration: Date;
  firmwareVersion: string;
}

export interface FrequencyRange {
  min: number; // Hz
  max: number; // Hz
}

export interface SignalQuality {
  overall: number; // 0-1
  channels: ChannelQuality[];
  noise: number; // 0-1
  artifacts: ArtifactLevel[];
  impedance: number[]; // per channel
  lastCheck: Date;
}

export interface ChannelQuality {
  channel: number;
  quality: number; // 0-1
  impedance: number;
  noise: number;
  active: boolean;
}

export interface ArtifactLevel {
  type: 'eye_blink' | 'muscle' | 'movement' | 'electrical' | 'cardiac' | 'breathing';
  level: number; // 0-1
  frequency: number; // occurrences per minute
}

export interface NeuralCapabilities {
  signalTypes: SignalType[];
  commands: CommandType[];
  realTimeProcessing: boolean;
  offlineProcessing: boolean;
  adaptiveLearning: boolean;
  multiUser: boolean;
  emotionRecognition: boolean;
  attentionTracking: boolean;
  motorImagery: boolean;
  p300Detection: boolean;
  ssvepDetection: boolean;
  eyeTracking: boolean;
  muscleActivity: boolean;
  speechDecoding: boolean;
  memoryDecoding: boolean;
  intentionPrediction: boolean;
}

export type SignalType = 
  | 'eeg'
  | 'ecog'
  | 'lfp'
  | 'spike'
  | 'emg'
  | 'eog'
  | 'ecg'
  | 'fnirs'
  | 'fmri'
  | 'custom';

export type CommandType = 
  | 'cursor_control'
  | 'click'
  | 'scroll'
  | 'type'
  | 'voice_control'
  | 'menu_navigation'
  | 'application_control'
  | 'meeting_control'
  | 'emotion_expression'
  | 'attention_focus'
  | 'custom';

export interface CalibrationData {
  id: string;
  timestamp: Date;
  duration: number; // seconds
  accuracy: number; // 0-1
  stability: number; // 0-1
  userFeedback: number; // 0-1
  signalBaseline: SignalBaseline;
  commandThresholds: CommandThreshold[];
  adaptationParameters: AdaptationParameters;
  validUntil: Date;
  recalibrationNeeded: boolean;
}

export interface SignalBaseline {
  channels: number[];
  frequencies: FrequencyBand[];
  amplitudes: number[];
  patterns: SignalPattern[];
  artifacts: ArtifactBaseline[];
}

export interface FrequencyBand {
  name: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'custom';
  range: FrequencyRange;
  power: number;
  coherence: number;
}

export interface SignalPattern {
  id: string;
  name: string;
  type: 'erp' | 'oscillation' | 'connectivity' | 'custom';
  features: PatternFeature[];
  reliability: number;
  occurrence: number; // frequency
}

export interface PatternFeature {
  name: string;
  value: number;
  confidence: number;
  stability: number;
}

export interface ArtifactBaseline {
  type: ArtifactLevel['type'];
  threshold: number;
  rejection: boolean;
  correction: boolean;
}

export interface CommandThreshold {
  command: CommandType;
  threshold: number;
  confidence: number;
  latency: number; // milliseconds
  accuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
}

export interface AdaptationParameters {
  learningRate: number;
  adaptationWindow: number; // samples
  forgettingFactor: number;
  stabilityThreshold: number;
  retrainingTrigger: number;
  personalizedModel: boolean;
}

export interface NeuralCommand {
  id: string;
  name: string;
  type: CommandType;
  description: string;
  signalPattern: SignalPattern;
  threshold: number;
  action: CommandAction;
  feedback: FeedbackConfig;
  enabled: boolean;
  accuracy: number;
  usage: number;
  lastUsed: Date;
  customizable: boolean;
}

export interface CommandAction {
  type: 'system' | 'application' | 'meeting' | 'accessibility' | 'custom';
  target: string;
  parameters: Record<string, any>;
  confirmation: boolean;
  reversible: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface FeedbackConfig {
  visual: boolean;
  auditory: boolean;
  haptic: boolean;
  neural: boolean;
  delay: number; // milliseconds
  duration: number; // milliseconds
  intensity: number; // 0-1
}

export interface AccessibilityFeatures {
  enabled: boolean;
  features: AccessibilityFeature[];
  adaptations: AccessibilityAdaptation[];
  assistiveTechnology: AssistiveTechnology[];
  userProfile: AccessibilityProfile;
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  type: 'motor' | 'visual' | 'auditory' | 'cognitive' | 'speech' | 'custom';
  description: string;
  enabled: boolean;
  configuration: Record<string, any>;
  effectiveness: number;
}

export interface AccessibilityAdaptation {
  condition: string;
  adaptation: string;
  trigger: AdaptationTrigger;
  parameters: Record<string, any>;
  active: boolean;
}

export interface AdaptationTrigger {
  type: 'signal_quality' | 'user_fatigue' | 'error_rate' | 'time_based' | 'manual';
  threshold: number;
  duration: number;
  hysteresis: number;
}

export interface AssistiveTechnology {
  name: string;
  type: string;
  version: string;
  integration: 'native' | 'api' | 'bridge' | 'emulation';
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
}

export interface AccessibilityProfile {
  disabilities: DisabilityInfo[];
  preferences: AccessibilityPreferences;
  accommodations: Accommodation[];
  goals: AccessibilityGoal[];
}

export interface DisabilityInfo {
  type: 'motor' | 'visual' | 'auditory' | 'cognitive' | 'speech' | 'multiple';
  severity: 'mild' | 'moderate' | 'severe' | 'profound';
  description: string;
  onset: 'congenital' | 'acquired';
  progressive: boolean;
  accommodations: string[];
}

export interface AccessibilityPreferences {
  inputMethods: string[];
  outputMethods: string[];
  feedbackTypes: string[];
  adaptationSpeed: 'slow' | 'medium' | 'fast';
  errorTolerance: 'low' | 'medium' | 'high';
  privacyLevel: 'minimal' | 'standard' | 'enhanced';
}

export interface Accommodation {
  id: string;
  name: string;
  type: string;
  description: string;
  implementation: string;
  effectiveness: number;
  userSatisfaction: number;
}

export interface AccessibilityGoal {
  id: string;
  description: string;
  target: string;
  timeline: string;
  progress: number;
  metrics: GoalMetric[];
}

export interface GoalMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface PrivacySettings {
  dataCollection: boolean;
  signalRecording: boolean;
  modelTraining: boolean;
  dataSharing: boolean;
  anonymization: boolean;
  retention: number; // days
  encryption: boolean;
  localProcessing: boolean;
  consentLevel: 'minimal' | 'standard' | 'comprehensive';
  optOut: string[];
}

export interface NeuralSession {
  id: string;
  interfaceId: string;
  userId: string;
  meetingId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  commands: SessionCommand[];
  performance: SessionPerformance;
  signalData: SignalData;
  events: SessionEvent[];
  quality: SessionQuality;
}

export interface SessionCommand {
  id: string;
  commandId: string;
  timestamp: Date;
  confidence: number;
  latency: number;
  success: boolean;
  feedback: string;
  context: string;
}

export interface SessionPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
  errorRate: number;
  userSatisfaction: number;
  fatigueLevel: number;
  adaptationRate: number;
}

export interface SignalData {
  channels: number;
  samplingRate: number;
  duration: number;
  quality: number;
  artifacts: number;
  features: SignalFeature[];
  compressed: boolean;
  encrypted: boolean;
}

export interface SignalFeature {
  name: string;
  type: string;
  value: number[];
  timestamp: number[];
  confidence: number;
}

export interface SessionEvent {
  id: string;
  type: 'command' | 'calibration' | 'error' | 'adaptation' | 'feedback' | 'system';
  timestamp: Date;
  description: string;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface SessionQuality {
  overall: number;
  signalQuality: number;
  commandAccuracy: number;
  userComfort: number;
  systemStability: number;
  recommendations: string[];
}

export interface NeuralAnalytics {
  userId: string;
  timeRange: TimeRange;
  sessions: number;
  totalDuration: number;
  averageAccuracy: number;
  improvementRate: number;
  commandUsage: CommandUsage[];
  performanceTrends: PerformanceTrend[];
  adaptationMetrics: AdaptationMetrics;
  accessibilityImpact: AccessibilityImpact;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface CommandUsage {
  command: string;
  count: number;
  accuracy: number;
  averageLatency: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface PerformanceTrend {
  metric: string;
  values: number[];
  timestamps: Date[];
  trend: 'improving' | 'stable' | 'declining';
  significance: number;
}

export interface AdaptationMetrics {
  learningCurve: number[];
  adaptationSpeed: number;
  stabilityIndex: number;
  personalizationLevel: number;
  transferLearning: number;
}

export interface AccessibilityImpact {
  independenceLevel: number;
  taskCompletion: number;
  userSatisfaction: number;
  qualityOfLife: number;
  socialParticipation: number;
  goalProgress: GoalProgress[];
}

export interface GoalProgress {
  goalId: string;
  progress: number;
  timeline: string;
  onTrack: boolean;
  adjustments: string[];
}

class NeuralInterfaceService {
  private interfaces: Map<string, NeuralInterface> = new Map();
  private activeSessions: Map<string, NeuralSession> = new Map();
  private signalProcessor: any = null;
  private commandClassifier: any = null;
  private adaptationEngine: any = null;
  private isInitialized = false;

  // Initialize neural interface service
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Neural Interface Service...');

      // Initialize signal processing
      await this.initializeSignalProcessor();

      // Initialize command classification
      await this.initializeCommandClassifier();

      // Initialize adaptation engine
      await this.initializeAdaptationEngine();

      // Load accessibility profiles
      await this.loadAccessibilityProfiles();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Neural Interface Service:', error);
      return false;
    }
  }

  // Connect neural interface device
  async connectDevice(
    userId: string,
    deviceType: NeuralDeviceType,
    deviceConfig: Partial<DeviceInfo>
  ): Promise<NeuralInterface> {
    try {
      if (!this.isInitialized) {
        throw new Error('Service not initialized');
      }

      // Create device interface
      const neuralInterface: NeuralInterface = {
        id: `ni_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        deviceType,
        deviceInfo: {
          manufacturer: deviceConfig.manufacturer || 'Unknown',
          model: deviceConfig.model || 'Generic',
          version: deviceConfig.version || '1.0',
          serialNumber: deviceConfig.serialNumber || 'N/A',
          channels: deviceConfig.channels || 8,
          samplingRate: deviceConfig.samplingRate || 256,
          resolution: deviceConfig.resolution || 16,
          bandwidth: deviceConfig.bandwidth || { min: 0.5, max: 100 },
          connectivity: deviceConfig.connectivity || 'usb',
          batteryLevel: deviceConfig.batteryLevel,
          signalQuality: {
            overall: 0,
            channels: [],
            noise: 0,
            artifacts: [],
            impedance: [],
            lastCheck: new Date()
          },
          lastCalibration: new Date(0),
          firmwareVersion: deviceConfig.firmwareVersion || '1.0.0'
        },
        capabilities: this.getDeviceCapabilities(deviceType),
        calibration: this.getDefaultCalibration(),
        signalProcessing: this.getDefaultSignalProcessing(),
        commands: this.getDefaultCommands(deviceType),
        accessibility: this.getDefaultAccessibilityFeatures(),
        privacy: this.getDefaultPrivacySettings(),
        status: 'connecting',
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Attempt device connection
      const connected = await this.establishDeviceConnection(neuralInterface);
      
      if (connected) {
        neuralInterface.status = 'connected';
        
        // Perform initial signal quality check
        await this.checkSignalQuality(neuralInterface);
        
        // Load user-specific calibration if available
        await this.loadUserCalibration(neuralInterface);
        
        this.interfaces.set(neuralInterface.id, neuralInterface);
        return neuralInterface;
      } else {
        throw new Error('Failed to establish device connection');
      }
    } catch (error) {
      console.error('Failed to connect neural interface device:', error);
      throw new Error('Device connection failed');
    }
  }

  // Calibrate neural interface
  async calibrateInterface(interfaceId: string): Promise<CalibrationData> {
    try {
      const neuralInterface = this.interfaces.get(interfaceId);
      if (!neuralInterface) {
        throw new Error('Neural interface not found');
      }

      neuralInterface.status = 'calibrating';

      // Perform calibration procedure
      const calibrationData = await this.performCalibration(neuralInterface);

      // Update interface with calibration data
      neuralInterface.calibration = calibrationData;
      neuralInterface.status = 'active';
      neuralInterface.updatedAt = new Date();

      return calibrationData;
    } catch (error) {
      console.error('Failed to calibrate neural interface:', error);
      throw new Error('Calibration failed');
    }
  }

  // Start neural session
  async startSession(interfaceId: string, meetingId?: string): Promise<NeuralSession> {
    try {
      const neuralInterface = this.interfaces.get(interfaceId);
      if (!neuralInterface) {
        throw new Error('Neural interface not found');
      }

      if (neuralInterface.status !== 'active') {
        throw new Error('Neural interface not ready');
      }

      const session: NeuralSession = {
        id: `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        interfaceId,
        userId: neuralInterface.userId,
        meetingId,
        startTime: new Date(),
        commands: [],
        performance: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          latency: 0,
          throughput: 0,
          errorRate: 0,
          userSatisfaction: 0,
          fatigueLevel: 0,
          adaptationRate: 0
        },
        signalData: {
          channels: neuralInterface.deviceInfo.channels,
          samplingRate: neuralInterface.deviceInfo.samplingRate,
          duration: 0,
          quality: 0,
          artifacts: 0,
          features: [],
          compressed: false,
          encrypted: neuralInterface.privacy.encryption
        },
        events: [],
        quality: {
          overall: 0,
          signalQuality: 0,
          commandAccuracy: 0,
          userComfort: 0,
          systemStability: 0,
          recommendations: []
        }
      };

      // Start signal acquisition
      await this.startSignalAcquisition(neuralInterface, session);

      // Start command processing
      await this.startCommandProcessing(neuralInterface, session);

      this.activeSessions.set(session.id, session);
      neuralInterface.lastActivity = new Date();

      return session;
    } catch (error) {
      console.error('Failed to start neural session:', error);
      throw new Error('Session start failed');
    }
  }

  // Process neural command
  async processCommand(sessionId: string, signalData: number[][]): Promise<SessionCommand | null> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const neuralInterface = this.interfaces.get(session.interfaceId);
      if (!neuralInterface) {
        throw new Error('Neural interface not found');
      }

      // Process signal data
      const processedSignal = await this.processSignalData(signalData, neuralInterface);

      // Classify command
      const classification = await this.classifyCommand(processedSignal, neuralInterface);

      if (classification.confidence > neuralInterface.calibration.commandThresholds[0]?.threshold || 0.7) {
        const command: SessionCommand = {
          id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          commandId: classification.commandId,
          timestamp: new Date(),
          confidence: classification.confidence,
          latency: classification.latency,
          success: false,
          feedback: '',
          context: session.meetingId || 'general'
        };

        // Execute command
        const success = await this.executeCommand(command, neuralInterface);
        command.success = success;

        // Provide feedback
        await this.provideFeedback(command, neuralInterface);

        // Update session
        session.commands.push(command);
        session.events.push({
          id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'command',
          timestamp: new Date(),
          description: `Command executed: ${classification.commandId}`,
          data: { command, classification },
          severity: success ? 'info' : 'warning'
        });

        // Update performance metrics
        await this.updatePerformanceMetrics(session);

        return command;
      }

      return null;
    } catch (error) {
      console.error('Failed to process neural command:', error);
      return null;
    }
  }

  // End neural session
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      const neuralInterface = this.interfaces.get(session.interfaceId);
      if (neuralInterface) {
        // Stop signal acquisition
        await this.stopSignalAcquisition(neuralInterface, session);

        // Stop command processing
        await this.stopCommandProcessing(neuralInterface, session);

        // Calculate final metrics
        await this.calculateFinalMetrics(session);

        // Update adaptation parameters
        await this.updateAdaptationParameters(neuralInterface, session);
      }

      session.endTime = new Date();
      session.duration = session.endTime.getTime() - session.startTime.getTime();

      this.activeSessions.delete(sessionId);
    } catch (error) {
      console.error('Failed to end neural session:', error);
    }
  }

  // Get analytics
  async getAnalytics(userId: string, timeRange: TimeRange): Promise<NeuralAnalytics> {
    try {
      // Mock analytics calculation
      const analytics: NeuralAnalytics = {
        userId,
        timeRange,
        sessions: 10,
        totalDuration: 3600000, // 1 hour
        averageAccuracy: 0.85,
        improvementRate: 0.15,
        commandUsage: [
          {
            command: 'cursor_control',
            count: 150,
            accuracy: 0.88,
            averageLatency: 250,
            trend: 'increasing'
          }
        ],
        performanceTrends: [
          {
            metric: 'accuracy',
            values: [0.7, 0.75, 0.8, 0.85],
            timestamps: [new Date(), new Date(), new Date(), new Date()],
            trend: 'improving',
            significance: 0.95
          }
        ],
        adaptationMetrics: {
          learningCurve: [0.6, 0.7, 0.8, 0.85],
          adaptationSpeed: 0.8,
          stabilityIndex: 0.9,
          personalizationLevel: 0.75,
          transferLearning: 0.6
        },
        accessibilityImpact: {
          independenceLevel: 0.8,
          taskCompletion: 0.85,
          userSatisfaction: 0.9,
          qualityOfLife: 0.8,
          socialParticipation: 0.75,
          goalProgress: []
        }
      };

      return analytics;
    } catch (error) {
      console.error('Failed to get neural analytics:', error);
      throw new Error('Analytics retrieval failed');
    }
  }

  // Private helper methods
  private async initializeSignalProcessor(): Promise<void> {
    console.log('Initializing signal processor...');
    this.signalProcessor = { initialized: true };
  }

  private async initializeCommandClassifier(): Promise<void> {
    console.log('Initializing command classifier...');
    this.commandClassifier = { initialized: true };
  }

  private async initializeAdaptationEngine(): Promise<void> {
    console.log('Initializing adaptation engine...');
    this.adaptationEngine = { initialized: true };
  }

  private async loadAccessibilityProfiles(): Promise<void> {
    console.log('Loading accessibility profiles...');
  }

  private getDeviceCapabilities(deviceType: NeuralDeviceType): NeuralCapabilities {
    const baseCapabilities: NeuralCapabilities = {
      signalTypes: ['eeg'],
      commands: ['cursor_control', 'click'],
      realTimeProcessing: true,
      offlineProcessing: false,
      adaptiveLearning: true,
      multiUser: false,
      emotionRecognition: false,
      attentionTracking: true,
      motorImagery: true,
      p300Detection: false,
      ssvepDetection: false,
      eyeTracking: false,
      muscleActivity: false,
      speechDecoding: false,
      memoryDecoding: false,
      intentionPrediction: false
    };

    // Customize based on device type
    switch (deviceType) {
      case 'eeg_headset':
        return {
          ...baseCapabilities,
          emotionRecognition: true,
          p300Detection: true,
          ssvepDetection: true
        };
      case 'eye_tracker':
        return {
          ...baseCapabilities,
          signalTypes: ['eog'],
          eyeTracking: true,
          commands: ['cursor_control', 'click', 'scroll']
        };
      case 'emg_sensor':
        return {
          ...baseCapabilities,
          signalTypes: ['emg'],
          muscleActivity: true,
          commands: ['click', 'type', 'custom']
        };
      default:
        return baseCapabilities;
    }
  }

  private getDefaultCalibration(): CalibrationData {
    return {
      id: `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      duration: 300, // 5 minutes
      accuracy: 0.8,
      stability: 0.75,
      userFeedback: 0.8,
      signalBaseline: {
        channels: [],
        frequencies: [],
        amplitudes: [],
        patterns: [],
        artifacts: []
      },
      commandThresholds: [
        {
          command: 'cursor_control',
          threshold: 0.7,
          confidence: 0.8,
          latency: 250,
          accuracy: 0.85,
          falsePositiveRate: 0.05,
          falseNegativeRate: 0.1
        }
      ],
      adaptationParameters: {
        learningRate: 0.01,
        adaptationWindow: 1000,
        forgettingFactor: 0.99,
        stabilityThreshold: 0.8,
        retrainingTrigger: 0.6,
        personalizedModel: true
      },
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      recalibrationNeeded: false
    };
  }

  private getDefaultSignalProcessing(): SignalProcessingConfig {
    return {
      filters: {
        highpass: { enabled: true, frequency: 0.5 },
        lowpass: { enabled: true, frequency: 100 },
        notch: { enabled: true, frequency: 50 },
        bandpass: { enabled: false, low: 8, high: 30 }
      },
      artifacts: {
        removal: true,
        correction: true,
        threshold: 0.1
      },
      features: {
        extraction: ['power', 'coherence', 'connectivity'],
        window: 1000,
        overlap: 0.5
      },
      classification: {
        algorithm: 'svm',
        features: 10,
        training: 'online'
      }
    };
  }

  private getDefaultCommands(deviceType: NeuralDeviceType): NeuralCommand[] {
    const baseCommands: NeuralCommand[] = [
      {
        id: 'cursor_control',
        name: 'Cursor Control',
        type: 'cursor_control',
        description: 'Control mouse cursor movement',
        signalPattern: {
          id: 'motor_imagery',
          name: 'Motor Imagery',
          type: 'oscillation',
          features: [],
          reliability: 0.8,
          occurrence: 0.5
        },
        threshold: 0.7,
        action: {
          type: 'system',
          target: 'mouse',
          parameters: { sensitivity: 1.0 },
          confirmation: false,
          reversible: true,
          priority: 'medium'
        },
        feedback: {
          visual: true,
          auditory: false,
          haptic: false,
          neural: false,
          delay: 100,
          duration: 200,
          intensity: 0.5
        },
        enabled: true,
        accuracy: 0.8,
        usage: 0,
        lastUsed: new Date(),
        customizable: true
      }
    ];

    return baseCommands;
  }

  private getDefaultAccessibilityFeatures(): AccessibilityFeatures {
    return {
      enabled: true,
      features: [
        {
          id: 'motor_assistance',
          name: 'Motor Assistance',
          type: 'motor',
          description: 'Assists with motor control tasks',
          enabled: true,
          configuration: {},
          effectiveness: 0.8
        }
      ],
      adaptations: [],
      assistiveTechnology: [],
      userProfile: {
        disabilities: [],
        preferences: {
          inputMethods: ['neural'],
          outputMethods: ['visual', 'auditory'],
          feedbackTypes: ['visual'],
          adaptationSpeed: 'medium',
          errorTolerance: 'medium',
          privacyLevel: 'standard'
        },
        accommodations: [],
        goals: []
      }
    };
  }

  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      dataCollection: true,
      signalRecording: false,
      modelTraining: true,
      dataSharing: false,
      anonymization: true,
      retention: 30,
      encryption: true,
      localProcessing: true,
      consentLevel: 'standard',
      optOut: []
    };
  }

  // Missing method implementations
  private async establishDeviceConnection(neuralInterface: NeuralInterface): Promise<boolean> {
    console.log(`Establishing connection to ${neuralInterface.deviceType} device`);
    // Mock device connection
    return true;
  }

  private async checkSignalQuality(neuralInterface: NeuralInterface): Promise<void> {
    console.log(`Checking signal quality for device ${neuralInterface.id}`);
    // Mock signal quality check
    neuralInterface.deviceInfo.signalQuality.overall = 0.8;
  }

  private async loadUserCalibration(neuralInterface: NeuralInterface): Promise<void> {
    console.log(`Loading user calibration for ${neuralInterface.userId}`);
    // Mock calibration loading
  }

  private async performCalibration(neuralInterface: NeuralInterface): Promise<CalibrationData> {
    console.log(`Performing calibration for device ${neuralInterface.id}`);
    // Mock calibration procedure
    return this.getDefaultCalibration();
  }

  private async startSignalAcquisition(neuralInterface: NeuralInterface, session: NeuralSession): Promise<void> {
    console.log(`Starting signal acquisition for session ${session.id}`);
    // Mock signal acquisition start
  }

  private async startCommandProcessing(neuralInterface: NeuralInterface, session: NeuralSession): Promise<void> {
    console.log(`Starting command processing for session ${session.id}`);
    // Mock command processing start
  }

  private async processSignalData(signalData: number[][], neuralInterface: NeuralInterface): Promise<any> {
    console.log(`Processing signal data for device ${neuralInterface.id}`);
    // Mock signal processing
    return { processed: true, features: [] };
  }

  private async classifyCommand(processedSignal: any, neuralInterface: NeuralInterface): Promise<any> {
    console.log(`Classifying command for device ${neuralInterface.id}`);
    // Mock command classification
    return {
      commandId: 'cursor_control',
      confidence: 0.8,
      latency: 250
    };
  }

  private async executeCommand(command: SessionCommand, neuralInterface: NeuralInterface): Promise<boolean> {
    console.log(`Executing command ${command.commandId} for device ${neuralInterface.id}`);
    // Mock command execution
    return true;
  }

  private async provideFeedback(command: SessionCommand, neuralInterface: NeuralInterface): Promise<void> {
    console.log(`Providing feedback for command ${command.commandId}`);
    // Mock feedback provision
  }

  private async updatePerformanceMetrics(session: NeuralSession): Promise<void> {
    console.log(`Updating performance metrics for session ${session.id}`);
    // Mock metrics update
    session.performance.accuracy = 0.85;
  }

  private async stopSignalAcquisition(neuralInterface: NeuralInterface, session: NeuralSession): Promise<void> {
    console.log(`Stopping signal acquisition for session ${session.id}`);
    // Mock signal acquisition stop
  }

  private async stopCommandProcessing(neuralInterface: NeuralInterface, session: NeuralSession): Promise<void> {
    console.log(`Stopping command processing for session ${session.id}`);
    // Mock command processing stop
  }

  private async calculateFinalMetrics(session: NeuralSession): Promise<void> {
    console.log(`Calculating final metrics for session ${session.id}`);
    // Mock final metrics calculation
    session.quality.overall = 0.8;
  }

  private async updateAdaptationParameters(neuralInterface: NeuralInterface, session: NeuralSession): Promise<void> {
    console.log(`Updating adaptation parameters for device ${neuralInterface.id}`);
    // Mock adaptation update
  }

  // Public API methods
  getInterface(interfaceId: string): NeuralInterface | null {
    return this.interfaces.get(interfaceId) || null;
  }

  getSession(sessionId: string): NeuralSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  getAllInterfaces(): NeuralInterface[] {
    return Array.from(this.interfaces.values());
  }

  getActiveSessions(): NeuralSession[] {
    return Array.from(this.activeSessions.values());
  }

  async disconnectDevice(interfaceId: string): Promise<void> {
    const neuralInterface = this.interfaces.get(interfaceId);
    if (neuralInterface) {
      neuralInterface.status = 'disconnected';
      // End any active sessions
      const activeSessions = Array.from(this.activeSessions.values())
        .filter(session => session.interfaceId === interfaceId);
      
      for (const session of activeSessions) {
        await this.endSession(session.id);
      }
    }
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Add missing SignalProcessingConfig interface
export interface SignalProcessingConfig {
  filters: {
    highpass: { enabled: boolean; frequency: number };
    lowpass: { enabled: boolean; frequency: number };
    notch: { enabled: boolean; frequency: number };
    bandpass: { enabled: boolean; low: number; high: number };
  };
  artifacts: {
    removal: boolean;
    correction: boolean;
    threshold: number;
  };
  features: {
    extraction: string[];
    window: number;
    overlap: number;
  };
  classification: {
    algorithm: string;
    features: number;
    training: string;
  };
}

// Export singleton instance
export const neuralInterfaceService = new NeuralInterfaceService();

// Utility functions
export const getDeviceTypeLabel = (deviceType: NeuralDeviceType): string => {
  const labels: Record<NeuralDeviceType, string> = {
    'eeg_headset': 'EEG Headset',
    'implanted_bci': 'Implanted BCI',
    'non_invasive_bci': 'Non-invasive BCI',
    'eye_tracker': 'Eye Tracker',
    'emg_sensor': 'EMG Sensor',
    'fnirs': 'fNIRS',
    'ecog': 'ECoG',
    'hybrid_bci': 'Hybrid BCI',
    'custom': 'Custom Device'
  };
  return labels[deviceType] || deviceType;
};

export const getSignalQualityLabel = (quality: number): string => {
  if (quality >= 0.9) return 'Excellent';
  if (quality >= 0.8) return 'Good';
  if (quality >= 0.7) return 'Fair';
  if (quality >= 0.6) return 'Poor';
  return 'Very Poor';
};

export const getCommandTypeLabel = (commandType: CommandType): string => {
  const labels: Record<CommandType, string> = {
    'cursor_control': 'Cursor Control',
    'click': 'Click',
    'scroll': 'Scroll',
    'type': 'Type',
    'voice_control': 'Voice Control',
    'menu_navigation': 'Menu Navigation',
    'application_control': 'Application Control',
    'meeting_control': 'Meeting Control',
    'emotion_expression': 'Emotion Expression',
    'attention_focus': 'Attention Focus',
    'custom': 'Custom Command'
  };
  return labels[commandType] || commandType;
};

export const calculateCalibrationScore = (calibration: CalibrationData): number => {
  const weights = {
    accuracy: 0.4,
    stability: 0.3,
    userFeedback: 0.3
  };

  return (
    calibration.accuracy * weights.accuracy +
    calibration.stability * weights.stability +
    calibration.userFeedback * weights.userFeedback
  );
};

export const getRecommendedRecalibration = (calibration: CalibrationData): {
  needed: boolean;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
} => {
  const now = new Date();
  const daysSinceCalibration = (now.getTime() - calibration.timestamp.getTime()) / (1000 * 60 * 60 * 24);
  const score = calculateCalibrationScore(calibration);

  if (calibration.recalibrationNeeded) {
    return { needed: true, reason: 'System detected calibration issues', urgency: 'high' };
  }

  if (now > calibration.validUntil) {
    return { needed: true, reason: 'Calibration expired', urgency: 'high' };
  }

  if (score < 0.6) {
    return { needed: true, reason: 'Low calibration quality', urgency: 'medium' };
  }

  if (daysSinceCalibration > 7) {
    return { needed: true, reason: 'Calibration is over a week old', urgency: 'low' };
  }

  return { needed: false, reason: 'Calibration is current', urgency: 'low' };
};

export const validateAccessibilityConfig = (features: AccessibilityFeatures): string[] => {
  const errors: string[] = [];

  if (!features.enabled && features.features.some(f => f.enabled)) {
    errors.push('Individual accessibility features are enabled but main accessibility is disabled');
  }

  if (features.userProfile.disabilities.length === 0 && features.enabled) {
    errors.push('Accessibility is enabled but no disabilities are specified in user profile');
  }

  const enabledFeatures = features.features.filter(f => f.enabled);
  if (enabledFeatures.length === 0 && features.enabled) {
    errors.push('Accessibility is enabled but no specific features are active');
  }

  return errors;
};

export const getPrivacyRecommendations = (settings: PrivacySettings): string[] => {
  const recommendations: string[] = [];

  if (settings.dataCollection && !settings.anonymization) {
    recommendations.push('Consider enabling data anonymization when collecting data');
  }

  if (settings.signalRecording && settings.retention > 90) {
    recommendations.push('Consider reducing data retention period for recorded neural signals');
  }

  if (!settings.encryption && settings.dataSharing) {
    recommendations.push('Enable encryption when sharing neural data');
  }

  if (!settings.localProcessing && settings.consentLevel === 'minimal') {
    recommendations.push('Consider local processing for enhanced privacy with minimal consent');
  }

  return recommendations;
};