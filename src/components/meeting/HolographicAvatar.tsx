'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  UserIcon,
  SparklesIcon,
  FaceSmileIcon,
  MicrophoneIcon,
  EyeIcon,
  HandRaisedIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  holographicAvatarService, 
  type HolographicAvatar, 
  type AvatarSession,
  type EmotionType,
  getEmotionIntensityLabel,
  getAvatarTypeLabel,
  calculateAvatarScore
} from '@/lib/holographic-avatar-service';

interface HolographicAvatarProps {
  userId: string;
  meetingId?: string;
  onClose?: () => void;
}

const HolographicAvatar: React.FC<HolographicAvatarProps> = ({
  userId,
  meetingId,
  onClose
}) => {
  const [avatars, setAvatars] = useState<HolographicAvatar[]>([]);
  const [activeAvatar, setActiveAvatar] = useState<HolographicAvatar | null>(null);
  const [activeSession, setActiveSession] = useState<AvatarSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateAvatar, setShowCreateAvatar] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  
  // Avatar creation form
  const [avatarConfig, setAvatarConfig] = useState({
    name: '',
    type: 'photorealistic' as const,
    gender: 'non-binary' as const,
    age: 30,
    personality: {
      friendliness: 0.7,
      professionalism: 0.8,
      humor: 0.5,
      empathy: 0.8
    },
    voice: {
      pitch: 200,
      speed: 150,
      tone: 'professional' as const
    }
  });

  // Real-time avatar state
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(0.5);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gestureActive, setGestureActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    initializeAvatarService();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const initializeAvatarService = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const initialized = await holographicAvatarService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize holographic avatar service');
      }

      // Load user's avatars
      const userAvatars = holographicAvatarService.getAllAvatars()
        .filter(avatar => avatar.userId === userId);
      
      setAvatars(userAvatars);

      // If no avatars exist, show create dialog
      if (userAvatars.length === 0) {
        setShowCreateAvatar(true);
      }
    } catch (error) {
      console.error('Failed to initialize avatar service:', error);
      setError('Failed to initialize holographic avatar service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAvatar = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newAvatar = await holographicAvatarService.createAvatar({
        userId,
        name: avatarConfig.name,
        type: avatarConfig.type,
        appearance: {
          gender: avatarConfig.gender,
          age: avatarConfig.age,
          ethnicity: 'mixed',
          height: 1.7,
          build: 'average',
          facialFeatures: {
            faceShape: 'oval',
            eyeShape: 'almond',
            noseShape: 'straight',
            lipShape: 'full',
            jawline: 'soft',
            cheekbones: 'subtle',
            eyebrows: 'arched'
          },
          hair: {
            type: 'medium',
            color: '#8B4513',
            texture: 'medium',
            style: 'professional',
            length: 20
          },
          clothing: {
            category: 'business',
            topColor: '#2563EB',
            bottomColor: '#1F2937',
            style: 'modern',
            accessories: []
          },
          accessories: [],
          skinTone: '#F4A460',
          eyeColor: '#8B4513',
          voiceProfile: {
            pitch: avatarConfig.voice.pitch,
            speed: avatarConfig.voice.speed,
            accent: 'neutral',
            language: 'en-US',
            tone: avatarConfig.voice.tone,
            emotionalRange: 0.7,
            clarity: 0.9
          }
        },
        personality: {
          traits: [
            { name: 'Friendliness', value: avatarConfig.personality.friendliness, description: 'How friendly the avatar is', category: 'social' },
            { name: 'Professionalism', value: avatarConfig.personality.professionalism, description: 'Professional demeanor', category: 'behavioral' },
            { name: 'Humor', value: avatarConfig.personality.humor, description: 'Sense of humor', category: 'social' },
            { name: 'Empathy', value: avatarConfig.personality.empathy, description: 'Emotional understanding', category: 'emotional' }
          ],
          communicationStyle: {
            formality: 'neutral',
            directness: 'balanced',
            enthusiasm: avatarConfig.personality.friendliness,
            supportiveness: avatarConfig.personality.empathy,
            questioningStyle: 'clarifying'
          },
          emotionalIntelligence: avatarConfig.personality.empathy,
          humor: {
            enabled: avatarConfig.personality.humor > 0.5,
            type: 'professional',
            frequency: 'occasional',
            appropriateness: 0.9
          },
          professionalism: avatarConfig.personality.professionalism,
          friendliness: avatarConfig.personality.friendliness,
          assertiveness: 0.6,
          empathy: avatarConfig.personality.empathy,
          creativity: 0.7,
          adaptability: 0.8
        }
      });

      setAvatars([...avatars, newAvatar]);
      setShowCreateAvatar(false);
      
      // Reset form
      setAvatarConfig({
        name: '',
        type: 'photorealistic',
        gender: 'non-binary',
        age: 30,
        personality: {
          friendliness: 0.7,
          professionalism: 0.8,
          humor: 0.5,
          empathy: 0.8
        },
        voice: {
          pitch: 200,
          speed: 150,
          tone: 'professional'
        }
      });
    } catch (error) {
      console.error('Failed to create avatar:', error);
      setError('Failed to create holographic avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAvatar = async (avatar: HolographicAvatar) => {
    try {
      setIsLoading(true);
      setError(null);

      const session = await holographicAvatarService.activateAvatar(avatar.id, meetingId || 'demo');
      setActiveAvatar(avatar);
      setActiveSession(session);
      
      // Start rendering loop
      startAvatarRendering();
    } catch (error) {
      console.error('Failed to activate avatar:', error);
      setError('Failed to activate holographic avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAvatar = async () => {
    try {
      if (!activeSession) return;

      await holographicAvatarService.deactivateAvatar(activeSession.id);
      setActiveAvatar(null);
      setActiveSession(null);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } catch (error) {
      console.error('Failed to deactivate avatar:', error);
      setError('Failed to deactivate avatar');
    }
  };

  const handleEmotionChange = async (emotion: EmotionType, intensity: number) => {
    try {
      if (!activeAvatar) return;

      await holographicAvatarService.updateAvatarEmotion(
        activeAvatar.id,
        emotion,
        intensity,
        [
          {
            type: 'user_input',
            source: 'user_control',
            confidence: 1.0,
            timestamp: new Date(),
            data: { emotion, intensity }
          }
        ]
      );

      setCurrentEmotion(emotion);
      setEmotionIntensity(intensity);
    } catch (error) {
      console.error('Failed to update avatar emotion:', error);
    }
  };

  const handleProcessInput = async (inputText: string) => {
    try {
      if (!activeSession) return;

      setIsSpeaking(true);
      
      const interaction = await holographicAvatarService.processInteraction(
        activeSession.id,
        {
          type: 'text',
          content: inputText,
          context: 'user_input'
        }
      );

      if (interaction) {
        console.log('Avatar interaction:', interaction);
        // Update UI based on interaction
        setTimeout(() => setIsSpeaking(false), 2000);
      }
    } catch (error) {
      console.error('Failed to process avatar input:', error);
    }
  };

  const startAvatarRendering = () => {
    const render = () => {
      if (!canvasRef.current || !activeAvatar) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw avatar placeholder (in real implementation, this would be 3D rendering)
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(50, 50, 200, 300);

      // Draw avatar info
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText(`Avatar: ${activeAvatar.name}`, 20, 30);
      ctx.fillText(`Emotion: ${currentEmotion} (${Math.round(emotionIntensity * 100)}%)`, 20, 380);
      ctx.fillText(`Speaking: ${isSpeaking ? 'Yes' : 'No'}`, 20, 400);

      // Draw emotion indicator
      const emotionColor = getEmotionColor(currentEmotion);
      ctx.fillStyle = emotionColor;
      ctx.beginPath();
      ctx.arc(270, 100, 20 * emotionIntensity, 0, 2 * Math.PI);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const getEmotionColor = (emotion: EmotionType): string => {
    const colors: Record<EmotionType, string> = {
      joy: '#FFD700',
      sadness: '#4169E1',
      anger: '#FF4500',
      fear: '#800080',
      surprise: '#FF69B4',
      disgust: '#228B22',
      contempt: '#8B4513',
      neutral: '#808080',
      excitement: '#FF6347',
      confusion: '#DDA0DD',
      concentration: '#4682B4',
      boredom: '#696969',
      interest: '#32CD32',
      empathy: '#FF1493',
      frustration: '#DC143C'
    };
    return colors[emotion] || '#808080';
  };

  if (isLoading && avatars.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span>Loading holographic avatars...</span>
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
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Holographic Avatar</h2>
            {activeAvatar && (
              <Badge variant="success">Active</Badge>
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
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </Card>

      {/* Avatar Selection */}
      {!activeAvatar && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Avatars</h3>
              <Button onClick={() => setShowCreateAvatar(true)}>
                <UserIcon className="w-4 h-4 mr-2" />
                Create Avatar
              </Button>
            </div>

            {avatars.length === 0 ? (
              <div className="py-8 text-center">
                <UserIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">No avatars created yet</p>
                <p className="text-sm text-gray-500">Create your first AI-powered holographic avatar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {avatars.map((avatar) => (
                  <div key={avatar.id} className="p-4 border rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{avatar.name}</h4>
                        <Badge variant="secondary">
                          {getAvatarTypeLabel(avatar.type)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-center w-full h-32 bg-gray-100 rounded">
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Quality Score:</span>
                          <span className="font-medium">
                            {Math.round(calculateAvatarScore(avatar) * 100)}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emotion Recognition:</span>
                          <span className={avatar.capabilities.emotionRecognition ? 'text-green-600' : 'text-gray-400'}>
                            {avatar.capabilities.emotionRecognition ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Speech Synthesis:</span>
                          <span className={avatar.speechSynthesis.enabled ? 'text-green-600' : 'text-gray-400'}>
                            {avatar.speechSynthesis.enabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => handleActivateAvatar(avatar)}
                        disabled={isLoading}
                      >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Activate Avatar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Active Avatar Controls */}
      {activeAvatar && (
        <>
          {/* Avatar Display */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{activeAvatar.name}</h3>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => setShowCustomization(true)}>
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleDeactivateAvatar}>
                    <PauseIcon className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                width={300}
                height={400}
                className="w-full max-w-sm mx-auto bg-black border rounded-lg"
              />
            </div>
          </Card>

          {/* Emotion Controls */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Emotion Control</h3>
              
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(['joy', 'sadness', 'anger', 'surprise', 'neutral', 'excitement', 'concentration', 'empathy'] as EmotionType[]).map((emotion) => (
                  <Button
                    key={emotion}
                    size="sm"
                    variant={currentEmotion === emotion ? 'default' : 'ghost'}
                    onClick={() => handleEmotionChange(emotion, 0.8)}
                    className="capitalize"
                  >
                    <FaceSmileIcon className="w-4 h-4 mr-2" />
                    {emotion}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Emotion Intensity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={emotionIntensity}
                  onChange={(e) => {
                    const intensity = parseFloat(e.target.value);
                    setEmotionIntensity(intensity);
                    handleEmotionChange(currentEmotion, intensity);
                  }}
                  className="w-full"
                  aria-label="Emotion intensity slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>{getEmotionIntensityLabel(emotionIntensity)}</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Interaction Panel */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Avatar Interaction</h3>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message for your avatar to respond to..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleProcessInput(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button>
                  <MicrophoneIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Speaking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${gestureActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Gesturing</span>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Create Avatar Modal */}
      <Modal
        isOpen={showCreateAvatar}
        onClose={() => setShowCreateAvatar(false)}
        title="Create Holographic Avatar"
      >
        <div className="space-y-4">
          <Input
            label="Avatar Name"
            value={avatarConfig.name}
            onChange={(e) => setAvatarConfig({ ...avatarConfig, name: e.target.value })}
            placeholder="Enter avatar name"
            required
          />

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Avatar Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={avatarConfig.type}
              onChange={(e) => setAvatarConfig({ ...avatarConfig, type: e.target.value as any })}
              aria-label="Select avatar type"
            >
              <option value="photorealistic">Photorealistic</option>
              <option value="stylized">Stylized</option>
              <option value="cartoon">Cartoon</option>
              <option value="hologram">Hologram</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={avatarConfig.gender}
              onChange={(e) => setAvatarConfig({ ...avatarConfig, gender: e.target.value as any })}
              aria-label="Select gender"
            >
              <option value="non-binary">Non-binary</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Age: {avatarConfig.age}</label>
            <input
              type="range"
              min="18"
              max="80"
              value={avatarConfig.age}
              onChange={(e) => setAvatarConfig({ ...avatarConfig, age: parseInt(e.target.value) })}
              className="w-full"
              aria-label="Avatar age slider"
            />
          </div>

          {/* Personality Sliders */}
          <div className="space-y-3">
            <h4 className="font-medium">Personality Traits</h4>
            
            {Object.entries(avatarConfig.personality).map(([trait, value]) => (
              <div key={trait}>
                <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
                  {trait}: {Math.round(value * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={value}
                  onChange={(e) => setAvatarConfig({
                    ...avatarConfig,
                    personality: {
                      ...avatarConfig.personality,
                      [trait]: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full"
                  aria-label={`${trait} personality trait slider`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="ghost" onClick={() => setShowCreateAvatar(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAvatar}
              disabled={!avatarConfig.name.trim() || isLoading}
            >
              Create Avatar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HolographicAvatar;