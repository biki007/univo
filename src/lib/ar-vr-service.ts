// AR/VR Immersive Meeting Environments for Univo
// Handles WebXR, spatial computing, and immersive collaboration

export interface VREnvironment {
  id: string;
  name: string;
  type: 'conference_room' | 'classroom' | 'auditorium' | 'outdoor' | 'space' | 'custom';
  description: string;
  thumbnail: string;
  modelUrl: string;
  skyboxUrl?: string;
  ambientAudio?: string;
  lighting: LightingConfig;
  spawnPoints: SpawnPoint[];
  interactiveObjects: InteractiveObject[];
  physics: PhysicsConfig;
  maxParticipants: number;
  supportedDevices: ('vr' | 'ar' | 'desktop' | 'mobile')[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SpawnPoint {
  id: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  isDefault: boolean;
  roleRestriction?: string[];
}

export interface InteractiveObject {
  id: string;
  name: string;
  type: 'whiteboard' | 'screen' | 'document' | 'tool' | 'furniture' | 'decoration';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  modelUrl: string;
  interactions: ObjectInteraction[];
  permissions: string[];
  state: Record<string, any>;
}

export interface ObjectInteraction {
  type: 'click' | 'grab' | 'point' | 'voice' | 'gesture';
  action: string;
  parameters: Record<string, any>;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface LightingConfig {
  ambientColor: string;
  ambientIntensity: number;
  directionalLight: {
    color: string;
    intensity: number;
    position: Vector3;
    target: Vector3;
  };
  pointLights: Array<{
    color: string;
    intensity: number;
    position: Vector3;
    distance: number;
  }>;
}

export interface PhysicsConfig {
  gravity: Vector3;
  enableCollisions: boolean;
  enableGrabbing: boolean;
  enableTeleportation: boolean;
  boundaryType: 'room' | 'guardian' | 'none';
  boundarySize?: Vector3;
}

export interface VRParticipant {
  userId: string;
  name: string;
  avatar: VRAvatarConfig;
  position: Vector3;
  rotation: Vector3;
  headPosition: Vector3;
  headRotation: Vector3;
  leftHandPosition?: Vector3;
  leftHandRotation?: Vector3;
  rightHandPosition?: Vector3;
  rightHandRotation?: Vector3;
  isVRUser: boolean;
  deviceType: 'vr' | 'ar' | 'desktop' | 'mobile';
  lastUpdate: Date;
}

export interface VRAvatarConfig {
  type: 'realistic' | 'cartoon' | 'abstract' | 'custom';
  modelUrl: string;
  textureUrl?: string;
  animations: AvatarAnimation[];
  voiceVisualization: boolean;
  eyeTracking: boolean;
  facialExpressions: boolean;
  handTracking: boolean;
}

export interface AvatarAnimation {
  name: string;
  type: 'idle' | 'talking' | 'gesture' | 'emotion' | 'custom';
  duration: number;
  loop: boolean;
  triggers: AnimationTrigger[];
}

export interface AnimationTrigger {
  type: 'voice_activity' | 'hand_gesture' | 'facial_expression' | 'keyword' | 'manual';
  condition: any;
  priority: number;
}

export interface AROverlay {
  id: string;
  type: 'ui_panel' | 'spatial_content' | 'annotation' | 'hologram';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  content: any;
  trackingType: 'world' | 'face' | 'hand' | 'marker' | 'plane';
  isVisible: boolean;
  permissions: string[];
}

export interface SpatialAudio {
  enabled: boolean;
  algorithm: 'hrtf' | 'binaural' | 'ambisonics';
  roomSize: 'small' | 'medium' | 'large' | 'outdoor';
  reverberation: number;
  distanceModel: 'linear' | 'inverse' | 'exponential';
  maxDistance: number;
  rolloffFactor: number;
}

export interface HandTracking {
  enabled: boolean;
  precision: 'low' | 'medium' | 'high';
  gestures: HandGesture[];
  interactions: HandInteraction[];
}

export interface HandGesture {
  name: string;
  type: 'point' | 'grab' | 'pinch' | 'thumbs_up' | 'peace' | 'custom';
  confidence: number;
  action?: string;
}

export interface HandInteraction {
  type: 'grab' | 'point' | 'touch' | 'gesture';
  targetType: string;
  action: string;
  feedback: 'haptic' | 'visual' | 'audio' | 'none';
}

export interface EyeTracking {
  enabled: boolean;
  calibrated: boolean;
  gazePoint: Vector3;
  gazeDirection: Vector3;
  blinkRate: number;
  pupilDilation: number;
  attentionMetrics: {
    focusTime: number;
    distractionEvents: number;
    engagementScore: number;
  };
}

class ARVRService {
  private currentSession: XRSession | null = null;
  private currentEnvironment: VREnvironment | null = null;
  private participants: Map<string, VRParticipant> = new Map();
  private interactiveObjects: Map<string, InteractiveObject> = new Map();
  private arOverlays: Map<string, AROverlay> = new Map();
  private spatialAudio: SpatialAudio | null = null;
  private handTracking: HandTracking | null = null;
  private eyeTracking: EyeTracking | null = null;
  private animationFrame: number | null = null;

  // WebXR Support Detection
  async checkWebXRSupport(): Promise<{
    vr: boolean;
    ar: boolean;
    features: string[];
  }> {
    if (!navigator.xr) {
      return { vr: false, ar: false, features: [] };
    }

    const features: string[] = [];
    let vrSupported = false;
    let arSupported = false;

    try {
      vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (vrSupported) features.push('immersive-vr');
    } catch (e) {
      console.log('VR not supported');
    }

    try {
      arSupported = await navigator.xr.isSessionSupported('immersive-ar');
      if (arSupported) features.push('immersive-ar');
    } catch (e) {
      console.log('AR not supported');
    }

    // Check for additional features
    const additionalFeatures = [
      'local-floor',
      'bounded-floor',
      'hand-tracking',
      'eye-tracking',
      'face-tracking',
      'hit-test',
      'dom-overlay',
      'light-estimation'
    ];

    for (const feature of additionalFeatures) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (supported) features.push(feature);
      } catch (e) {
        // Feature not supported
      }
    }

    return { vr: vrSupported, ar: arSupported, features };
  }

  // Initialize VR Session
  async initializeVRSession(environmentId: string): Promise<boolean> {
    try {
      if (!navigator.xr) {
        throw new Error('WebXR not supported');
      }

      const environment = await this.loadEnvironment(environmentId);
      if (!environment) {
        throw new Error('Environment not found');
      }

      // Request VR session
      this.currentSession = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hand-tracking', 'eye-tracking', 'bounded-floor']
      });

      // Set up session event handlers
      this.currentSession.addEventListener('end', this.onSessionEnd.bind(this));
      this.currentSession.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));

      // Initialize rendering
      await this.initializeVRRendering();

      // Load environment
      await this.loadVREnvironment(environment);

      // Initialize spatial audio
      await this.initializeSpatialAudio(environment);

      // Start render loop
      this.startRenderLoop();

      this.currentEnvironment = environment;
      return true;
    } catch (error) {
      console.error('Failed to initialize VR session:', error);
      return false;
    }
  }

  // Initialize AR Session
  async initializeARSession(): Promise<boolean> {
    try {
      if (!navigator.xr) {
        throw new Error('WebXR not supported');
      }

      // Request AR session
      this.currentSession = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hit-test', 'dom-overlay', 'light-estimation', 'hand-tracking']
      });

      // Set up session event handlers
      this.currentSession.addEventListener('end', this.onSessionEnd.bind(this));
      this.currentSession.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));

      // Initialize rendering
      await this.initializeARRendering();

      // Initialize hand tracking if available
      if (this.currentSession.enabledFeatures?.includes('hand-tracking')) {
        await this.initializeHandTracking();
      }

      // Start render loop
      this.startRenderLoop();

      return true;
    } catch (error) {
      console.error('Failed to initialize AR session:', error);
      return false;
    }
  }

  // Load VR Environment
  private async loadVREnvironment(environment: VREnvironment): Promise<void> {
    // Load 3D environment model
    await this.load3DModel(environment.modelUrl);

    // Set up lighting
    this.setupLighting(environment.lighting);

    // Load interactive objects
    for (const obj of environment.interactiveObjects) {
      await this.loadInteractiveObject(obj);
    }

    // Set up physics
    this.setupPhysics(environment.physics);

    // Load skybox if available
    if (environment.skyboxUrl) {
      await this.loadSkybox(environment.skyboxUrl);
    }

    // Set up spawn points
    this.setupSpawnPoints(environment.spawnPoints);
  }

  // Participant Management
  async addVRParticipant(userId: string, participantData: Partial<VRParticipant>): Promise<void> {
    const participant: VRParticipant = {
      userId,
      name: participantData.name || 'Unknown',
      avatar: participantData.avatar || this.getDefaultAvatar(),
      position: participantData.position || { x: 0, y: 0, z: 0 },
      rotation: participantData.rotation || { x: 0, y: 0, z: 0 },
      headPosition: participantData.headPosition || { x: 0, y: 1.6, z: 0 },
      headRotation: participantData.headRotation || { x: 0, y: 0, z: 0 },
      isVRUser: participantData.isVRUser || false,
      deviceType: participantData.deviceType || 'desktop',
      lastUpdate: new Date()
    };

    this.participants.set(userId, participant);

    // Load participant avatar
    await this.loadParticipantAvatar(participant);

    // Set up voice spatialization
    this.setupParticipantAudio(participant);
  }

  // Update participant position and orientation
  updateParticipantTransform(userId: string, transform: {
    position?: Vector3;
    rotation?: Vector3;
    headPosition?: Vector3;
    headRotation?: Vector3;
    leftHandPosition?: Vector3;
    leftHandRotation?: Vector3;
    rightHandPosition?: Vector3;
    rightHandRotation?: Vector3;
  }): void {
    const participant = this.participants.get(userId);
    if (!participant) return;

    // Update transform data
    if (transform.position) participant.position = transform.position;
    if (transform.rotation) participant.rotation = transform.rotation;
    if (transform.headPosition) participant.headPosition = transform.headPosition;
    if (transform.headRotation) participant.headRotation = transform.headRotation;
    if (transform.leftHandPosition) participant.leftHandPosition = transform.leftHandPosition;
    if (transform.leftHandRotation) participant.leftHandRotation = transform.leftHandRotation;
    if (transform.rightHandPosition) participant.rightHandPosition = transform.rightHandPosition;
    if (transform.rightHandRotation) participant.rightHandRotation = transform.rightHandRotation;

    participant.lastUpdate = new Date();

    // Update avatar position and animation
    this.updateAvatarTransform(participant);

    // Update spatial audio
    this.updateParticipantAudio(participant);
  }

  // Interactive Object Management
  async createInteractiveObject(objectData: Omit<InteractiveObject, 'id'>): Promise<string> {
    const objectId = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const object: InteractiveObject = {
      ...objectData,
      id: objectId
    };

    this.interactiveObjects.set(objectId, object);

    // Load object model
    await this.load3DModel(object.modelUrl);

    // Set up interactions
    this.setupObjectInteractions(object);

    return objectId;
  }

  // Handle object interaction
  async handleObjectInteraction(
    objectId: string,
    userId: string,
    interactionType: string,
    data?: any
  ): Promise<boolean> {
    const object = this.interactiveObjects.get(objectId);
    const participant = this.participants.get(userId);

    if (!object || !participant) return false;

    // Check permissions
    if (object.permissions.length > 0 && !this.checkObjectPermissions(participant, object)) {
      return false;
    }

    // Find matching interaction
    const interaction = object.interactions.find(i => i.type === interactionType);
    if (!interaction) return false;

    // Execute interaction
    return await this.executeObjectInteraction(object, interaction, participant, data);
  }

  // AR Overlay Management
  async createAROverlay(overlayData: Omit<AROverlay, 'id'>): Promise<string> {
    const overlayId = `overlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const overlay: AROverlay = {
      ...overlayData,
      id: overlayId
    };

    this.arOverlays.set(overlayId, overlay);

    // Create AR content based on type
    await this.createARContent(overlay);

    return overlayId;
  }

  // Spatial Audio Management
  private async initializeSpatialAudio(environment: VREnvironment): Promise<void> {
    if (!window.AudioContext) return;

    const audioContext = new AudioContext();
    
    this.spatialAudio = {
      enabled: true,
      algorithm: 'hrtf',
      roomSize: 'medium',
      reverberation: 0.3,
      distanceModel: 'inverse',
      maxDistance: 50,
      rolloffFactor: 1
    };

    // Set up 3D audio listener
    if (audioContext.listener.positionX) {
      audioContext.listener.positionX.value = 0;
      audioContext.listener.positionY.value = 1.6;
      audioContext.listener.positionZ.value = 0;
    }

    // Load ambient audio if available
    if (environment.ambientAudio) {
      await this.loadAmbientAudio(environment.ambientAudio);
    }
  }

  // Hand Tracking
  private async initializeHandTracking(): Promise<void> {
    this.handTracking = {
      enabled: true,
      precision: 'high',
      gestures: [
        { name: 'point', type: 'point', confidence: 0.8 },
        { name: 'grab', type: 'grab', confidence: 0.9 },
        { name: 'pinch', type: 'pinch', confidence: 0.85 }
      ],
      interactions: [
        {
          type: 'point',
          targetType: 'interactive_object',
          action: 'highlight',
          feedback: 'visual'
        },
        {
          type: 'grab',
          targetType: 'interactive_object',
          action: 'pickup',
          feedback: 'haptic'
        }
      ]
    };
  }

  // Eye Tracking
  async initializeEyeTracking(): Promise<void> {
    this.eyeTracking = {
      enabled: true,
      calibrated: false,
      gazePoint: { x: 0, y: 0, z: 0 },
      gazeDirection: { x: 0, y: 0, z: -1 },
      blinkRate: 15,
      pupilDilation: 3.5,
      attentionMetrics: {
        focusTime: 0,
        distractionEvents: 0,
        engagementScore: 0
      }
    };

    // Start eye tracking calibration
    await this.calibrateEyeTracking();
  }

  // Render Loop
  private startRenderLoop(): void {
    if (!this.currentSession) return;

    const render = (time: number, frame: XRFrame) => {
      if (!this.currentSession) return;

      // Update participant positions
      this.updateParticipants(frame);

      // Update hand tracking
      if (this.handTracking?.enabled) {
        this.updateHandTracking(frame);
      }

      // Update eye tracking
      if (this.eyeTracking?.enabled) {
        this.updateEyeTracking(frame);
      }

      // Render frame
      this.renderFrame(frame);

      // Continue render loop
      this.currentSession.requestAnimationFrame(render);
    };

    this.currentSession.requestAnimationFrame(render);
  }

  // Event Handlers
  private onSessionEnd(): void {
    this.currentSession = null;
    this.currentEnvironment = null;
    this.participants.clear();
    this.interactiveObjects.clear();
    this.arOverlays.clear();

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private onInputSourcesChange(event: XRInputSourceChangeEvent): void {
    // Handle controller connection/disconnection
    event.added.forEach(inputSource => {
      this.setupInputSource(inputSource);
    });

    event.removed.forEach(inputSource => {
      this.cleanupInputSource(inputSource);
    });
  }

  // Helper Methods
  private async loadEnvironment(environmentId: string): Promise<VREnvironment | null> {
    // In production, this would load from a database or API
    return this.getDefaultEnvironment();
  }

  private getDefaultEnvironment(): VREnvironment {
    return {
      id: 'default_conference',
      name: 'Modern Conference Room',
      type: 'conference_room',
      description: 'A sleek modern conference room with interactive displays',
      thumbnail: '/environments/conference_room_thumb.jpg',
      modelUrl: '/environments/conference_room.glb',
      skyboxUrl: '/environments/office_skybox.hdr',
      ambientAudio: '/audio/office_ambient.mp3',
      lighting: {
        ambientColor: '#404040',
        ambientIntensity: 0.4,
        directionalLight: {
          color: '#ffffff',
          intensity: 1.0,
          position: { x: 10, y: 10, z: 5 },
          target: { x: 0, y: 0, z: 0 }
        },
        pointLights: [
          {
            color: '#ffffff',
            intensity: 0.8,
            position: { x: 0, y: 3, z: 0 },
            distance: 10
          }
        ]
      },
      spawnPoints: [
        {
          id: 'default',
          position: { x: 0, y: 0, z: 2 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          isDefault: true
        }
      ],
      interactiveObjects: [],
      physics: {
        gravity: { x: 0, y: -9.81, z: 0 },
        enableCollisions: true,
        enableGrabbing: true,
        enableTeleportation: true,
        boundaryType: 'room',
        boundarySize: { x: 10, y: 3, z: 10 }
      },
      maxParticipants: 20,
      supportedDevices: ['vr', 'ar', 'desktop', 'mobile'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getDefaultAvatar(): VRAvatarConfig {
    return {
      type: 'realistic',
      modelUrl: '/avatars/default_avatar.glb',
      animations: [
        {
          name: 'idle',
          type: 'idle',
          duration: 5,
          loop: true,
          triggers: []
        },
        {
          name: 'talking',
          type: 'talking',
          duration: 1,
          loop: true,
          triggers: [
            {
              type: 'voice_activity',
              condition: { threshold: 0.1 },
              priority: 1
            }
          ]
        }
      ],
      voiceVisualization: true,
      eyeTracking: false,
      facialExpressions: false,
      handTracking: true
    };
  }

  // Placeholder methods for complex 3D operations
  private async load3DModel(url: string): Promise<void> {
    // Load 3D model using Three.js or similar
    console.log(`Loading 3D model: ${url}`);
  }

  private setupLighting(config: LightingConfig): void {
    // Set up 3D scene lighting
    console.log('Setting up lighting:', config);
  }

  private async loadInteractiveObject(obj: InteractiveObject): Promise<void> {
    // Load and set up interactive object
    console.log('Loading interactive object:', obj.name);
  }

  private setupPhysics(config: PhysicsConfig): void {
    // Set up physics simulation
    console.log('Setting up physics:', config);
  }

  private async loadSkybox(url: string): Promise<void> {
    // Load skybox texture
    console.log(`Loading skybox: ${url}`);
  }

  private setupSpawnPoints(points: SpawnPoint[]): void {
    // Set up participant spawn points
    console.log('Setting up spawn points:', points.length);
  }

  private async loadParticipantAvatar(participant: VRParticipant): Promise<void> {
    // Load and set up participant avatar
    console.log(`Loading avatar for: ${participant.name}`);
  }

  private setupParticipantAudio(participant: VRParticipant): void {
    // Set up spatial audio for participant
    console.log(`Setting up audio for: ${participant.name}`);
  }

  private updateAvatarTransform(participant: VRParticipant): void {
    // Update avatar position and animation
  }

  private updateParticipantAudio(participant: VRParticipant): void {
    // Update spatial audio position
  }

  private setupObjectInteractions(object: InteractiveObject): void {
    // Set up object interaction handlers
    console.log(`Setting up interactions for: ${object.name}`);
  }

  private checkObjectPermissions(participant: VRParticipant, object: InteractiveObject): boolean {
    // Check if participant has permission to interact with object
    return true; // Simplified for demo
  }

  private async executeObjectInteraction(
    object: InteractiveObject,
    interaction: ObjectInteraction,
    participant: VRParticipant,
    data?: any
  ): Promise<boolean> {
    // Execute the interaction
    console.log(`Executing ${interaction.action} on ${object.name} by ${participant.name}`);
    return true;
  }

  private async createARContent(overlay: AROverlay): Promise<void> {
    // Create AR overlay content
    console.log(`Creating AR overlay: ${overlay.type}`);
  }

  private async loadAmbientAudio(url: string): Promise<void> {
    // Load and play ambient audio
    console.log(`Loading ambient audio: ${url}`);
  }

  private async calibrateEyeTracking(): Promise<void> {
    // Perform eye tracking calibration
    console.log('Calibrating eye tracking...');
    if (this.eyeTracking) {
      this.eyeTracking.calibrated = true;
    }
  }

  private updateParticipants(frame: XRFrame): void {
    // Update all participant positions and states
  }

  private updateHandTracking(frame: XRFrame): void {
    // Update hand tracking data
  }

  private updateEyeTracking(frame: XRFrame): void {
    // Update eye tracking data
  }

  private renderFrame(frame: XRFrame): void {
    // Render the current frame
  }

  private setupInputSource(inputSource: XRInputSource): void {
    // Set up new input source (controller, hand, etc.)
    console.log('Setting up input source:', inputSource.handedness);
  }

  private cleanupInputSource(inputSource: XRInputSource): void {
    // Clean up removed input source
    console.log('Cleaning up input source:', inputSource.handedness);
  }

  private async initializeVRRendering(): Promise<void> {
    // Initialize VR rendering pipeline
    console.log('Initializing VR rendering...');
  }

  private async initializeARRendering(): Promise<void> {
    // Initialize AR rendering pipeline
    console.log('Initializing AR rendering...');
  }

  // Public API
  async endSession(): Promise<void> {
    if (this.currentSession) {
      await this.currentSession.end();
    }
  }

  getCurrentEnvironment(): VREnvironment | null {
    return this.currentEnvironment;
  }

  getParticipants(): VRParticipant[] {
    return Array.from(this.participants.values());
  }

  getInteractiveObjects(): InteractiveObject[] {
    return Array.from(this.interactiveObjects.values());
  }

  isSessionActive(): boolean {
    return this.currentSession !== null;
  }
}

// Export singleton instance
export const arvrService = new ARVRService();

// Utility functions
export const createCustomEnvironment = (config: {
  name: string;
  type: VREnvironment['type'];
  modelUrl: string;
  maxParticipants?: number;
}): Omit<VREnvironment, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: config.name,
  type: config.type,
  description: `Custom ${config.type} environment`,
  thumbnail: '/environments/custom_thumb.jpg',
  modelUrl: config.modelUrl,
  lighting: {
    ambientColor: '#404040',
    ambientIntensity: 0.4,
    directionalLight: {
      color: '#ffffff',
      intensity: 1.0,
      position: { x: 10, y: 10, z: 5 },
      target: { x: 0, y: 0, z: 0 }
    },
    pointLights: []
  },
  spawnPoints: [
    {
      id: 'default',
      position: { x: 0, y: 0, z: 2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      isDefault: true
    }
  ],
  interactiveObjects: [],
  physics: {
    gravity: { x: 0, y: -9.81, z: 0 },
    enableCollisions: true,
    enableGrabbing: true,
    enableTeleportation: true,
    boundaryType: 'room'
  },
  maxParticipants: config.maxParticipants || 20,
  supportedDevices: ['vr', 'ar', 'desktop', 'mobile']
});

export const isWebXRSupported = (): boolean => {
  return 'xr' in navigator;
};

export const getRecommendedVRSettings = (deviceType: string): Partial<VREnvironment> => {
  const settings: Record<string, Partial<VREnvironment>> = {
    'oculus': {
      maxParticipants: 16,
      physics: {
        gravity: { x: 0, y: -9.81, z: 0 },
        enableCollisions: true,
        enableGrabbing: true,
        enableTeleportation: true,
        boundaryType: 'guardian'
      }
    },
    'vive': {
      maxParticipants: 20,
      physics: {
        gravity: { x: 0, y: -9.81, z: 0 },
        enableCollisions: true,
        enableGrabbing: true,
        enableTeleportation: true,
        boundaryType: 'room'
      }
    },
    'mobile': {
      maxParticipants: 8,
      physics: {
        gravity: { x: 0, y: -9.81, z: 0 },
        enableCollisions: false,
        enableGrabbing: false,
        enableTeleportation: false,
        boundaryType: 'none'
      }
    }
  };

  return settings[deviceType] || settings['mobile'];
};