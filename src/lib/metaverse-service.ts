// Metaverse Meeting Spaces Service for Univo
// Handles 3D virtual worlds, spatial computing, and immersive collaboration

export interface MetaverseSpace {
  id: string;
  name: string;
  description: string;
  type: SpaceType;
  theme: SpaceTheme;
  environment: Environment3D;
  physics: PhysicsEngine;
  networking: NetworkingConfig;
  accessibility: AccessibilityConfig;
  economy: VirtualEconomy;
  governance: GovernanceRules;
  analytics: SpaceAnalytics;
  capacity: SpaceCapacity;
  visibility: 'public' | 'private' | 'unlisted' | 'invite_only';
  tags: string[];
  createdBy: string;
  moderators: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  version: string;
}

export type SpaceType = 
  | 'meeting_room'
  | 'conference_hall'
  | 'classroom'
  | 'auditorium'
  | 'exhibition'
  | 'social_hub'
  | 'workspace'
  | 'entertainment'
  | 'marketplace'
  | 'custom';

export interface SpaceTheme {
  id: string;
  name: string;
  category: 'professional' | 'educational' | 'creative' | 'futuristic' | 'natural' | 'fantasy' | 'custom';
  visualStyle: VisualStyle;
  audioTheme: AudioTheme;
  interactionStyle: InteractionStyle;
  customizations: ThemeCustomization[];
}

export interface VisualStyle {
  colorPalette: ColorPalette;
  lighting: LightingSetup;
  materials: MaterialLibrary;
  effects: VisualEffect[];
  atmosphere: AtmosphereConfig;
  skybox: SkyboxConfig;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  highlight: string;
  shadow: string;
}

export interface LightingSetup {
  ambientLight: LightConfig;
  directionalLights: DirectionalLight[];
  pointLights: PointLight[];
  spotLights: SpotLight[];
  environmentLighting: boolean;
  shadows: ShadowConfig;
  globalIllumination: boolean;
}

export interface LightConfig {
  color: string;
  intensity: number;
  enabled: boolean;
}

export interface DirectionalLight extends LightConfig {
  direction: Vector3;
  castShadows: boolean;
}

export interface PointLight extends LightConfig {
  position: Vector3;
  range: number;
  falloff: number;
}

export interface SpotLight extends LightConfig {
  position: Vector3;
  direction: Vector3;
  angle: number;
  penumbra: number;
  range: number;
}

export interface ShadowConfig {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  cascades: number;
  distance: number;
  bias: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MaterialLibrary {
  surfaces: SurfaceMaterial[];
  objects: ObjectMaterial[];
  particles: ParticleMaterial[];
  ui: UIMaterial[];
}

export interface SurfaceMaterial {
  id: string;
  name: string;
  type: 'standard' | 'pbr' | 'unlit' | 'transparent' | 'emissive';
  properties: MaterialProperties;
  textures: TextureSet;
}

export interface MaterialProperties {
  albedo: string;
  metallic: number;
  roughness: number;
  emission: string;
  transparency: number;
  refraction: number;
}

export interface TextureSet {
  diffuse?: string;
  normal?: string;
  metallic?: string;
  roughness?: string;
  emission?: string;
  occlusion?: string;
}

export interface ObjectMaterial extends SurfaceMaterial {
  interactive: boolean;
  physics: boolean;
  collision: boolean;
}

export interface ParticleMaterial {
  id: string;
  name: string;
  shader: string;
  blending: 'normal' | 'additive' | 'multiply' | 'screen';
  properties: Record<string, any>;
}

export interface UIMaterial {
  id: string;
  name: string;
  style: 'flat' | 'glass' | 'neon' | 'holographic' | 'material';
  properties: Record<string, any>;
}

export interface VisualEffect {
  id: string;
  name: string;
  type: 'particle' | 'post_process' | 'shader' | 'animation' | 'lighting';
  parameters: EffectParameters;
  triggers: EffectTrigger[];
  enabled: boolean;
}

export interface EffectParameters {
  [key: string]: any;
}

export interface EffectTrigger {
  event: string;
  condition: any;
  probability: number;
  cooldown: number;
}

export interface AtmosphereConfig {
  fog: FogConfig;
  weather: WeatherConfig;
  timeOfDay: TimeConfig;
  seasons: boolean;
  dynamicWeather: boolean;
}

export interface FogConfig {
  enabled: boolean;
  type: 'linear' | 'exponential' | 'exponential_squared';
  color: string;
  density: number;
  near: number;
  far: number;
}

export interface WeatherConfig {
  current: WeatherType;
  effects: WeatherEffect[];
  transitions: boolean;
  intensity: number;
}

export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog' | 'wind';

export interface WeatherEffect {
  type: WeatherType;
  particles: ParticleSystem;
  audio: AudioClip;
  lighting: LightingModifier;
}

export interface ParticleSystem {
  count: number;
  emission: number;
  velocity: Vector3;
  size: number;
  color: string;
  lifetime: number;
}

export interface AudioClip {
  url: string;
  volume: number;
  loop: boolean;
  spatial: boolean;
}

export interface LightingModifier {
  ambientMultiplier: number;
  directionalMultiplier: number;
  colorTint: string;
}

export interface TimeConfig {
  enabled: boolean;
  current: number; // 0-24 hours
  speed: number; // time multiplier
  sunPosition: Vector3;
  moonPosition: Vector3;
}

export interface SkyboxConfig {
  type: 'color' | 'gradient' | 'cubemap' | 'hdri' | 'procedural';
  parameters: SkyboxParameters;
}

export interface SkyboxParameters {
  [key: string]: any;
}

export interface AudioTheme {
  ambientSounds: AmbientAudio[];
  musicTracks: MusicTrack[];
  soundEffects: SoundEffect[];
  spatialAudio: SpatialAudioConfig;
  volume: VolumeConfig;
}

export interface AmbientAudio {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
  conditions: AudioCondition[];
}

export interface AudioCondition {
  type: 'time' | 'weather' | 'activity' | 'location' | 'user_count';
  condition: any;
  priority: number;
}

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: number;
  genre: string;
  mood: string;
  volume: number;
  license: string;
}

export interface SoundEffect {
  id: string;
  name: string;
  url: string;
  category: 'ui' | 'interaction' | 'environment' | 'notification' | 'ambient';
  volume: number;
  pitch: number;
  spatial: boolean;
  triggers: string[];
}

export interface SpatialAudioConfig {
  enabled: boolean;
  algorithm: 'hrtf' | 'binaural' | 'ambisonics';
  quality: 'low' | 'medium' | 'high';
  maxDistance: number;
  rolloffFactor: number;
  dopplerEffect: boolean;
  reverb: ReverbConfig;
}

export interface ReverbConfig {
  enabled: boolean;
  preset: 'room' | 'hall' | 'cathedral' | 'outdoor' | 'custom';
  wetness: number;
  roomSize: number;
  decay: number;
}

export interface VolumeConfig {
  master: number;
  ambient: number;
  music: number;
  effects: number;
  voice: number;
  ui: number;
}

export interface InteractionStyle {
  locomotion: LocomotionConfig;
  manipulation: ManipulationConfig;
  communication: CommunicationConfig;
  ui: UIConfig;
  gestures: GestureConfig;
}

export interface LocomotionConfig {
  methods: LocomotionMethod[];
  speed: SpeedConfig;
  boundaries: BoundaryConfig;
  comfort: ComfortConfig;
}

export type LocomotionMethod = 
  | 'teleport'
  | 'smooth_locomotion'
  | 'room_scale'
  | 'seated'
  | 'flying'
  | 'vehicle'
  | 'custom';

export interface SpeedConfig {
  walking: number;
  running: number;
  flying: number;
  teleport: number;
}

export interface BoundaryConfig {
  type: 'none' | 'invisible_wall' | 'fade_out' | 'teleport_back' | 'custom';
  visualization: boolean;
  warnings: boolean;
}

export interface ComfortConfig {
  vignetting: boolean;
  snapTurning: boolean;
  smoothTurning: boolean;
  motionSickness: 'none' | 'low' | 'medium' | 'high';
}

export interface ManipulationConfig {
  grabbing: GrabbingConfig;
  pointing: PointingConfig;
  scaling: ScalingConfig;
  rotation: RotationConfig;
}

export interface GrabbingConfig {
  enabled: boolean;
  distance: number;
  hapticFeedback: boolean;
  physics: boolean;
  constraints: string[];
}

export interface PointingConfig {
  enabled: boolean;
  raycast: boolean;
  visualization: 'ray' | 'arc' | 'none';
  feedback: 'visual' | 'haptic' | 'audio' | 'none';
}

export interface ScalingConfig {
  enabled: boolean;
  minScale: number;
  maxScale: number;
  uniform: boolean;
  constraints: string[];
}

export interface RotationConfig {
  enabled: boolean;
  axes: ('x' | 'y' | 'z')[];
  snapAngles: number[];
  smooth: boolean;
}

export interface CommunicationConfig {
  voice: VoiceConfig;
  text: TextConfig;
  gestures: boolean;
  emotes: EmoteConfig;
  proximity: ProximityConfig;
}

export interface VoiceConfig {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high';
  compression: string;
  noiseReduction: boolean;
  echoCancellation: boolean;
  spatialAudio: boolean;
}

export interface TextConfig {
  enabled: boolean;
  floating: boolean;
  persistent: boolean;
  translation: boolean;
  moderation: boolean;
}

export interface EmoteConfig {
  enabled: boolean;
  library: EmoteLibrary;
  custom: boolean;
  triggers: EmoteTrigger[];
}

export interface EmoteLibrary {
  categories: EmoteCategory[];
  animations: EmoteAnimation[];
}

export interface EmoteCategory {
  name: string;
  emotes: string[];
  icon: string;
}

export interface EmoteAnimation {
  id: string;
  name: string;
  duration: number;
  loop: boolean;
  triggers: string[];
}

export interface EmoteTrigger {
  input: string;
  emote: string;
  probability: number;
}

export interface ProximityConfig {
  enabled: boolean;
  ranges: ProximityRange[];
  falloff: 'linear' | 'exponential' | 'logarithmic';
}

export interface ProximityRange {
  name: string;
  distance: number;
  volume: number;
  effects: string[];
}

export interface UIConfig {
  style: 'flat' | '3d' | 'holographic' | 'diegetic';
  placement: 'world_space' | 'screen_space' | 'hybrid';
  interaction: 'gaze' | 'point' | 'touch' | 'voice' | 'gesture';
  scaling: 'fixed' | 'distance_based' | 'adaptive';
  themes: UITheme[];
}

export interface UITheme {
  id: string;
  name: string;
  colors: ColorPalette;
  fonts: FontConfig[];
  animations: UIAnimation[];
}

export interface FontConfig {
  family: string;
  size: number;
  weight: string;
  style: string;
}

export interface UIAnimation {
  type: string;
  duration: number;
  easing: string;
  properties: Record<string, any>;
}

export interface GestureConfig {
  enabled: boolean;
  recognition: GestureRecognition;
  library: GestureLibrary;
  custom: boolean;
}

export interface GestureRecognition {
  hands: boolean;
  body: boolean;
  face: boolean;
  precision: 'low' | 'medium' | 'high';
  latency: number;
}

export interface GestureLibrary {
  categories: GestureCategory[];
  gestures: Gesture[];
}

export interface GestureCategory {
  name: string;
  gestures: string[];
  cultural: string[];
}

export interface Gesture {
  id: string;
  name: string;
  type: 'hand' | 'body' | 'face' | 'combined';
  keyframes: Keyframe[];
  recognition: RecognitionConfig;
}

export interface Keyframe {
  timestamp: number;
  joints: JointPosition[];
  confidence: number;
}

export interface JointPosition {
  joint: string;
  position: Vector3;
  rotation: Vector3;
}

export interface RecognitionConfig {
  threshold: number;
  timeout: number;
  continuous: boolean;
  feedback: boolean;
}

export interface ThemeCustomization {
  property: string;
  value: any;
  override: boolean;
  conditions: CustomizationCondition[];
}

export interface CustomizationCondition {
  type: string;
  condition: any;
  priority: number;
}

export interface Environment3D {
  terrain: TerrainConfig;
  buildings: Building[];
  objects: WorldObject[];
  vegetation: Vegetation[];
  water: WaterConfig;
  boundaries: Boundary[];
  spawnPoints: SpawnPoint[];
  landmarks: Landmark[];
}

export interface TerrainConfig {
  enabled: boolean;
  type: 'flat' | 'heightmap' | 'procedural' | 'mesh';
  size: Vector3;
  resolution: number;
  materials: TerrainMaterial[];
  collision: boolean;
  lod: boolean;
}

export interface TerrainMaterial {
  id: string;
  texture: string;
  normalMap?: string;
  scale: number;
  blend: number;
}

export interface Building {
  id: string;
  name: string;
  type: 'structure' | 'room' | 'facility' | 'decoration';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  model: string;
  materials: string[];
  interior: Interior;
  accessibility: BuildingAccessibility;
  interactive: boolean;
  collision: boolean;
}

export interface Interior {
  rooms: Room[];
  lighting: LightingSetup;
  furniture: Furniture[];
  decorations: Decoration[];
}

export interface Room {
  id: string;
  name: string;
  type: string;
  bounds: Bounds3D;
  capacity: number;
  purpose: string;
  acoustics: AcousticsConfig;
}

export interface Bounds3D {
  min: Vector3;
  max: Vector3;
}

export interface AcousticsConfig {
  reverb: number;
  absorption: number;
  reflection: number;
  transmission: number;
}

export interface Furniture {
  id: string;
  name: string;
  type: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  model: string;
  interactive: boolean;
  functionality: string[];
}

export interface Decoration {
  id: string;
  name: string;
  type: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  model: string;
  animated: boolean;
}

export interface BuildingAccessibility {
  ramps: boolean;
  elevators: boolean;
  wideDoorsways: boolean;
  signage: boolean;
  audioCues: boolean;
  tactilePaths: boolean;
}

export interface WorldObject {
  id: string;
  name: string;
  type: 'static' | 'dynamic' | 'interactive' | 'collectible';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  model: string;
  materials: string[];
  physics: ObjectPhysics;
  interactions: ObjectInteraction[];
  state: ObjectState;
  ownership: ObjectOwnership;
}

export interface ObjectPhysics {
  enabled: boolean;
  type: 'static' | 'kinematic' | 'dynamic';
  mass: number;
  friction: number;
  restitution: number;
  collision: CollisionConfig;
}

export interface CollisionConfig {
  enabled: boolean;
  shape: 'box' | 'sphere' | 'capsule' | 'mesh' | 'convex';
  isTrigger: boolean;
  layers: string[];
}

export interface ObjectInteraction {
  type: 'grab' | 'use' | 'activate' | 'examine' | 'custom';
  requirements: InteractionRequirement[];
  effects: InteractionEffect[];
  feedback: InteractionFeedback;
}

export interface InteractionRequirement {
  type: 'proximity' | 'permission' | 'tool' | 'state' | 'custom';
  condition: any;
  message: string;
}

export interface InteractionEffect {
  type: 'state_change' | 'spawn_object' | 'play_animation' | 'emit_sound' | 'custom';
  parameters: any;
  delay: number;
}

export interface InteractionFeedback {
  visual: boolean;
  audio: boolean;
  haptic: boolean;
  ui: boolean;
  duration: number;
}

export interface ObjectState {
  properties: Record<string, any>;
  persistent: boolean;
  synchronized: boolean;
  lastModified: Date;
  version: number;
}

export interface ObjectOwnership {
  owner: string;
  permissions: ObjectPermission[];
  transferable: boolean;
  temporary: boolean;
  expiresAt?: Date;
}

export interface ObjectPermission {
  user: string;
  actions: string[];
  granted: Date;
  expiresAt?: Date;
}

export interface Vegetation {
  id: string;
  type: 'tree' | 'bush' | 'grass' | 'flower' | 'crop';
  species: string;
  position: Vector3;
  scale: Vector3;
  growth: GrowthConfig;
  seasonal: boolean;
  interactive: boolean;
}

export interface GrowthConfig {
  stage: number;
  maxStage: number;
  growthRate: number;
  requirements: GrowthRequirement[];
}

export interface GrowthRequirement {
  type: 'water' | 'sunlight' | 'nutrients' | 'temperature';
  amount: number;
  optimal: number;
}

export interface WaterConfig {
  enabled: boolean;
  bodies: WaterBody[];
  physics: WaterPhysics;
  rendering: WaterRendering;
}

export interface WaterBody {
  id: string;
  type: 'ocean' | 'lake' | 'river' | 'pool' | 'fountain';
  bounds: Bounds3D;
  level: number;
  flow: FlowConfig;
  quality: WaterQuality;
}

export interface FlowConfig {
  enabled: boolean;
  direction: Vector3;
  speed: number;
  turbulence: number;
}

export interface WaterQuality {
  clarity: number;
  color: string;
  temperature: number;
  pollution: number;
}

export interface WaterPhysics {
  buoyancy: boolean;
  waves: WaveConfig;
  currents: boolean;
  splash: boolean;
}

export interface WaveConfig {
  enabled: boolean;
  height: number;
  frequency: number;
  speed: number;
  direction: Vector3;
}

export interface WaterRendering {
  reflections: boolean;
  refractions: boolean;
  caustics: boolean;
  foam: boolean;
  underwater: UnderwaterConfig;
}

export interface UnderwaterConfig {
  enabled: boolean;
  tint: string;
  visibility: number;
  bubbles: boolean;
  distortion: boolean;
}

export interface Boundary {
  id: string;
  type: 'wall' | 'fence' | 'barrier' | 'zone' | 'trigger';
  shape: 'box' | 'sphere' | 'cylinder' | 'plane' | 'mesh';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  visible: boolean;
  collision: boolean;
  effects: BoundaryEffect[];
}

export interface BoundaryEffect {
  type: 'teleport' | 'block' | 'damage' | 'heal' | 'message' | 'custom';
  parameters: any;
  triggers: string[];
}

export interface SpawnPoint {
  id: string;
  name: string;
  position: Vector3;
  rotation: Vector3;
  type: 'default' | 'role_based' | 'random' | 'custom';
  conditions: SpawnCondition[];
  capacity: number;
  active: boolean;
}

export interface SpawnCondition {
  type: 'role' | 'permission' | 'time' | 'occupancy' | 'custom';
  condition: any;
  priority: number;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  position: Vector3;
  type: 'poi' | 'waypoint' | 'meeting_point' | 'information' | 'custom';
  icon: string;
  visible: boolean;
  interactive: boolean;
  information: LandmarkInfo;
}

export interface LandmarkInfo {
  title: string;
  description: string;
  media: MediaContent[];
  links: ExternalLink[];
  tags: string[];
}

export interface MediaContent {
  type: 'image' | 'video' | 'audio' | '3d_model' | 'document';
  url: string;
  title: string;
  description: string;
}

export interface ExternalLink {
  title: string;
  url: string;
  type: 'website' | 'document' | 'video' | 'social' | 'custom';
}

export interface PhysicsEngine {
  enabled: boolean;
  engine: 'built_in' | 'havok' | 'bullet' | 'physx' | 'custom';
  gravity: Vector3;
  timeStep: number;
  iterations: number;
  collision: CollisionDetection;
  constraints: ConstraintConfig;
  performance: PhysicsPerformance;
}

export interface CollisionDetection {
  algorithm: 'discrete' | 'continuous' | 'hybrid';
  layers: CollisionLayer[];
  matrix: CollisionMatrix;
}

export interface CollisionLayer {
  id: number;
  name: string;
  objects: string[];
}

export interface CollisionMatrix {
  [layerId: number]: number[];
}

export interface ConstraintConfig {
  joints: JointConfig[];
  springs: SpringConfig[];
  motors: MotorConfig[];
}

export interface JointConfig {
  type: 'fixed' | 'hinge' | 'ball_socket' | 'slider' | 'custom';
  stiffness: number;
  damping: number;
  limits: JointLimits;
}

export interface JointLimits {
  enabled: boolean;
  min: Vector3;
  max: Vector3;
}

export interface SpringConfig {
  stiffness: number;
  damping: number;
  restLength: number;
  maxForce: number;
}

export interface MotorConfig {
  type: 'velocity' | 'position' | 'force';
  maxForce: number;
  maxVelocity: number;
  pid: PIDConfig;
}

export interface PIDConfig {
  proportional: number;
  integral: number;
  derivative: number;
}

export interface PhysicsPerformance {
  maxObjects: number;
  cullingDistance: number;
  sleepThreshold: number;
  optimizations: string[];
}

export interface NetworkingConfig {
  protocol: 'websocket' | 'webrtc' | 'custom';
  topology: 'client_server' | 'peer_to_peer' | 'hybrid';
  synchronization: SyncConfig;
  optimization: NetworkOptimization;
  security: NetworkSecurity;
  scalability: ScalabilityConfig;
}

export interface SyncConfig {
  frequency: number;
  interpolation: boolean;
  prediction: boolean;
  compression: CompressionConfig;
  prioritization: PriorityConfig;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'lz4' | 'custom';
  level: number;
  threshold: number;
}

export interface PriorityConfig {
  distance: boolean;
  importance: boolean;
  frequency: boolean;
  bandwidth: boolean;
}

export interface NetworkOptimization {
  culling: CullingConfig;
  batching: BatchingConfig;
  caching: CachingConfig;
  streaming: StreamingConfig;
}

export interface CullingConfig {
  distance: number;
  frustum: boolean;
  occlusion: boolean;
  importance: boolean;
}

export interface BatchingConfig {
  enabled: boolean;
  maxSize: number;
  timeout: number;
  priority: boolean;
}

export interface CachingConfig {
  enabled: boolean;
  size: number;
  ttl: number;
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface StreamingConfig {
  enabled: boolean;
  chunkSize: number;
  bufferSize: number;
  adaptive: boolean;
}

export interface NetworkSecurity {
  encryption: boolean;
  authentication: boolean;
  authorization: boolean;
  rateLimit: RateLimitConfig;
  validation: ValidationConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  window: number;
  burst: number;
}

export interface ValidationConfig {
  input: boolean;
  state: boolean;
  physics: boolean;
  permissions: boolean;
}

export interface ScalabilityConfig {
  maxUsers: number;
  loadBalancing: boolean;
  clustering: boolean;
  sharding: ShardingConfig;
  cdn: CDNConfig;
}

export interface ShardingConfig {
  enabled: boolean;
  strategy: 'spatial' | 'user_based' | 'feature_based' | 'hybrid';
  shardSize: number;
  overlap: number;
}

export interface CDNConfig {
  enabled: boolean;
  provider: string;
  regions: string[];
  caching: string[];
}

export interface AccessibilityConfig {
  enabled: boolean;
  features: AccessibilityFeature[];
  navigation: NavigationAids;
  communication: CommunicationAids;
  interaction: InteractionAids;
  customization: AccessibilityCustomization;
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  type: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'multi';
  description: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface NavigationAids {
  audioBeacons: boolean;
  tactilePathways: boolean;
  voiceGuidance: boolean;
  simplifiedNavigation: boolean;
  landmarks: boolean;
  wayfinding: WayfindingConfig;
}

export interface WayfindingConfig {
  enabled: boolean;
  visual: boolean;
  audio: boolean;
  haptic: boolean;
  pathfinding: PathfindingConfig;
}

export interface PathfindingConfig {
  algorithm: 'astar' | 'dijkstra' | 'navmesh' | 'custom';
  obstacles: boolean;
  dynamic: boolean;
  optimization: boolean;
}

export interface CommunicationAids {
  textToSpeech: boolean;
  speechToText: boolean;
  signLanguage: boolean;
  visualCues: boolean;
  simplifiedUI: boolean;
  translation: TranslationConfig;
}

export interface TranslationConfig {
  enabled: boolean;
  languages: string[];
  realTime: boolean;
  accuracy: number;
  context: boolean;
}

export interface InteractionAids {
  alternativeInputs: InputMethod[];
  assistedInteraction: boolean;
  customControls: boolean;
  feedback: FeedbackConfig;
  automation: AutomationConfig;
}

export interface InputMethod {
  type: 'voice' | 'eye_tracking' | 'switch' | 'sip_puff' | 'brain_computer' | 'custom';
  enabled: boolean;
  sensitivity: number;
  calibration: boolean;
}

export interface FeedbackConfig {
  visual: VisualFeedback;
  audio: AudioFeedback;
  haptic: HapticFeedback;
  multimodal: boolean;
}

export interface VisualFeedback {
  enabled: boolean;
  contrast: number;
  size: number;
  color: string;
  animation: boolean;
}

export interface AudioFeedback {
  enabled: boolean;
  volume: number;
  pitch: number;
  spatial: boolean;
  description: boolean;
}

export interface HapticFeedback {
  enabled: boolean;
  intensity: number;
  pattern: string;
  duration: number;
  spatial: boolean;
}

export interface AutomationConfig {
  enabled: boolean;
  tasks: AutomatedTask[];
  triggers: AutomationTrigger[];
  learning: boolean;
}

export interface AutomatedTask {
  id: string;
  name: string;
  description: string;
  actions: TaskAction[];
  conditions: TaskCondition[];
}

export interface TaskCondition {
  type: string;
  condition: any;
  priority: number;
}

export interface TaskAction {
  type: string;
  parameters: any;
  delay: number;
}

export interface AutomationTrigger {
  event: string;
  condition: any;
  priority: number;
}

export interface AccessibilityCustomization {
  profiles: AccessibilityProfile[];
  preferences: UserPreferences;
  adaptations: Adaptation[];
}

export interface AccessibilityProfile {
  id: string;
  name: string;
  disabilities: string[];
  preferences: Record<string, any>;
  active: boolean;
}

export interface UserPreferences {
  contrast: number;
  fontSize: number;
  audioDescription: boolean;
  subtitles: boolean;
  reducedMotion: boolean;
}

export interface Adaptation {
  trigger: string;
  modification: string;
  parameters: any;
}

export interface VirtualEconomy {
  enabled: boolean;
  currency: VirtualCurrency;
  marketplace: Marketplace;
  transactions: TransactionSystem;
  rewards: RewardSystem;
  taxation: TaxationSystem;
}

export interface VirtualCurrency {
  name: string;
  symbol: string;
  totalSupply: number;
  circulation: number;
  exchangeRate: number;
  stability: 'fixed' | 'floating' | 'algorithmic';
}

export interface Marketplace {
  enabled: boolean;
  categories: MarketCategory[];
  listings: MarketListing[];
  fees: FeeStructure;
  moderation: MarketModeration;
}

export interface MarketCategory {
  id: string;
  name: string;
  description: string;
  items: string[];
}

export interface MarketListing {
  id: string;
  seller: string;
  item: string;
  price: number;
  currency: string;
  status: 'active' | 'sold' | 'expired' | 'removed';
}

export interface FeeStructure {
  listing: number;
  transaction: number;
  withdrawal: number;
}

export interface MarketModeration {
  autoApproval: boolean;
  reviewRequired: boolean;
  bannedItems: string[];
  reportSystem: boolean;
}

export interface TransactionSystem {
  escrow: boolean;
  instantTransfer: boolean;
  batchProcessing: boolean;
  auditTrail: boolean;
}

export interface RewardSystem {
  enabled: boolean;
  activities: RewardActivity[];
  multipliers: RewardMultiplier[];
  limits: RewardLimits;
}

export interface RewardActivity {
  activity: string;
  reward: number;
  frequency: 'once' | 'daily' | 'weekly' | 'unlimited';
}

export interface RewardMultiplier {
  condition: string;
  multiplier: number;
  duration: number;
}

export interface RewardLimits {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface TaxationSystem {
  enabled: boolean;
  rates: TaxRate[];
  exemptions: string[];
  redistribution: boolean;
}

export interface TaxRate {
  type: 'income' | 'transaction' | 'property' | 'luxury';
  rate: number;
  threshold: number;
}

export interface GovernanceRules {
  system: 'democracy' | 'republic' | 'council' | 'autocracy' | 'anarchy';
  voting: VotingSystem;
  roles: GovernanceRole[];
  policies: Policy[];
  enforcement: EnforcementSystem;
}

export interface VotingSystem {
  enabled: boolean;
  method: 'simple_majority' | 'supermajority' | 'consensus' | 'weighted';
  eligibility: VotingEligibility;
  proposals: ProposalSystem;
}

export interface VotingEligibility {
  requirements: string[];
  restrictions: string[];
  verification: boolean;
}

export interface ProposalSystem {
  submission: 'open' | 'restricted' | 'council_only';
  threshold: number;
  duration: number;
  categories: string[];
}

export interface GovernanceRole {
  name: string;
  permissions: string[];
  responsibilities: string[];
  term: number;
  election: 'appointed' | 'elected' | 'inherited';
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  enforcement: string;
  penalties: Penalty[];
}

export interface PolicyRule {
  condition: string;
  action: 'allow' | 'deny' | 'restrict' | 'warn';
  parameters: any;
}

export interface Penalty {
  violation: string;
  severity: 'minor' | 'major' | 'severe' | 'critical';
  action: 'warning' | 'timeout' | 'suspension' | 'ban';
  duration: number;
}

export interface EnforcementSystem {
  automated: boolean;
  moderation: ModerationSystem;
  appeals: AppealSystem;
  transparency: boolean;
}

export interface ModerationSystem {
  moderators: string[];
  tools: string[];
  escalation: boolean;
  logging: boolean;
}

export interface AppealSystem {
  enabled: boolean;
  process: string[];
  timeline: number;
  reviewers: string[];
}

export interface SpaceAnalytics {
  enabled: boolean;
  metrics: AnalyticsMetric[];
  reporting: ReportingConfig;
  privacy: AnalyticsPrivacy;
  retention: number;
}

export interface AnalyticsMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  tags: string[];
  enabled: boolean;
}

export interface ReportingConfig {
  realTime: boolean;
  scheduled: ScheduledReport[];
  dashboards: Dashboard[];
  alerts: Alert[];
}

export interface ScheduledReport {
  name: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics: string[];
  recipients: string[];
}

export interface Dashboard {
  name: string;
  widgets: Widget[];
  layout: string;
  permissions: string[];
}

export interface Widget {
  type: 'chart' | 'table' | 'metric' | 'map' | 'custom';
  data: string;
  configuration: any;
  position: { x: number; y: number; w: number; h: number };
}

export interface Alert {
  name: string;
  condition: string;
  threshold: number;
  actions: AlertAction[];
  enabled: boolean;
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'notification' | 'custom';
  parameters: any;
}

export interface AnalyticsPrivacy {
  anonymization: boolean;
  aggregation: boolean;
  retention: number;
  consent: boolean;
}

export interface SpaceCapacity {
  maxUsers: number;
  maxConcurrent: number;
  maxObjects: number;
  maxStorage: number;
  scaling: ScalingPolicy;
  monitoring: CapacityMonitoring;
}

export interface ScalingPolicy {
  enabled: boolean;
  triggers: ScalingTrigger[];
  actions: ScalingAction[];
  cooldown: number;
}

export interface ScalingTrigger {
  metric: string;
  threshold: number;
  duration: number;
  comparison: 'greater' | 'less' | 'equal';
}

export interface ScalingAction {
  type: 'scale_up' | 'scale_down' | 'migrate' | 'notify';
  parameters: any;
  priority: number;
}

export interface CapacityMonitoring {
  enabled: boolean;
  metrics: string[];
  alerts: boolean;
  forecasting: boolean;
}

// Metaverse Service Implementation
class MetaverseService {
  private spaces: Map<string, MetaverseSpace> = new Map();
  private activeUsers: Map<string, UserSession> = new Map();
  private renderEngine: any = null;
  private physicsEngine: any = null;
  private networkManager: any = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Metaverse Service...');

      // Initialize render engine
      await this.initializeRenderEngine();

      // Initialize physics engine
      await this.initializePhysicsEngine();

      // Initialize network manager
      await this.initializeNetworkManager();

      // Load default spaces
      await this.loadDefaultSpaces();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Metaverse Service:', error);
      return false;
    }
  }

  async createSpace(spaceConfig: Partial<MetaverseSpace>): Promise<MetaverseSpace> {
    try {
      const space: MetaverseSpace = {
        id: `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: spaceConfig.name || 'New Metaverse Space',
        description: spaceConfig.description || '',
        type: spaceConfig.type || 'meeting_room',
        theme: spaceConfig.theme || this.getDefaultTheme(),
        environment: spaceConfig.environment || this.getDefaultEnvironment(),
        physics: spaceConfig.physics || this.getDefaultPhysics(),
        networking: spaceConfig.networking || this.getDefaultNetworking(),
        accessibility: spaceConfig.accessibility || this.getDefaultAccessibility(),
        economy: spaceConfig.economy || this.getDefaultEconomy(),
        governance: spaceConfig.governance || this.getDefaultGovernance(),
        analytics: spaceConfig.analytics || this.getDefaultAnalytics(),
        capacity: spaceConfig.capacity || this.getDefaultCapacity(),
        visibility: spaceConfig.visibility || 'private',
        tags: spaceConfig.tags || [],
        createdBy: spaceConfig.createdBy || 'system',
        moderators: spaceConfig.moderators || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: false,
        version: '1.0.0'
      };

      // Initialize space systems
      await this.initializeSpaceSystems(space);

      this.spaces.set(space.id, space);
      return space;
    } catch (error) {
      console.error('Failed to create metaverse space:', error);
      throw new Error('Space creation failed');
    }
  }

  async joinSpace(spaceId: string, userId: string): Promise<UserSession> {
    try {
      const space = this.spaces.get(spaceId);
      if (!space) {
        throw new Error('Space not found');
      }

      const session: UserSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        spaceId,
        joinedAt: new Date(),
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        avatar: this.getDefaultAvatar(),
        permissions: this.getUserPermissions(userId, space),
        status: 'active'
      };

      this.activeUsers.set(session.id, session);
      space.isActive = true;

      return session;
    } catch (error) {
      console.error('Failed to join metaverse space:', error);
      throw new Error('Space join failed');
    }
  }

  // Helper methods
  private async initializeRenderEngine(): Promise<void> {
    console.log('Initializing render engine...');
    this.renderEngine = { initialized: true };
  }

  private async initializePhysicsEngine(): Promise<void> {
    console.log('Initializing physics engine...');
    this.physicsEngine = { initialized: true };
  }

  private async initializeNetworkManager(): Promise<void> {
    console.log('Initializing network manager...');
    this.networkManager = { initialized: true };
  }

  private async loadDefaultSpaces(): Promise<void> {
    console.log('Loading default spaces...');
  }

  private async initializeSpaceSystems(space: MetaverseSpace): Promise<void> {
    console.log(`Initializing systems for space: ${space.name}`);
  }

  private getDefaultTheme(): SpaceTheme {
    return {
      id: 'default',
      name: 'Professional',
      category: 'professional',
      visualStyle: {
        colorPalette: {
          primary: '#2563EB',
          secondary: '#64748B',
          accent: '#F59E0B',
          background: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#1E293B',
          highlight: '#EF4444',
          shadow: '#00000020'
        },
        lighting: {
          ambientLight: { color: '#FFFFFF', intensity: 0.4, enabled: true },
          directionalLights: [],
          pointLights: [],
          spotLights: [],
          environmentLighting: true,
          shadows: {
            enabled: true,
            quality: 'medium',
            cascades: 3,
            distance: 100,
            bias: 0.001
          },
          globalIllumination: false
        },
        materials: {
          surfaces: [],
          objects: [],
          particles: [],
          ui: []
        },
        effects: [],
        atmosphere: {
          fog: {
            enabled: false,
            type: 'linear',
            color: '#FFFFFF',
            density: 0.01,
            near: 10,
            far: 100
          },
          weather: {
            current: 'clear',
            effects: [],
            transitions: false,
            intensity: 0
          },
          timeOfDay: {
            enabled: false,
            current: 12,
            speed: 1,
            sunPosition: { x: 0, y: 10, z: 0 },
            moonPosition: { x: 0, y: -10, z: 0 }
          },
          seasons: false,
          dynamicWeather: false
        },
        skybox: {
          type: 'color',
          parameters: { color: '#87CEEB' }
        }
      },
      audioTheme: {
        ambientSounds: [],
        musicTracks: [],
        soundEffects: [],
        spatialAudio: {
          enabled: true,
          algorithm: 'hrtf',
          quality: 'medium',
          maxDistance: 50,
          rolloffFactor: 1,
          dopplerEffect: false,
          reverb: {
            enabled: true,
            preset: 'room',
            wetness: 0.3,
            roomSize: 0.5,
            decay: 1.5
          }
        },
        volume: {
          master: 1.0,
          ambient: 0.5,
          music: 0.3,
          effects: 0.8,
          voice: 1.0,
          ui: 0.6
        }
      },
      interactionStyle: {
        locomotion: {
          methods: ['teleport', 'smooth_locomotion'],
          speed: {
            walking: 3,
            running: 6,
            flying: 10,
            teleport: 0
          },
          boundaries: {
            type: 'invisible_wall',
            visualization: true,
            warnings: true
          },
          comfort: {
            vignetting: true,
            snapTurning: true,
            smoothTurning: false,
            motionSickness: 'medium'
          }
        },
        manipulation: {
          grabbing: {
            enabled: true,
            distance: 2,
            hapticFeedback: true,
            physics: true,
            constraints: []
          },
          pointing: {
            enabled: true,
            raycast: true,
            visualization: 'ray',
            feedback: 'visual'
          },
          scaling: {
            enabled: false,
            minScale: 0.1,
            maxScale: 10,
            uniform: true,
            constraints: []
          },
          rotation: {
            enabled: true,
            axes: ['x', 'y', 'z'],
            snapAngles: [15, 30, 45, 90],
            smooth: true
          }
        },
        communication: {
          voice: {
            enabled: true,
            quality: 'high',
            compression: 'opus',
            noiseReduction: true,
            echoCancellation: true,
            spatialAudio: true
          },
          text: {
            enabled: true,
            floating: true,
            persistent: false,
            translation: false,
            moderation: true
          },
          gestures: true,
          emotes: {
            enabled: true,
            library: {
              categories: [],
              animations: []
            },
            custom: false,
            triggers: []
          },
          proximity: {
            enabled: true,
            ranges: [
              { name: 'whisper', distance: 2, volume: 0.3, effects: [] },
              { name: 'normal', distance: 10, volume: 1.0, effects: [] },
              { name: 'shout', distance: 50, volume: 1.5, effects: [] }
            ],
            falloff: 'exponential'
          }
        },
        ui: {
          style: '3d',
          placement: 'world_space',
          interaction: 'point',
          scaling: 'distance_based',
          themes: []
        },
        gestures: {
          enabled: true,
          recognition: {
            hands: true,
            body: false,
            face: false,
            precision: 'medium',
            latency: 100
          },
          library: {
            categories: [],
            gestures: []
          },
          custom: false
        }
      },
      customizations: []
    };
  }

  private getDefaultEnvironment(): Environment3D {
    return {
      terrain: {
        enabled: true,
        type: 'flat',
        size: { x: 100, y: 1, z: 100 },
        resolution: 256,
        materials: [],
        collision: true,
        lod: false
      },
      buildings: [],
      objects: [],
      vegetation: [],
      water: {
        enabled: false,
        bodies: [],
        physics: {
          buoyancy: false,
          waves: {
            enabled: false,
            height: 0,
            frequency: 0,
            speed: 0,
            direction: { x: 0, y: 0, z: 0 }
          },
          currents: false,
          splash: false
        },
        rendering: {
          reflections: false,
          refractions: false,
          caustics: false,
          foam: false,
          underwater: {
            enabled: false,
            tint: '#0066CC',
            visibility: 10,
            bubbles: false,
            distortion: false
          }
        }
      },
      boundaries: [],
      spawnPoints: [
        {
          id: 'default',
          name: 'Default Spawn',
          position: { x: 0, y: 1, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          type: 'default',
          conditions: [],
          capacity: 100,
          active: true
        }
      ],
      landmarks: []
    };
  }

  private getDefaultPhysics(): PhysicsEngine {
    return {
      enabled: true,
      engine: 'built_in',
      gravity: { x: 0, y: -9.81, z: 0 },
      timeStep: 1/60,
      iterations: 10,
      collision: {
        algorithm: 'discrete',
        layers: [],
        matrix: {}
      },
      constraints: {
        joints: [],
        springs: [],
        motors: []
      },
      performance: {
        maxObjects: 1000,
        cullingDistance: 100,
        sleepThreshold: 0.1,
        optimizations: ['spatial_partitioning', 'broad_phase_culling']
      }
    };
  }

  private getDefaultNetworking(): NetworkingConfig {
    return {
      protocol: 'websocket',
      topology: 'client_server',
      synchronization: {
        frequency: 20,
        interpolation: true,
        prediction: true,
        compression: {
          enabled: true,
          algorithm: 'gzip',
          level: 6,
          threshold: 1024
        },
        prioritization: {
          distance: true,
          importance: true,
          frequency: true,
          bandwidth: true
        }
      },
      optimization: {
        culling: {
          distance: 100,
          frustum: true,
          occlusion: false,
          importance: true
        },
        batching: {
          enabled: true,
          maxSize: 100,
          timeout: 16,
          priority: true
        },
        caching: {
          enabled: true,
          size: 100,
          ttl: 300,
          strategy: 'lru'
        },
        streaming: {
          enabled: true,
          chunkSize: 1024,
          bufferSize: 4096,
          adaptive: true
        }
      },
      security: {
        encryption: true,
        authentication: true,
        authorization: true,
        rateLimit: {
          enabled: true,
          requests: 100,
          window: 60,
          burst: 10
        },
        validation: {
          input: true,
          state: true,
          physics: true,
          permissions: true
        }
      },
      scalability: {
        maxUsers: 100,
        loadBalancing: true,
        clustering: false,
        sharding: {
          enabled: false,
          strategy: 'spatial',
          shardSize: 50,
          overlap: 10
        },
        cdn: {
          enabled: false,
          provider: '',
          regions: [],
          caching: []
        }
      }
    };
  }

  private getDefaultAccessibility(): AccessibilityConfig {
    return {
      enabled: true,
      features: [],
      navigation: {
        audioBeacons: false,
        tactilePathways: false,
        voiceGuidance: false,
        simplifiedNavigation: false,
        landmarks: true,
        wayfinding: {
          enabled: true,
          visual: true,
          audio: false,
          haptic: false,
          pathfinding: {
            algorithm: 'astar',
            obstacles: true,
            dynamic: true,
            optimization: true
          }
        }
      },
      communication: {
        textToSpeech: false,
        speechToText: false,
        signLanguage: false,
        visualCues: true,
        simplifiedUI: false,
        translation: {
          enabled: false,
          languages: [],
          realTime: false,
          accuracy: 0.8,
          context: false
        }
      },
      interaction: {
        alternativeInputs: [],
        assistedInteraction: false,
        customControls: false,
        feedback: {
          visual: {
            enabled: true,
            contrast: 1.0,
            size: 1.0,
            color: '#FFFFFF',
            animation: true
          },
          audio: {
            enabled: false,
            volume: 1.0,
            pitch: 1.0,
            spatial: false,
            description: false
          },
          haptic: {
            enabled: false,
            intensity: 1.0,
            pattern: 'default',
            duration: 100,
            spatial: false
          },
          multimodal: false
        },
        automation: {
          enabled: false,
          tasks: [],
          triggers: [],
          learning: false
        }
      },
      customization: {
        profiles: [],
        preferences: {
          contrast: 1.0,
          fontSize: 1.0,
          audioDescription: false,
          subtitles: false,
          reducedMotion: false
        },
        adaptations: []
      }
    };
  }

  private getDefaultEconomy(): VirtualEconomy {
    return {
      enabled: false,
      currency: {
        name: 'UniCoin',
        symbol: 'UNI',
        totalSupply: 1000000,
        circulation: 0,
        exchangeRate: 1.0,
        stability: 'fixed'
      },
      marketplace: {
        enabled: false,
        categories: [],
        listings: [],
        fees: {
          listing: 0.01,
          transaction: 0.02,
          withdrawal: 0.005
        },
        moderation: {
          autoApproval: false,
          reviewRequired: true,
          bannedItems: [],
          reportSystem: true
        }
      },
      transactions: {
        escrow: true,
        instantTransfer: false,
        batchProcessing: true,
        auditTrail: true
      },
      rewards: {
        enabled: false,
        activities: [],
        multipliers: [],
        limits: {
          daily: 100,
          weekly: 500,
          monthly: 2000
        }
      },
      taxation: {
        enabled: false,
        rates: [],
        exemptions: [],
        redistribution: false
      }
    };
  }

  private getDefaultGovernance(): GovernanceRules {
    return {
      system: 'democracy',
      voting: {
        enabled: false,
        method: 'simple_majority',
        eligibility: {
          requirements: [],
          restrictions: [],
          verification: false
        },
        proposals: {
          submission: 'open',
          threshold: 10,
          duration: 7,
          categories: []
        }
      },
      roles: [],
      policies: [],
      enforcement: {
        automated: true,
        moderation: {
          moderators: [],
          tools: [],
          escalation: true,
          logging: true
        },
        appeals: {
          enabled: true,
          process: [],
          timeline: 7,
          reviewers: []
        },
        transparency: true
      }
    };
  }

  private getDefaultAnalytics(): SpaceAnalytics {
    return {
      enabled: true,
      metrics: [],
      reporting: {
        realTime: true,
        scheduled: [],
        dashboards: [],
        alerts: []
      },
      privacy: {
        anonymization: true,
        aggregation: true,
        retention: 30,
        consent: true
      },
      retention: 30
    };
  }

  private getDefaultCapacity(): SpaceCapacity {
    return {
      maxUsers: 100,
      maxConcurrent: 50,
      maxObjects: 1000,
      maxStorage: 1024 * 1024 * 1024, // 1GB
      scaling: {
        enabled: false,
        triggers: [],
        actions: [],
        cooldown: 300
      },
      monitoring: {
        enabled: true,
        metrics: ['user_count', 'object_count', 'memory_usage', 'cpu_usage'],
        alerts: true,
        forecasting: false
      }
    };
  }

  private getDefaultAvatar(): any {
    return {
      model: 'default_avatar',
      appearance: {},
      animations: [],
      accessories: []
    };
  }

  private getUserPermissions(userId: string, space: MetaverseSpace): string[] {
    // Mock permission system
    return ['join', 'speak', 'move', 'interact'];
  }

  // Public API
  getSpace(spaceId: string): MetaverseSpace | null {
    return this.spaces.get(spaceId) || null;
  }

  getAllSpaces(): MetaverseSpace[] {
    return Array.from(this.spaces.values());
  }

  getActiveUsers(): UserSession[] {
    return Array.from(this.activeUsers.values());
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export interface UserSession {
  id: string;
  userId: string;
  spaceId: string;
  joinedAt: Date;
  position: Vector3;
  rotation: Vector3;
  avatar: any;
  permissions: string[];
  status: 'active' | 'idle' | 'away' | 'disconnected';
}

// Export singleton instance
export const metaverseService = new MetaverseService();

// Utility functions
export const getSpaceTypeLabel = (type: SpaceType): string => {
  const labels: Record<SpaceType, string> = {
    'meeting_room': 'Meeting Room',
    'conference_hall': 'Conference Hall',
    'classroom': 'Classroom',
    'auditorium': 'Auditorium',
    'exhibition': 'Exhibition',
    'social_hub': 'Social Hub',
    'workspace': 'Workspace',
    'entertainment': 'Entertainment',
    'marketplace': 'Marketplace',
    'custom': 'Custom Space'
  };
  return labels[type] || type;
};

export const calculateSpaceComplexity = (space: MetaverseSpace): number => {
  let complexity = 0;
  
  // Environment complexity
  complexity += space.environment.buildings.length * 10;
  complexity += space.environment.objects.length * 5;
  complexity += space.environment.vegetation.length * 2;
  
  // Physics complexity
  if (space.physics.enabled) {
    complexity += 20;
  }
  
  // Economy complexity
  if (space.economy.enabled) {
    complexity += 15;
  }
  
  return complexity;
};

export const validateSpaceConfig = (config: Partial<MetaverseSpace>): string[] => {
  const errors: string[] = [];
  
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Space name is required');
  }
  
  if (config.capacity && config.capacity.maxUsers < 1) {
    errors.push('Maximum users must be at least 1');
  }
  
  return errors;
};