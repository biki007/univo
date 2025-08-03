/**
 * Advanced Meeting Room Screen - React Native
 * Features: AI, Quantum Security, Blockchain Identity, Neural Interface, Metaverse
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import KeepAwake from 'react-native-keep-awake';
import HapticFeedback from 'react-native-haptic-feedback';

// WebRTC and Video Components
import { RTCView } from 'react-native-webrtc';
import VideoGrid from '../../components/meeting/VideoGrid';
import AudioControls from '../../components/meeting/AudioControls';
import VideoControls from '../../components/meeting/VideoControls';
import ScreenShareControls from '../../components/meeting/ScreenShareControls';

// Advanced Feature Components
import AIAssistantPanel from '../../components/meeting/AIAssistantPanel';
import QuantumSecurityPanel from '../../components/meeting/QuantumSecurityPanel';
import BlockchainIdentityPanel from '../../components/meeting/BlockchainIdentityPanel';
import NeuralInterfacePanel from '../../components/meeting/NeuralInterfacePanel';
import MetaversePanel from '../../components/meeting/MetaversePanel';
import HolographicAvatarPanel from '../../components/meeting/HolographicAvatarPanel';
import ARVRPanel from '../../components/meeting/ARVRPanel';

// UI Components
import ChatPanel from '../../components/meeting/ChatPanel';
import ParticipantsPanel from '../../components/meeting/ParticipantsPanel';
import WhiteboardPanel from '../../components/meeting/WhiteboardPanel';
import SettingsPanel from '../../components/meeting/SettingsPanel';
import RecordingControls from '../../components/meeting/RecordingControls';
import BreakoutRoomsPanel from '../../components/meeting/BreakoutRoomsPanel';

// Services
import { WebRTCService } from '../../services/WebRTCService';
import { AIService } from '../../services/AIService';
import { QuantumService } from '../../services/QuantumService';
import { BlockchainService } from '../../services/BlockchainService';
import { NeuralInterfaceService } from '../../services/NeuralInterfaceService';
import { MetaverseService } from '../../services/MetaverseService';
import { BiometricService } from '../../services/BiometricService';

// Utils
import { Colors } from '../../utils/Colors';
import { hapticFeedback } from '../../utils/HapticUtils';
import { trackEvent } from '../../utils/Analytics';

const { width, height } = Dimensions.get('window');

interface MeetingRoomProps {
  route: {
    params: {
      meetingId: string;
      meetingType: 'standard' | 'quantum' | 'metaverse' | 'neural';
      isHost: boolean;
      participants: any[];
    };
  };
}

const MeetingRoomScreen: React.FC<MeetingRoomProps> = ({ route }) => {
  const navigation = useNavigation();
  const { meetingId, meetingType, isHost, participants } = route.params;

  // State Management
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStreams, setRemoteStreams] = useState<any[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [networkQuality, setNetworkQuality] = useState('excellent');

  // Panel States
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Advanced Features State
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [quantumSecurityEnabled, setQuantumSecurityEnabled] = useState(false);
  const [blockchainIdentityVerified, setBlockchainIdentityVerified] = useState(false);
  const [neuralInterfaceConnected, setNeuralInterfaceConnected] = useState(false);
  const [metaverseMode, setMetaverseMode] = useState(false);
  const [holographicAvatarsEnabled, setHolographicAvatarsEnabled] = useState(false);
  const [arvrMode, setArvrMode] = useState(false);

  // Real-time AI Features
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [emotionRecognitionEnabled, setEmotionRecognitionEnabled] = useState(false);
  const [gestureRecognitionEnabled, setGestureRecognitionEnabled] = useState(false);

  // Refs
  const meetingStartTime = useRef(Date.now());
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeMeeting();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Update meeting duration every second
    const interval = setInterval(() => {
      setMeetingDuration(Math.floor((Date.now() - meetingStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeMeeting = async () => {
    try {
      // Lock to landscape for better meeting experience
      Orientation.lockToLandscape();
      
      // Keep screen awake during meeting
      KeepAwake.activate();

      // Hide status bar for immersive experience
      StatusBar.setHidden(true);

      // Initialize WebRTC connection
      await WebRTCService.joinMeeting(meetingId);
      setIsConnected(true);

      // Initialize advanced features based on meeting type
      await initializeAdvancedFeatures();

      // Track meeting join event
      trackEvent('meeting_joined', {
        meetingId,
        meetingType,
        isHost,
        participantCount: participants.length,
      });

      hapticFeedback('success');
    } catch (error) {
      console.error('Failed to initialize meeting:', error);
      Alert.alert('Connection Error', 'Failed to join the meeting. Please try again.');
      navigation.goBack();
    }
  };

  const initializeAdvancedFeatures = async () => {
    try {
      // Initialize AI Assistant
      if (meetingType !== 'standard') {
        await AIService.initializeMeetingAI(meetingId);
        setAiAssistantActive(true);
      }

      // Initialize Quantum Security
      if (meetingType === 'quantum' || meetingType === 'metaverse') {
        await QuantumService.establishSecureChannel(meetingId);
        setQuantumSecurityEnabled(true);
      }

      // Initialize Blockchain Identity
      await BlockchainService.verifyMeetingIdentity(meetingId);
      setBlockchainIdentityVerified(true);

      // Initialize Neural Interface
      if (meetingType === 'neural') {
        const neuralConnected = await NeuralInterfaceService.connectDevice();
        setNeuralInterfaceConnected(neuralConnected);
      }

      // Initialize Metaverse
      if (meetingType === 'metaverse') {
        await MetaverseService.enterVirtualWorld(meetingId);
        setMetaverseMode(true);
        setHolographicAvatarsEnabled(true);
      }

      // Initialize biometric authentication
      await BiometricService.authenticateForMeeting();

    } catch (error) {
      console.error('Failed to initialize advanced features:', error);
    }
  };

  const setupEventListeners = () => {
    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // WebRTC event listeners
    WebRTCService.on('localStream', (stream: any) => {
      setLocalStream(stream);
    });

    WebRTCService.on('remoteStream', (stream: any) => {
      setRemoteStreams(prev => [...prev, stream]);
    });

    WebRTCService.on('participantLeft', (participantId: string) => {
      setRemoteStreams(prev => prev.filter(stream => stream.id !== participantId));
    });

    WebRTCService.on('networkQuality', (quality: string) => {
      setNetworkQuality(quality);
    });

    return () => {
      backHandler.remove();
    };
  };

  const handleBackPress = () => {
    Alert.alert(
      'Leave Meeting',
      'Are you sure you want to leave the meeting?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: leaveMeeting },
      ]
    );
    return true;
  };

  const leaveMeeting = async () => {
    try {
      await WebRTCService.leaveMeeting();
      
      // Track meeting leave event
      trackEvent('meeting_left', {
        meetingId,
        duration: meetingDuration,
        meetingType,
      });

      cleanup();
      navigation.goBack();
    } catch (error) {
      console.error('Error leaving meeting:', error);
      navigation.goBack();
    }
  };

  const cleanup = () => {
    // Unlock orientation
    Orientation.unlockAllOrientations();
    
    // Deactivate keep awake
    KeepAwake.deactivate();
    
    // Show status bar
    StatusBar.setHidden(false);
    
    // Clear timeouts
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  };

  const toggleAudio = useCallback(async () => {
    try {
      await WebRTCService.toggleAudio();
      setIsAudioMuted(!isAudioMuted);
      hapticFeedback('light');
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  }, [isAudioMuted]);

  const toggleVideo = useCallback(async () => {
    try {
      await WebRTCService.toggleVideo();
      setIsVideoMuted(!isVideoMuted);
      hapticFeedback('light');
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  }, [isVideoMuted]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        await WebRTCService.stopScreenShare();
      } else {
        await WebRTCService.startScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
      hapticFeedback('medium');
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [isScreenSharing]);

  const toggleRecording = useCallback(async () => {
    try {
      if (isRecording) {
        await WebRTCService.stopRecording();
      } else {
        await WebRTCService.startRecording();
      }
      setIsRecording(!isRecording);
      hapticFeedback('heavy');
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  }, [isRecording]);

  const openPanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
    hapticFeedback('light');
  };

  const toggleControlsVisibility = () => {
    setShowControls(!showControls);
    
    if (showControls) {
      // Auto-hide controls after 5 seconds
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    } else if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAdvancedFeatureIndicators = () => (
    <View style={styles.featureIndicators}>
      {quantumSecurityEnabled && (
        <View style={[styles.indicator, styles.quantumIndicator]}>
          <Text style={styles.indicatorText}>🔐 Quantum</Text>
        </View>
      )}
      {blockchainIdentityVerified && (
        <View style={[styles.indicator, styles.blockchainIndicator]}>
          <Text style={styles.indicatorText}>⛓️ Verified</Text>
        </View>
      )}
      {neuralInterfaceConnected && (
        <View style={[styles.indicator, styles.neuralIndicator]}>
          <Text style={styles.indicatorText}>🧠 Neural</Text>
        </View>
      )}
      {metaverseMode && (
        <View style={[styles.indicator, styles.metaverseIndicator]}>
          <Text style={styles.indicatorText}>🌐 Metaverse</Text>
        </View>
      )}
      {aiAssistantActive && (
        <View style={[styles.indicator, styles.aiIndicator]}>
          <Text style={styles.indicatorText}>🤖 AI</Text>
        </View>
      )}
    </View>
  );

  const renderMainContent = () => {
    if (metaverseMode) {
      return <MetaversePanel meetingId={meetingId} />;
    }

    if (arvrMode) {
      return <ARVRPanel meetingId={meetingId} />;
    }

    return (
      <VideoGrid
        localStream={localStream}
        remoteStreams={remoteStreams}
        isVideoMuted={isVideoMuted}
        holographicAvatarsEnabled={holographicAvatarsEnabled}
        emotionRecognitionEnabled={emotionRecognitionEnabled}
        gestureRecognitionEnabled={gestureRecognitionEnabled}
      />
    );
  };

  const renderSidePanel = () => {
    switch (activePanel) {
      case 'chat':
        return <ChatPanel meetingId={meetingId} />;
      case 'participants':
        return <ParticipantsPanel participants={participants} />;
      case 'whiteboard':
        return <WhiteboardPanel meetingId={meetingId} />;
      case 'ai':
        return <AIAssistantPanel meetingId={meetingId} />;
      case 'quantum':
        return <QuantumSecurityPanel meetingId={meetingId} />;
      case 'blockchain':
        return <BlockchainIdentityPanel meetingId={meetingId} />;
      case 'neural':
        return <NeuralInterfacePanel meetingId={meetingId} />;
      case 'holographic':
        return <HolographicAvatarPanel meetingId={meetingId} />;
      case 'breakout':
        return <BreakoutRoomsPanel meetingId={meetingId} isHost={isHost} />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Connecting to meeting...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.mainContent} 
        activeOpacity={1}
        onPress={toggleControlsVisibility}
      >
        {renderMainContent()}
      </TouchableOpacity>

      {/* Meeting Info Header */}
      {showControls && (
        <View style={styles.header}>
          <View style={styles.meetingInfo}>
            <Text style={styles.meetingTitle}>Meeting {meetingId.slice(-6)}</Text>
            <Text style={styles.duration}>{formatDuration(meetingDuration)}</Text>
            <Text style={styles.networkQuality}>
              📶 {networkQuality}
            </Text>
          </View>
          {renderAdvancedFeatureIndicators()}
        </View>
      )}

      {/* Main Controls */}
      {showControls && (
        <View style={styles.controlsContainer}>
          <AudioControls 
            isMuted={isAudioMuted} 
            onToggle={toggleAudio}
            aiNoiseReduction={true}
          />
          <VideoControls 
            isMuted={isVideoMuted} 
            onToggle={toggleVideo}
            backgroundBlurEnabled={true}
          />
          <ScreenShareControls 
            isSharing={isScreenSharing} 
            onToggle={toggleScreenShare} 
          />
          <RecordingControls 
            isRecording={isRecording} 
            onToggle={toggleRecording}
            isHost={isHost}
          />
          
          <TouchableOpacity 
            style={styles.leaveButton}
            onPress={handleBackPress}
          >
            <Text style={styles.leaveButtonText}>Leave</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feature Panel Buttons */}
      {showControls && (
        <View style={styles.panelButtons}>
          <TouchableOpacity 
            style={[styles.panelButton, activePanel === 'chat' && styles.activePanelButton]}
            onPress={() => openPanel('chat')}
          >
            <Text style={styles.panelButtonText}>💬</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.panelButton, activePanel === 'participants' && styles.activePanelButton]}
            onPress={() => openPanel('participants')}
          >
            <Text style={styles.panelButtonText}>👥</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.panelButton, activePanel === 'whiteboard' && styles.activePanelButton]}
            onPress={() => openPanel('whiteboard')}
          >
            <Text style={styles.panelButtonText}>📝</Text>
          </TouchableOpacity>
          
          {aiAssistantActive && (
            <TouchableOpacity 
              style={[styles.panelButton, activePanel === 'ai' && styles.activePanelButton]}
              onPress={() => openPanel('ai')}
            >
              <Text style={styles.panelButtonText}>🤖</Text>
            </TouchableOpacity>
          )}
          
          {quantumSecurityEnabled && (
            <TouchableOpacity 
              style={[styles.panelButton, activePanel === 'quantum' && styles.activePanelButton]}
              onPress={() => openPanel('quantum')}
            >
              <Text style={styles.panelButtonText}>🔐</Text>
            </TouchableOpacity>
          )}
          
          {blockchainIdentityVerified && (
            <TouchableOpacity 
              style={[styles.panelButton, activePanel === 'blockchain' && styles.activePanelButton]}
              onPress={() => openPanel('blockchain')}
            >
              <Text style={styles.panelButtonText}>⛓️</Text>
            </TouchableOpacity>
          )}
          
          {neuralInterfaceConnected && (
            <TouchableOpacity 
              style={[styles.panelButton, activePanel === 'neural' && styles.activePanelButton]}
              onPress={() => openPanel('neural')}
            >
              <Text style={styles.panelButtonText}>🧠</Text>
            </TouchableOpacity>
          )}
          
          {holographicAvatarsEnabled && (
            <TouchableOpacity 
              style={[styles.panelButton, activePanel === 'holographic' && styles.activePanelButton]}
              onPress={() => openPanel('holographic')}
            >
              <Text style={styles.panelButtonText}>👻</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Side Panel */}
      {activePanel && (
        <View style={styles.sidePanel}>
          {renderSidePanel()}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  meetingTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  duration: {
    color: Colors.lightGray,
    fontSize: 14,
  },
  networkQuality: {
    color: Colors.green,
    fontSize: 12,
  },
  featureIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quantumIndicator: {
    backgroundColor: 'rgba(138, 43, 226, 0.8)',
  },
  blockchainIndicator: {
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
  },
  neuralIndicator: {
    backgroundColor: 'rgba(0, 255, 127, 0.8)',
  },
  metaverseIndicator: {
    backgroundColor: 'rgba(30, 144, 255, 0.8)',
  },
  aiIndicator: {
    backgroundColor: 'rgba(255, 20, 147, 0.8)',
  },
  indicatorText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  leaveButton: {
    backgroundColor: Colors.red,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  leaveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  panelButtons: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -100 }],
    gap: 10,
  },
  panelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePanelButton: {
    backgroundColor: Colors.primary,
  },
  panelButtonText: {
    fontSize: 20,
  },
  sidePanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.4,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderLeftWidth: 1,
    borderLeftColor: Colors.gray,
  },
});

export default MeetingRoomScreen;