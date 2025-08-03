'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  CpuChipIcon,
  BoltIcon,
  EyeIcon,
  HandRaisedIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  neuralInterfaceService, 
  type NeuralInterface, 
  type NeuralSession,
  type NeuralDeviceType,
  getDeviceTypeLabel,
  getSignalQualityLabel,
  getCommandTypeLabel,
  calculateCalibrationScore
} from '@/lib/neural-interface-service';

interface NeuralInterfaceProps {
  userId: string;
  meetingId?: string;
  onClose?: () => void;
}

const NeuralInterface: React.FC<NeuralInterfaceProps> = ({
  userId,
  meetingId,
  onClose
}) => {
  const [interfaces, setInterfaces] = useState<NeuralInterface[]>([]);
  const [activeInterface, setActiveInterface] = useState<NeuralInterface | null>(null);
  const [activeSession, setActiveSession] = useState<NeuralSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeviceSetup, setShowDeviceSetup] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  
  // Device setup configuration
  const [deviceConfig, setDeviceConfig] = useState({
    type: 'eeg_headset' as NeuralDeviceType,
    manufacturer: '',
    model: '',
    channels: 8,
    samplingRate: 256
  });

  // Real-time neural data
  const [neuralData, setNeuralData] = useState({
    signalQuality: 0,
    commandAccuracy: 0,
    calibrationScore: 0,
    activeCommands: [] as string[],
    lastCommand: '',
    brainActivity: {
      alpha: 0,
      beta: 0,
      gamma: 0,
      theta: 0,
      delta: 0
    }
  });

  useEffect(() => {
    initializeNeuralService();
    const interval = setInterval(updateNeuralData, 100); // 10Hz updates
    return () => clearInterval(interval);
  }, []);

  const initializeNeuralService = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const initialized = await neuralInterfaceService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize neural interface service');
      }

      // Load user's neural interfaces
      const userInterfaces = neuralInterfaceService.getAllInterfaces()
        .filter(iface => iface.userId === userId);
      
      setInterfaces(userInterfaces);

      // If no interfaces exist, show device setup
      if (userInterfaces.length === 0) {
        setShowDeviceSetup(true);
      }
    } catch (error) {
      console.error('Failed to initialize neural interface service:', error);
      setError('Failed to initialize neural interface service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectDevice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newInterface = await neuralInterfaceService.connectDevice(
        userId,
        deviceConfig.type,
        {
          manufacturer: deviceConfig.manufacturer,
          model: deviceConfig.model,
          channels: deviceConfig.channels,
          samplingRate: deviceConfig.samplingRate
        }
      );

      setInterfaces([...interfaces, newInterface]);
      setShowDeviceSetup(false);
      
      // Reset form
      setDeviceConfig({
        type: 'eeg_headset',
        manufacturer: '',
        model: '',
        channels: 8,
        samplingRate: 256
      });
    } catch (error) {
      console.error('Failed to connect neural device:', error);
      setError('Failed to connect neural interface device');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalibrateInterface = async (interfaceId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const calibrationData = await neuralInterfaceService.calibrateInterface(interfaceId);
      
      // Update interface with new calibration
      setInterfaces(interfaces.map(iface => 
        iface.id === interfaceId 
          ? { ...iface, calibration: calibrationData }
          : iface
      ));

      setShowCalibration(false);
    } catch (error) {
      console.error('Failed to calibrate interface:', error);
      setError('Failed to calibrate neural interface');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async (neuralInterface: NeuralInterface) => {
    try {
      setIsLoading(true);
      setError(null);

      const session = await neuralInterfaceService.startSession(
        neuralInterface.id,
        meetingId
      );

      setActiveInterface(neuralInterface);
      setActiveSession(session);
      
      // Start neural data monitoring
      startNeuralMonitoring();
    } catch (error) {
      console.error('Failed to start neural session:', error);
      setError('Failed to start neural interface session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      if (!activeSession) return;

      await neuralInterfaceService.endSession(activeSession.id);
      setActiveInterface(null);
      setActiveSession(null);
    } catch (error) {
      console.error('Failed to end neural session:', error);
      setError('Failed to end neural session');
    }
  };

  const startNeuralMonitoring = () => {
    // Mock real-time neural data updates
    const updateData = () => {
      if (!activeInterface) return;

      setNeuralData(prev => ({
        signalQuality: Math.max(0, Math.min(1, prev.signalQuality + (Math.random() - 0.5) * 0.1)),
        commandAccuracy: Math.max(0, Math.min(1, prev.commandAccuracy + (Math.random() - 0.5) * 0.05)),
        calibrationScore: calculateCalibrationScore(activeInterface.calibration),
        activeCommands: prev.activeCommands,
        lastCommand: prev.lastCommand,
        brainActivity: {
          alpha: Math.max(0, prev.brainActivity.alpha + (Math.random() - 0.5) * 5),
          beta: Math.max(0, prev.brainActivity.beta + (Math.random() - 0.5) * 3),
          gamma: Math.max(0, prev.brainActivity.gamma + (Math.random() - 0.5) * 2),
          theta: Math.max(0, prev.brainActivity.theta + (Math.random() - 0.5) * 4),
          delta: Math.max(0, prev.brainActivity.delta + (Math.random() - 0.5) * 6)
        }
      }));
    };

    // Simulate command detection
    const detectCommand = () => {
      if (!activeInterface || Math.random() > 0.1) return; // 10% chance per update

      const commands = activeInterface.commands.map(cmd => cmd.type);
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      
      setNeuralData(prev => ({
        ...prev,
        lastCommand: getCommandTypeLabel(randomCommand),
        activeCommands: [randomCommand, ...prev.activeCommands.slice(0, 4)]
      }));
    };

    const interval = setInterval(() => {
      updateData();
      detectCommand();
    }, 100);

    return () => clearInterval(interval);
  };

  const updateNeuralData = () => {
    if (!activeInterface) return;
    // This would be called by the real neural interface service
  };

  const getDeviceStatusColor = (status: string): string => {
    switch (status) {
      case 'connected': return 'success';
      case 'active': return 'success';
      case 'calibrating': return 'warning';
      case 'error': return 'error';
      default: return 'secondary';
    }
  };

  const getSignalQualityColor = (quality: number): string => {
    if (quality >= 0.8) return 'success';
    if (quality >= 0.6) return 'warning';
    return 'error';
  };

  if (isLoading && interfaces.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span>Initializing neural interface...</span>
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
            <CpuChipIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Neural Interface</h2>
            {activeInterface && (
              <Badge variant="success">Active Session</Badge>
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
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </Card>

      {/* Device Selection */}
      {!activeInterface && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Neural Devices</h3>
              <Button onClick={() => setShowDeviceSetup(true)}>
                <BoltIcon className="w-4 h-4 mr-2" />
                Connect Device
              </Button>
            </div>

            {interfaces.length === 0 ? (
              <div className="py-8 text-center">
                <CpuChipIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">No neural devices connected</p>
                <p className="text-sm text-gray-500">Connect your first brain-computer interface</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interfaces.map((neuralInterface) => (
                  <div key={neuralInterface.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {getDeviceTypeLabel(neuralInterface.deviceType)}
                          </h4>
                          <Badge variant={getDeviceStatusColor(neuralInterface.status) as any} size="sm">
                            {neuralInterface.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {neuralInterface.deviceInfo.manufacturer} {neuralInterface.deviceInfo.model}
                        </p>
                        <p className="text-sm text-gray-600">
                          Channels: {neuralInterface.deviceInfo.channels} | 
                          Sampling Rate: {neuralInterface.deviceInfo.samplingRate}Hz
                        </p>
                        
                        {/* Signal Quality */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Signal Quality:</span>
                            <Badge variant={getSignalQualityColor(neuralInterface.deviceInfo.signalQuality.overall) as any} size="sm">
                              {getSignalQualityLabel(neuralInterface.deviceInfo.signalQuality.overall)}
                            </Badge>
                          </div>
                          <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                              style={{ width: `${neuralInterface.deviceInfo.signalQuality.overall * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Calibration Status */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Calibration:</span>
                            <span className="font-medium">
                              {Math.round(calculateCalibrationScore(neuralInterface.calibration) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setActiveInterface(neuralInterface);
                            setShowCalibration(true);
                          }}
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStartSession(neuralInterface)}
                          disabled={neuralInterface.status !== 'connected'}
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Start Session
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Active Session */}
      {activeInterface && activeSession && (
        <>
          {/* Session Controls */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Neural Session</h3>
                <Button size="sm" variant="destructive" onClick={handleEndSession}>
                  <PauseIcon className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <SignalIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Signal Quality</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    {Math.round(neuralData.signalQuality * 100)}%
                  </p>
                  <p className="text-xs text-blue-600">
                    {getSignalQualityLabel(neuralData.signalQuality)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Command Accuracy</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-green-900">
                    {Math.round(neuralData.commandAccuracy * 100)}%
                  </p>
                  <p className="text-xs text-green-600">Recognition rate</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50">
                  <div className="flex items-center space-x-2">
                    <CpuChipIcon className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Calibration</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-purple-900">
                    {Math.round(neuralData.calibrationScore * 100)}%
                  </p>
                  <p className="text-xs text-purple-600">System accuracy</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Brain Activity */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Brain Activity</h3>
              
              <div className="space-y-3">
                {Object.entries(neuralData.brainActivity).map(([band, value]) => (
                  <div key={band}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{band} Wave:</span>
                      <span>{Math.round(value)}μV</span>
                    </div>
                    <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 transition-all duration-300 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${Math.min(100, (value / 50) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Command History */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Neural Commands</h3>
              
              {neuralData.lastCommand && (
                <div className="p-3 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Last Command:</span>
                    <span className="text-green-700">{neuralData.lastCommand}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Recent Commands:</h4>
                {neuralData.activeCommands.length === 0 ? (
                  <p className="text-sm text-gray-500">No commands detected yet</p>
                ) : (
                  <div className="space-y-1">
                    {neuralData.activeCommands.map((command, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{getCommandTypeLabel(command as any)}</span>
                        <span className="text-gray-500">({index === 0 ? 'just now' : `${index}s ago`})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Available Commands */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Commands</h3>
              
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {activeInterface.commands.map((command) => (
                  <div key={command.id} className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      {command.type === 'cursor_control' && <HandRaisedIcon className="w-4 h-4" />}
                      {command.type === 'click' && <BoltIcon className="w-4 h-4" />}
                      {command.type === 'attention_focus' && <EyeIcon className="w-4 h-4" />}
                      <span className="text-sm font-medium">{command.name}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{command.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Accuracy:</span>
                        <span className="font-medium">{Math.round(command.accuracy * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Device Setup Modal */}
      <Modal
        isOpen={showDeviceSetup}
        onClose={() => setShowDeviceSetup(false)}
        title="Connect Neural Device"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Device Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={deviceConfig.type}
              onChange={(e) => setDeviceConfig({ ...deviceConfig, type: e.target.value as NeuralDeviceType })}
              aria-label="Select device type"
            >
              <option value="eeg_headset">EEG Headset</option>
              <option value="eye_tracker">Eye Tracker</option>
              <option value="emg_sensor">EMG Sensor</option>
              <option value="non_invasive_bci">Non-invasive BCI</option>
              <option value="hybrid_bci">Hybrid BCI</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Manufacturer</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={deviceConfig.manufacturer}
                onChange={(e) => setDeviceConfig({ ...deviceConfig, manufacturer: e.target.value })}
                placeholder="e.g., Emotiv, NeuroSky"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={deviceConfig.model}
                onChange={(e) => setDeviceConfig({ ...deviceConfig, model: e.target.value })}
                placeholder="e.g., EPOC X, MindWave"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Channels</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={deviceConfig.channels}
                onChange={(e) => setDeviceConfig({ ...deviceConfig, channels: parseInt(e.target.value) })}
                min="1"
                max="256"
                aria-label="Number of channels"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Sampling Rate (Hz)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={deviceConfig.samplingRate}
                onChange={(e) => setDeviceConfig({ ...deviceConfig, samplingRate: parseInt(e.target.value) })}
                min="128"
                max="2048"
                step="128"
                aria-label="Sampling rate in Hz"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Ensure your neural interface device is properly connected and drivers are installed before proceeding.
            </p>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="ghost" onClick={() => setShowDeviceSetup(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnectDevice} disabled={isLoading}>
              Connect Device
            </Button>
          </div>
        </div>
      </Modal>

      {/* Calibration Modal */}
      <Modal
        isOpen={showCalibration}
        onClose={() => setShowCalibration(false)}
        title="Neural Interface Calibration"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-yellow-50">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Calibration Required</span>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              Neural interface calibration improves command recognition accuracy. This process takes about 5 minutes.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Calibration Steps:</h4>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">1</span>
                <span>Relax and focus on the screen</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">2</span>
                <span>Follow the on-screen instructions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">3</span>
                <span>Think about the requested actions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">4</span>
                <span>System will learn your neural patterns</span>
              </li>
            </ol>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="ghost" onClick={() => setShowCalibration(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => activeInterface && handleCalibrateInterface(activeInterface.id)}
              disabled={isLoading}
            >
              Start Calibration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NeuralInterface;