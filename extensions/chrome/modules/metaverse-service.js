/**
 * Univo Chrome Extension - Metaverse Service Module
 * 3D virtual worlds and immersive meeting environments
 */

export class MetaverseService {
    static instance = null;
    static isInitialized = false;
    static virtualWorlds = new Map();
    static currentWorld = null;
    static avatarSystem = null;

    // Initialize Metaverse Service
    static async initialize(config = {}) {
        if (this.isInitialized) {
            return this.instance;
        }

        console.log('🌐 Initializing Metaverse Service...');

        this.config = {
            worldEngine: config.worldEngine || 'three.js',
            physicsEngine: config.physicsEngine || 'cannon.js',
            avatarSystem: config.avatarSystem || 'holographic',
            maxParticipants: config.maxParticipants || 100,
            renderQuality: config.renderQuality || 'high',
            ...config
        };

        try {
            // Initialize 3D engine
            await this.initialize3DEngine();
            
            // Set up avatar system
            await this.setupAvatarSystem();
            
            // Create default worlds
            await this.createDefaultWorlds();
            
            this.isInitialized = true;
            this.instance = this;
            
            console.log('✅ Metaverse Service initialized successfully');
            return this.instance;
            
        } catch (error) {
            console.error('❌ Metaverse Service initialization failed:', error);
            throw error;
        }
    }

    // Initialize 3D engine
    static async initialize3DEngine() {
        console.log(`🎮 Initializing 3D engine: ${this.config.worldEngine}`);
        
        this.engine3D = {
            name: this.config.worldEngine,
            version: '0.150.0',
            renderer: 'WebGL2',
            features: ['shadows', 'lighting', 'particles', 'post-processing'],
            maxTextures: 32,
            maxLights: 8,
            initialized: true
        };
        
        this.physicsEngine = {
            name: this.config.physicsEngine,
            version: '0.20.0',
            features: ['rigid-bodies', 'soft-bodies', 'constraints', 'collision-detection'],
            gravity: { x: 0, y: -9.81, z: 0 },
            initialized: true
        };
        
        console.log('✅ 3D engine initialized');
    }

    // Set up avatar system
    static async setupAvatarSystem() {
        console.log(`👤 Setting up avatar system: ${this.config.avatarSystem}`);
        
        this.avatarSystem = {
            type: this.config.avatarSystem,
            features: ['facial-animation', 'gesture-recognition', 'lip-sync', 'emotion-mapping'],
            models: {
                realistic: 'avatar-realistic-v2.glb',
                cartoon: 'avatar-cartoon-v1.glb',
                holographic: 'avatar-holographic-v3.glb'
            },
            animations: ['idle', 'talking', 'gesturing', 'walking', 'sitting'],
            customization: {
                appearance: true,
                clothing: true,
                accessories: true,
                expressions: true
            }
        };
        
        console.log('✅ Avatar system configured');
    }

    // Create default worlds
    static async createDefaultWorlds() {
        console.log('🏗️ Creating default virtual worlds...');
        
        const defaultWorlds = [
            {
                id: 'conference-room',
                name: 'Executive Conference Room',
                type: 'meeting-space',
                capacity: 20,
                environment: 'indoor',
                lighting: 'professional'
            },
            {
                id: 'auditorium',
                name: 'Virtual Auditorium',
                type: 'presentation-space',
                capacity: 500,
                environment: 'indoor',
                lighting: 'stage'
            },
            {
                id: 'outdoor-pavilion',
                name: 'Garden Pavilion',
                type: 'casual-space',
                capacity: 50,
                environment: 'outdoor',
                lighting: 'natural'
            },
            {
                id: 'space-station',
                name: 'Orbital Station',
                type: 'futuristic-space',
                capacity: 100,
                environment: 'space',
                lighting: 'artificial'
            }
        ];
        
        for (const worldConfig of defaultWorlds) {
            const world = await this.createVirtualWorld(worldConfig);
            this.virtualWorlds.set(worldConfig.id, world);
        }
        
        console.log('✅ Default virtual worlds created');
    }

    // Create virtual world
    static async createVirtualWorld(config) {
        console.log(`🌍 Creating virtual world: ${config.name}`);
        
        try {
            const world = {
                id: config.id || `world-${Date.now().toString(36)}`,
                name: config.name || 'Unnamed World',
                type: config.type || 'meeting-space',
                capacity: config.capacity || this.config.maxParticipants,
                environment: config.environment || 'indoor',
                lighting: config.lighting || 'natural',
                
                // 3D Scene properties
                scene: {
                    background: this.getEnvironmentBackground(config.environment),
                    fog: config.environment === 'outdoor' ? { near: 100, far: 1000 } : null,
                    ambientLight: { color: 0x404040, intensity: 0.4 },
                    directionalLight: { color: 0xffffff, intensity: 0.8 }
                },
                
                // Physics properties
                physics: {
                    enabled: config.physics !== false,
                    gravity: config.environment === 'space' ? 0 : -9.81,
                    collisionDetection: true
                },
                
                // Objects and furniture
                objects: this.generateWorldObjects(config),
                
                // Spawn points for avatars
                spawnPoints: this.generateSpawnPoints(config),
                
                // Interactive elements
                interactions: this.generateInteractions(config),
                
                // Participants
                participants: [],
                
                // Metadata
                created: Date.now(),
                lastUpdated: Date.now(),
                active: false
            };
            
            console.log(`✅ Virtual world created: ${world.name}`);
            return world;
            
        } catch (error) {
            console.error('❌ Failed to create virtual world:', error);
            throw error;
        }
    }

    // Get environment background
    static getEnvironmentBackground(environment) {
        const backgrounds = {
            indoor: { type: 'color', value: 0xf0f0f0 },
            outdoor: { type: 'skybox', value: 'sky-day.hdr' },
            space: { type: 'skybox', value: 'space-nebula.hdr' },
            underwater: { type: 'color', value: 0x006994 }
        };
        
        return backgrounds[environment] || backgrounds.indoor;
    }

    // Generate world objects
    static generateWorldObjects(config) {
        const objects = [];
        
        switch (config.type) {
            case 'meeting-space':
                objects.push(
                    { type: 'table', model: 'conference-table.glb', position: [0, 0, 0] },
                    { type: 'chairs', model: 'office-chair.glb', count: config.capacity, arrangement: 'around-table' },
                    { type: 'screen', model: 'presentation-screen.glb', position: [0, 2, -3] },
                    { type: 'whiteboard', model: 'whiteboard.glb', position: [-3, 1.5, -2] }
                );
                break;
                
            case 'presentation-space':
                objects.push(
                    { type: 'stage', model: 'stage-platform.glb', position: [0, 0.5, -5] },
                    { type: 'podium', model: 'speaker-podium.glb', position: [0, 0.5, -4] },
                    { type: 'seats', model: 'auditorium-seat.glb', count: config.capacity, arrangement: 'rows' },
                    { type: 'lighting', model: 'stage-lights.glb', position: [0, 5, -5] }
                );
                break;
                
            case 'casual-space':
                objects.push(
                    { type: 'seating', model: 'lounge-chair.glb', count: 10, arrangement: 'scattered' },
                    { type: 'tables', model: 'coffee-table.glb', count: 5, arrangement: 'with-seating' },
                    { type: 'plants', model: 'potted-plant.glb', count: 8, arrangement: 'decorative' }
                );
                break;
                
            case 'futuristic-space':
                objects.push(
                    { type: 'platform', model: 'holo-platform.glb', position: [0, 0, 0] },
                    { type: 'consoles', model: 'control-console.glb', count: 6, arrangement: 'circle' },
                    { type: 'displays', model: 'holo-display.glb', count: 4, arrangement: 'walls' }
                );
                break;
        }
        
        return objects;
    }

    // Generate spawn points
    static generateSpawnPoints(config) {
        const spawnPoints = [];
        const capacity = Math.min(config.capacity, 50); // Limit spawn points
        
        for (let i = 0; i < capacity; i++) {
            const angle = (i / capacity) * Math.PI * 2;
            const radius = 5 + Math.floor(i / 10) * 2; // Concentric circles
            
            spawnPoints.push({
                id: `spawn-${i}`,
                position: [
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                ],
                rotation: [0, -angle, 0],
                occupied: false
            });
        }
        
        return spawnPoints;
    }

    // Generate interactions
    static generateInteractions(config) {
        const interactions = [];
        
        // Common interactions for all world types
        interactions.push(
            { type: 'teleport', areas: ['spawn-area', 'meeting-area', 'break-area'] },
            { type: 'voice-zones', radius: 10, falloff: 'linear' },
            { type: 'gesture-recognition', enabled: true }
        );
        
        // Type-specific interactions
        switch (config.type) {
            case 'meeting-space':
                interactions.push(
                    { type: 'screen-sharing', target: 'presentation-screen' },
                    { type: 'whiteboard', target: 'whiteboard', collaborative: true }
                );
                break;
                
            case 'presentation-space':
                interactions.push(
                    { type: 'stage-control', target: 'stage', permissions: ['presenter'] },
                    { type: 'audience-reactions', enabled: true }
                );
                break;
        }
        
        return interactions;
    }

    // Enter virtual world
    static async enterVirtualWorld(worldId, userConfig = {}) {
        console.log(`🚪 Entering virtual world: ${worldId}`);
        
        try {
            const world = this.virtualWorlds.get(worldId);
            if (!world) {
                throw new Error(`Virtual world not found: ${worldId}`);
            }
            
            // Create user avatar
            const avatar = await this.createAvatar(userConfig);
            
            // Find available spawn point
            const spawnPoint = world.spawnPoints.find(sp => !sp.occupied);
            if (!spawnPoint) {
                throw new Error('No available spawn points in world');
            }
            
            // Position avatar at spawn point
            avatar.position = spawnPoint.position;
            avatar.rotation = spawnPoint.rotation;
            spawnPoint.occupied = true;
            
            // Add participant to world
            const participant = {
                id: `user-${Date.now().toString(36)}`,
                avatar: avatar,
                spawnPoint: spawnPoint.id,
                joinedAt: Date.now(),
                active: true
            };
            
            world.participants.push(participant);
            world.active = true;
            world.lastUpdated = Date.now();
            
            // Set as current world
            this.currentWorld = world;
            
            console.log('✅ Successfully entered virtual world');
            return { world, participant };
            
        } catch (error) {
            console.error('❌ Failed to enter virtual world:', error);
            throw error;
        }
    }

    // Create avatar
    static async createAvatar(userConfig = {}) {
        console.log('👤 Creating user avatar...');
        
        const avatar = {
            id: `avatar-${Date.now().toString(36)}`,
            type: userConfig.type || this.avatarSystem.type,
            model: userConfig.model || this.avatarSystem.models[this.avatarSystem.type],
            
            // Appearance
            appearance: {
                gender: userConfig.gender || 'neutral',
                skinTone: userConfig.skinTone || 'medium',
                hairColor: userConfig.hairColor || 'brown',
                eyeColor: userConfig.eyeColor || 'brown',
                height: userConfig.height || 1.75
            },
            
            // Clothing and accessories
            clothing: {
                outfit: userConfig.outfit || 'business-casual',
                colors: userConfig.colors || ['#2c3e50', '#3498db']
            },
            
            // Animation state
            animation: {
                current: 'idle',
                queue: [],
                blending: true
            },
            
            // Position and orientation
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            
            // Interaction state
            interactions: {
                speaking: false,
                gesturing: false,
                emotion: 'neutral'
            },
            
            // Metadata
            created: Date.now(),
            lastUpdated: Date.now()
        };
        
        console.log('✅ Avatar created successfully');
        return avatar;
    }

    // Update avatar animation
    static updateAvatarAnimation(avatarId, animation, options = {}) {
        if (!this.currentWorld) return;
        
        const participant = this.currentWorld.participants.find(p => p.avatar.id === avatarId);
        if (!participant) return;
        
        const avatar = participant.avatar;
        
        // Update animation
        if (options.immediate) {
            avatar.animation.current = animation;
            avatar.animation.queue = [];
        } else {
            avatar.animation.queue.push(animation);
        }
        
        avatar.lastUpdated = Date.now();
        
        // Dispatch animation event
        this.dispatchMetaverseEvent('avatarAnimation', {
            avatarId: avatarId,
            animation: animation,
            options: options
        });
    }

    // Handle avatar interaction
    static handleAvatarInteraction(avatarId, interaction) {
        if (!this.currentWorld) return;
        
        const participant = this.currentWorld.participants.find(p => p.avatar.id === avatarId);
        if (!participant) return;
        
        const avatar = participant.avatar;
        
        // Update interaction state
        switch (interaction.type) {
            case 'speaking':
                avatar.interactions.speaking = interaction.active;
                this.updateAvatarAnimation(avatarId, 'talking');
                break;
                
            case 'gesturing':
                avatar.interactions.gesturing = interaction.active;
                this.updateAvatarAnimation(avatarId, 'gesturing');
                break;
                
            case 'emotion':
                avatar.interactions.emotion = interaction.emotion;
                break;
        }
        
        avatar.lastUpdated = Date.now();
        
        // Dispatch interaction event
        this.dispatchMetaverseEvent('avatarInteraction', {
            avatarId: avatarId,
            interaction: interaction
        });
    }

    // Leave virtual world
    static async leaveVirtualWorld() {
        if (!this.currentWorld) return;
        
        console.log('🚪 Leaving virtual world...');
        
        try {
            // Find current user's participant
            const userParticipant = this.currentWorld.participants.find(p => p.active);
            
            if (userParticipant) {
                // Free spawn point
                const spawnPoint = this.currentWorld.spawnPoints.find(sp => sp.id === userParticipant.spawnPoint);
                if (spawnPoint) {
                    spawnPoint.occupied = false;
                }
                
                // Remove participant
                const index = this.currentWorld.participants.indexOf(userParticipant);
                this.currentWorld.participants.splice(index, 1);
                
                // Deactivate world if no participants
                if (this.currentWorld.participants.length === 0) {
                    this.currentWorld.active = false;
                }
                
                this.currentWorld.lastUpdated = Date.now();
            }
            
            this.currentWorld = null;
            
            console.log('✅ Successfully left virtual world');
            
        } catch (error) {
            console.error('❌ Failed to leave virtual world:', error);
            throw error;
        }
    }

    // Dispatch metaverse event
    static dispatchMetaverseEvent(eventName, detail) {
        const event = new CustomEvent(`univoMetaverse${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`, {
            detail: detail
        });
        document.dispatchEvent(event);
    }

    // Get metaverse status
    static getMetaverseStatus() {
        return {
            initialized: this.isInitialized,
            engine3D: this.engine3D,
            physicsEngine: this.physicsEngine,
            avatarSystem: this.avatarSystem,
            availableWorlds: Array.from(this.virtualWorlds.keys()),
            currentWorld: this.currentWorld ? {
                id: this.currentWorld.id,
                name: this.currentWorld.name,
                participants: this.currentWorld.participants.length,
                active: this.currentWorld.active
            } : null
        };
    }

    // Clean up metaverse resources
    static cleanup() {
        console.log('🧹 Cleaning up Metaverse Service...');
        
        // Leave current world
        if (this.currentWorld) {
            this.leaveVirtualWorld();
        }
        
        // Clear virtual worlds
        this.virtualWorlds.clear();
        this.currentWorld = null;
        this.avatarSystem = null;
        this.engine3D = null;
        this.physicsEngine = null;
        
        this.isInitialized = false;
        this.instance = null;
        
        console.log('✅ Metaverse Service cleanup completed');
    }
}

export default MetaverseService;