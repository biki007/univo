'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  EyeIcon, 
  CubeIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  SpeakerWaveIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { arvrService, VREnvironment, VRParticipant, AROverlay } from '@/lib/ar-vr-service';

interface ARVRMeetingProps {
  roomId: string;
  userId: string;
  userName: string;
  onClose?: () => void;
}

interface WebXRSupport {
  vr: boolean;
  ar: boolean;
  features: string[];
}

interface EnvironmentOption {
  id: string;
  name: string;
  type: string;
  thumbnail: string;
  description: string;
  maxParticipants: number;
}

const ARVRMeeting: React.FC<ARVRMeetingProps> = ({
  roomId,
  userId,
  userName,
  onClose
}) => {
  const [webxrSupport, setWebxrSupport] = useState<WebXRSupport | null>(null);
  const [isVRActive, setIsVRActive] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<VREnvironment | null>(null);
  const [participants, setParticipants] = useState<VRParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('default_conference');
  const [showEnvironmentSelector, setShowEnvironmentSelector] = useState(false);
  const [deviceType, setDeviceType] = useState<'vr' | 'ar' | 'desktop' | 'mobile'>('desktop');
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useState(false);
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(true);
  const [arOverlays, setArOverlays] = useState<AROverlay[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Available VR environments
  const environments: EnvironmentOption[] = [
    {
      id: 'default_conference',
      name: 'Modern Conference Room',
      type: 'conference_room',
      thumbnail: '/environments/conference_room_thumb.jpg',
      description: 'Professional meeting space with interactive displays',
      maxParticipants: 20
    },
    {
      id: 'classroom',
      name: 'Virtual Classroom',
      type: 'classroom',
      thumbnail: '/environments/classroom_thumb.jpg',
      description: 'Educational environment with whiteboards and seating',
      maxParticipants: 30
    },
    {
      id: 'auditorium',
      name: 'Grand Auditorium',
      type: 'auditorium',
      thumbnail: '/environments/auditorium_thumb.jpg',
      description: 'Large presentation space for webinars and events',
      maxParticipants: 100
    },
    {
      id: 'outdoor_pavilion',
      name: 'Outdoor Pavilion',
      type: 'outdoor',
      thumbnail: '/environments/outdoor_thumb.jpg',
      description: 'Natural setting with ambient sounds and lighting',
      maxParticipants: 25
    },
    {
      id: 'space_station',
      name: 'Space Station',
      type: 'space',
      thumbnail: '/environments/space_thumb.jpg',
      description: 'Futuristic zero-gravity meeting environment',
      maxParticipants: 15
    }
  ];

  // Check WebXR support on component mount
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const support = await arvrService.checkWebXRSupport();
        setWebxrSupport(support);
        
        // Detect device type
        if (support.vr && support.features.includes('hand-tracking')) {
          setDeviceType('vr');
          setHandTrackingEnabled(true);
        } else if (support.ar) {
          setDeviceType('ar');
        } else if (window.innerWidth <= 768) {
          setDeviceType('mobile');
        } else {
          setDeviceType('desktop');
        }
      } catch (error) {
        console.error('Failed to check WebXR support:', error);
        setError('Failed to initialize AR/VR capabilities');
      }
    };

    checkSupport();
  }, []);

  // Initialize VR session
  const startVRSession = useCallback(async () => {
    if (!webxrSupport?.vr) {
      setError('VR not supported on this device');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await arvrService.initializeVRSession(selectedEnvironment);
      if (success) {
        setIsVRActive(true);
        setCurrentEnvironment(arvrService.getCurrentEnvironment());
        
        // Add current user as VR participant
        await arvrService.addVRParticipant(userId, {
          name: userName,
          isVRUser: true,
          deviceType: 'vr'
        });

        // Update participants list
        setParticipants(arvrService.getParticipants());
        
        // Start render loop for fallback display
        startRenderLoop();
      } else {
        setError('Failed to start VR session');
      }
    } catch (error) {
      console.error('VR session error:', error);
      setError('VR session failed to start');
    } finally {
      setIsLoading(false);
    }
  }, [webxrSupport, selectedEnvironment, userId, userName]);

  // Initialize AR session
  const startARSession = useCallback(async () => {
    if (!webxrSupport?.ar) {
      setError('AR not supported on this device');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await arvrService.initializeARSession();
      if (success) {
        setIsARActive(true);
        
        // Add current user as AR participant
        await arvrService.addVRParticipant(userId, {
          name: userName,
          isVRUser: false,
          deviceType: 'ar'
        });

        // Create default AR overlays
        await createDefaultAROverlays();
        
        // Update participants list
        setParticipants(arvrService.getParticipants());
        
        // Start render loop for fallback display
        startRenderLoop();
      } else {
        setError('Failed to start AR session');
      }
    } catch (error) {
      console.error('AR session error:', error);
      setError('AR session failed to start');
    } finally {
      setIsLoading(false);
    }
  }, [webxrSupport, userId, userName]);

  // Create default AR overlays
  const createDefaultAROverlays = async () => {
    const overlays: AROverlay[] = [];

    // Meeting controls overlay
    const controlsOverlay = await arvrService.createAROverlay({
      type: 'ui_panel',
      position: { x: -0.5, y: 0, z: -1 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      content: {
        type: 'meeting_controls',
        buttons: ['mute', 'camera', 'share', 'leave']
      },
      trackingType: 'world',
      isVisible: true,
      permissions: [userId]
    });

    // Participant list overlay
    const participantsOverlay = await arvrService.createAROverlay({
      type: 'ui_panel',
      position: { x: 0.5, y: 0, z: -1 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      content: {
        type: 'participant_list',
        participants: participants
      },
      trackingType: 'world',
      isVisible: true,
      permissions: [userId]
    });

    // Shared content overlay
    const contentOverlay = await arvrService.createAROverlay({
      type: 'spatial_content',
      position: { x: 0, y: 0.5, z: -2 },
      rotation: { x: -15, y: 0, z: 0 },
      scale: { x: 2, y: 1.5, z: 1 },
      content: {
        type: 'shared_screen',
        url: null
      },
      trackingType: 'world',
      isVisible: false,
      permissions: []
    });

    setArOverlays([
      { id: controlsOverlay, type: 'ui_panel', position: { x: -0.5, y: 0, z: -1 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, content: {}, trackingType: 'world', isVisible: true, permissions: [userId] },
      { id: participantsOverlay, type: 'ui_panel', position: { x: 0.5, y: 0, z: -1 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, content: {}, trackingType: 'world', isVisible: true, permissions: [userId] },
      { id: contentOverlay, type: 'spatial_content', position: { x: 0, y: 0.5, z: -2 }, rotation: { x: -15, y: 0, z: 0 }, scale: { x: 2, y: 1.5, z: 1 }, content: {}, trackingType: 'world', isVisible: false, permissions: [] }
    ]);
  };

  // End AR/VR session
  const endSession = useCallback(async () => {
    try {
      await arvrService.endSession();
      setIsVRActive(false);
      setIsARActive(false);
      setCurrentEnvironment(null);
      setParticipants([]);
      setArOverlays([]);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, []);

  // Start render loop for fallback display
  const startRenderLoop = () => {
    const render = () => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw environment info
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText(`Environment: ${currentEnvironment?.name || 'AR Mode'}`, 20, 30);
      ctx.fillText(`Participants: ${participants.length}`, 20, 60);
      ctx.fillText(`Device: ${deviceType.toUpperCase()}`, 20, 90);

      // Draw participants
      participants.forEach((participant, index) => {
        const y = 120 + (index * 30);
        ctx.fillStyle = participant.isVRUser ? '#00ff00' : '#0099ff';
        ctx.fillText(`${participant.name} (${participant.deviceType})`, 20, y);
      });

      // Continue render loop
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Handle environment selection
  const handleEnvironmentSelect = (environmentId: string) => {
    setSelectedEnvironment(environmentId);
    setShowEnvironmentSelector(false);
  };

  // Handle participant interaction
  const handleParticipantInteraction = (participantId: string, action: string) => {
    console.log(`Participant ${participantId} performed ${action}`);
    // In a real implementation, this would trigger WebRTC or socket events
  };

  if (!webxrSupport) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span>Checking AR/VR capabilities...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AR/VR Status Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CubeIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Immersive Meeting</h2>
            </div>
            
            <div className="flex space-x-2">
              {webxrSupport.vr && (
                <Badge variant={isVRActive ? 'success' : 'secondary'}>
                  VR {isVRActive ? 'Active' : 'Available'}
                </Badge>
              )}
              {webxrSupport.ar && (
                <Badge variant={isARActive ? 'success' : 'secondary'}>
                  AR {isARActive ? 'Active' : 'Available'}
                </Badge>
              )}
              <Badge variant="secondary">
                {deviceType.toUpperCase()}
              </Badge>
            </div>
          </div>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-4 h-4" />
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

      {/* Environment Selection */}
      {!isVRActive && !isARActive && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Choose Environment</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEnvironmentSelector(!showEnvironmentSelector)}
              >
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                {showEnvironmentSelector ? 'Hide' : 'Show'} Options
              </Button>
            </div>

            {showEnvironmentSelector && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEnvironment === env.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleEnvironmentSelect(env.id)}
                  >
                    <div className="flex items-center justify-center mb-3 bg-gray-100 rounded aspect-video">
                      <CubeIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium">{env.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{env.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" size="sm">
                        {env.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Max {env.maxParticipants}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Environment Info */}
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <CubeIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">
                    {environments.find(e => e.id === selectedEnvironment)?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {environments.find(e => e.id === selectedEnvironment)?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Control Panel */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Controls</h3>
          
          {/* Main Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {webxrSupport.vr && !isARActive && (
              <Button
                onClick={isVRActive ? endSession : startVRSession}
                disabled={isLoading}
                className={isVRActive ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                {isVRActive ? 'Exit VR' : 'Enter VR'}
              </Button>
            )}

            {webxrSupport.ar && !isVRActive && (
              <Button
                onClick={isARActive ? endSession : startARSession}
                disabled={isLoading}
                variant={isARActive ? 'destructive' : 'default'}
              >
                <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
                {isARActive ? 'Exit AR' : 'Enter AR'}
              </Button>
            )}

            {!webxrSupport.vr && !webxrSupport.ar && (
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-700">
                    AR/VR not supported on this device. Use a compatible headset or mobile device.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Feature Toggles */}
          {(isVRActive || isARActive) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <HandRaisedIcon className="w-4 h-4" />
                  <span className="text-sm">Hand Tracking</span>
                </div>
                <Button
                  size="sm"
                  variant={handTrackingEnabled ? 'default' : 'outline'}
                  onClick={() => setHandTrackingEnabled(!handTrackingEnabled)}
                >
                  {handTrackingEnabled ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <EyeIcon className="w-4 h-4" />
                  <span className="text-sm">Eye Tracking</span>
                </div>
                <Button
                  size="sm"
                  variant={eyeTrackingEnabled ? 'default' : 'outline'}
                  onClick={() => setEyeTrackingEnabled(!eyeTrackingEnabled)}
                >
                  {eyeTrackingEnabled ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <SpeakerWaveIcon className="w-4 h-4" />
                  <span className="text-sm">Spatial Audio</span>
                </div>
                <Button
                  size="sm"
                  variant={spatialAudioEnabled ? 'default' : 'outline'}
                  onClick={() => setSpatialAudioEnabled(!spatialAudioEnabled)}
                >
                  {spatialAudioEnabled ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Participants Panel */}
      {(isVRActive || isARActive) && participants.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Participants ({participants.length})</h3>
            </div>

            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      participant.isVRUser ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-gray-600">
                        {participant.deviceType.toUpperCase()} • {
                          participant.isVRUser ? 'VR User' : 'AR/Desktop User'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Badge variant="secondary" size="sm">
                      {new Date(participant.lastUpdate).toLocaleTimeString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Fallback Display Canvas */}
      {(isVRActive || isARActive) && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Session Preview</h3>
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full bg-black border rounded-lg"
            />
            <p className="text-sm text-gray-600">
              This preview shows basic session information. The full immersive experience is active in your headset.
            </p>
          </div>
        </Card>
      )}

      {/* WebXR Features Info */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Supported Features</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {webxrSupport.features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm">{feature.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
          
          {webxrSupport.features.length === 0 && (
            <p className="text-gray-600">No advanced WebXR features detected.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ARVRMeeting;