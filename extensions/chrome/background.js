/**
 * Univo Chrome Extension - Background Service Worker
 * Advanced AI, Quantum Security, Blockchain Identity, Neural Interface Integration
 */

// Import modules
import { AIService } from './modules/ai-service.js';
import { QuantumService } from './modules/quantum-service.js';
import { BlockchainService } from './modules/blockchain-service.js';
import { NeuralInterfaceService } from './modules/neural-interface-service.js';
import { MetaverseService } from './modules/metaverse-service.js';
import { BiometricService } from './modules/biometric-service.js';
import { AnalyticsService } from './modules/analytics-service.js';

// Global state
let extensionState = {
  isActive: false,
  currentMeeting: null,
  aiAssistantEnabled: false,
  quantumSecurityEnabled: false,
  blockchainIdentityVerified: false,
  neuralInterfaceConnected: false,
  metaverseModeActive: false,
  connectedTabs: new Map(),
  userPreferences: {},
  securityLevel: 'standard'
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('🚀 Univo Extension installed/updated');
  
  try {
    // Initialize services
    await initializeServices();
    
    // Set up context menus
    setupContextMenus();
    
    // Initialize user preferences
    await loadUserPreferences();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize analytics
    AnalyticsService.track('extension_installed', {
      version: chrome.runtime.getManifest().version,
      reason: details.reason
    });
    
    // Show welcome notification
    if (details.reason === 'install') {
      showWelcomeNotification();
    }
    
  } catch (error) {
    console.error('❌ Extension initialization failed:', error);
  }
});

// Initialize all advanced services
async function initializeServices() {
  try {
    console.log('🔧 Initializing advanced services...');
    
    // Initialize AI Service
    await AIService.initialize({
      apiEndpoint: 'https://api.univo.app',
      features: ['transcription', 'translation', 'emotion-recognition', 'gesture-recognition']
    });
    
    // Initialize Quantum Service
    await QuantumService.initialize({
      quantumBackend: 'qiskit-simulator',
      encryptionLevel: 'post-quantum'
    });
    
    // Initialize Blockchain Service
    await BlockchainService.initialize({
      network: 'ethereum-mainnet',
      identityContract: '0x...' // Contract address
    });
    
    // Initialize Neural Interface Service
    await NeuralInterfaceService.initialize({
      deviceTypes: ['eeg', 'bci', 'eye-tracking'],
      calibrationRequired: true
    });
    
    // Initialize Metaverse Service
    await MetaverseService.initialize({
      worldEngine: 'three.js',
      physicsEngine: 'cannon.js',
      avatarSystem: 'holographic'
    });
    
    // Initialize Biometric Service
    await BiometricService.initialize({
      supportedMethods: ['fingerprint', 'face-recognition', 'voice-recognition']
    });
    
    console.log('✅ All services initialized successfully');
    
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    throw error;
  }
}

// Set up context menus
function setupContextMenus() {
  // Remove existing menus
  chrome.contextMenus.removeAll();
  
  // Main Univo menu
  chrome.contextMenus.create({
    id: 'univo-main',
    title: 'Univo - Next-Gen Meetings',
    contexts: ['page', 'selection']
  });
  
  // Quick actions
  chrome.contextMenus.create({
    id: 'start-quantum-meeting',
    parentId: 'univo-main',
    title: '🔐 Start Quantum-Secured Meeting',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'enter-metaverse',
    parentId: 'univo-main',
    title: '🌐 Enter Metaverse Mode',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'activate-ai-assistant',
    parentId: 'univo-main',
    title: '🤖 Activate AI Assistant',
    contexts: ['page', 'selection']
  });
  
  chrome.contextMenus.create({
    id: 'neural-interface-connect',
    parentId: 'univo-main',
    title: '🧠 Connect Neural Interface',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'blockchain-verify',
    parentId: 'univo-main',
    title: '⛓️ Verify Blockchain Identity',
    contexts: ['page']
  });
  
  // Separator
  chrome.contextMenus.create({
    id: 'separator1',
    parentId: 'univo-main',
    type: 'separator',
    contexts: ['page']
  });
  
  // Meeting enhancement options
  chrome.contextMenus.create({
    id: 'enhance-current-meeting',
    parentId: 'univo-main',
    title: '✨ Enhance Current Meeting',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'translate-selection',
    parentId: 'univo-main',
    title: '🌍 Translate Selection',
    contexts: ['selection']
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    switch (info.menuItemId) {
      case 'start-quantum-meeting':
        await startQuantumMeeting(tab);
        break;
        
      case 'enter-metaverse':
        await enterMetaverseMode(tab);
        break;
        
      case 'activate-ai-assistant':
        await activateAIAssistant(tab, info.selectionText);
        break;
        
      case 'neural-interface-connect':
        await connectNeuralInterface(tab);
        break;
        
      case 'blockchain-verify':
        await verifyBlockchainIdentity(tab);
        break;
        
      case 'enhance-current-meeting':
        await enhanceCurrentMeeting(tab);
        break;
        
      case 'translate-selection':
        await translateSelection(tab, info.selectionText);
        break;
    }
  } catch (error) {
    console.error('Context menu action failed:', error);
    showErrorNotification('Action failed', error.message);
  }
});

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
  chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      switch (command) {
        case 'toggle-ai-assistant':
          await toggleAIAssistant(tab);
          break;
          
        case 'start-quantum-meeting':
          await startQuantumMeeting(tab);
          break;
          
        case 'enter-metaverse':
          await enterMetaverseMode(tab);
          break;
          
        case 'neural-interface-toggle':
          await toggleNeuralInterface(tab);
          break;
      }
    } catch (error) {
      console.error('Keyboard shortcut failed:', error);
    }
  });
}

// Advanced meeting functions
async function startQuantumMeeting(tab) {
  try {
    console.log('🔐 Starting quantum-secured meeting...');
    
    // Generate quantum keys
    const quantumKeys = await QuantumService.generateQuantumKeys();
    
    // Create secure meeting room
    const meetingData = {
      type: 'quantum',
      security: 'post-quantum',
      encryption: quantumKeys,
      timestamp: Date.now()
    };
    
    // Inject quantum meeting interface
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectQuantumMeetingInterface,
      args: [meetingData]
    });
    
    // Update extension state
    extensionState.quantumSecurityEnabled = true;
    extensionState.securityLevel = 'quantum';
    
    // Show success notification
    showSuccessNotification('Quantum Meeting Started', 'Your meeting is now quantum-secured');
    
    // Track event
    AnalyticsService.track('quantum_meeting_started', {
      tabId: tab.id,
      url: tab.url,
      securityLevel: 'post-quantum'
    });
    
  } catch (error) {
    console.error('Failed to start quantum meeting:', error);
    throw error;
  }
}

async function enterMetaverseMode(tab) {
  try {
    console.log('🌐 Entering metaverse mode...');
    
    // Initialize 3D environment
    const metaverseConfig = await MetaverseService.createVirtualWorld({
      worldType: 'meeting-space',
      physics: true,
      avatars: 'holographic',
      maxParticipants: 100
    });
    
    // Inject metaverse interface
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectMetaverseInterface,
      args: [metaverseConfig]
    });
    
    // Update state
    extensionState.metaverseModeActive = true;
    
    // Show notification
    showSuccessNotification('Metaverse Activated', 'Welcome to the virtual meeting space');
    
    // Track event
    AnalyticsService.track('metaverse_entered', {
      tabId: tab.id,
      worldType: metaverseConfig.worldType
    });
    
  } catch (error) {
    console.error('Failed to enter metaverse:', error);
    throw error;
  }
}

async function activateAIAssistant(tab, selectedText = null) {
  try {
    console.log('🤖 Activating AI Assistant...');
    
    // Initialize AI context
    const aiContext = {
      tabUrl: tab.url,
      selectedText: selectedText,
      meetingContext: extensionState.currentMeeting,
      timestamp: Date.now()
    };
    
    // Start AI services
    await AIService.startMeetingAssistant(aiContext);
    
    // Inject AI interface
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectAIAssistantInterface,
      args: [aiContext]
    });
    
    // Update state
    extensionState.aiAssistantEnabled = true;
    
    // Show notification
    showSuccessNotification('AI Assistant Activated', 'Your intelligent meeting companion is ready');
    
    // Track event
    AnalyticsService.track('ai_assistant_activated', {
      tabId: tab.id,
      hasSelectedText: !!selectedText
    });
    
  } catch (error) {
    console.error('Failed to activate AI assistant:', error);
    throw error;
  }
}

async function connectNeuralInterface(tab) {
  try {
    console.log('🧠 Connecting neural interface...');
    
    // Scan for neural devices
    const availableDevices = await NeuralInterfaceService.scanDevices();
    
    if (availableDevices.length === 0) {
      throw new Error('No neural interface devices found');
    }
    
    // Connect to the first available device
    const device = availableDevices[0];
    await NeuralInterfaceService.connectDevice(device.id);
    
    // Start calibration
    const calibrationData = await NeuralInterfaceService.startCalibration();
    
    // Inject neural interface
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectNeuralInterface,
      args: [{ device, calibrationData }]
    });
    
    // Update state
    extensionState.neuralInterfaceConnected = true;
    
    // Show notification
    showSuccessNotification('Neural Interface Connected', `Connected to ${device.name}`);
    
    // Track event
    AnalyticsService.track('neural_interface_connected', {
      tabId: tab.id,
      deviceType: device.type,
      deviceName: device.name
    });
    
  } catch (error) {
    console.error('Failed to connect neural interface:', error);
    throw error;
  }
}

async function verifyBlockchainIdentity(tab) {
  try {
    console.log('⛓️ Verifying blockchain identity...');
    
    // Get user's blockchain identity
    const identity = await BlockchainService.getCurrentIdentity();
    
    if (!identity) {
      throw new Error('No blockchain identity found. Please create one first.');
    }
    
    // Verify identity on blockchain
    const verification = await BlockchainService.verifyIdentity(identity.did);
    
    // Inject blockchain interface
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectBlockchainInterface,
      args: [{ identity, verification }]
    });
    
    // Update state
    extensionState.blockchainIdentityVerified = verification.verified;
    
    // Show notification
    const message = verification.verified ? 
      'Blockchain identity verified successfully' : 
      'Identity verification failed';
    
    if (verification.verified) {
      showSuccessNotification('Identity Verified', message);
    } else {
      showErrorNotification('Verification Failed', message);
    }
    
    // Track event
    AnalyticsService.track('blockchain_identity_verified', {
      tabId: tab.id,
      verified: verification.verified,
      did: identity.did
    });
    
  } catch (error) {
    console.error('Failed to verify blockchain identity:', error);
    throw error;
  }
}

async function enhanceCurrentMeeting(tab) {
  try {
    console.log('✨ Enhancing current meeting...');
    
    // Detect current meeting platform
    const platform = await detectMeetingPlatform(tab);
    
    if (!platform) {
      throw new Error('No supported meeting platform detected');
    }
    
    // Apply enhancements based on platform
    const enhancements = {
      aiTranscription: true,
      emotionRecognition: true,
      gestureRecognition: true,
      backgroundEnhancement: true,
      noiseReduction: true,
      quantumSecurity: extensionState.quantumSecurityEnabled
    };
    
    // Inject enhancement overlay
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectMeetingEnhancements,
      args: [{ platform, enhancements }]
    });
    
    // Show notification
    showSuccessNotification('Meeting Enhanced', `Applied ${Object.keys(enhancements).length} enhancements`);
    
    // Track event
    AnalyticsService.track('meeting_enhanced', {
      tabId: tab.id,
      platform: platform.name,
      enhancements: Object.keys(enhancements)
    });
    
  } catch (error) {
    console.error('Failed to enhance meeting:', error);
    throw error;
  }
}

async function translateSelection(tab, selectedText) {
  try {
    console.log('🌍 Translating selected text...');
    
    if (!selectedText) {
      throw new Error('No text selected');
    }
    
    // Detect source language
    const sourceLanguage = await AIService.detectLanguage(selectedText);
    
    // Get user's preferred target language
    const targetLanguage = extensionState.userPreferences.defaultLanguage || 'en';
    
    // Translate text
    const translation = await AIService.translateText({
      text: selectedText,
      from: sourceLanguage,
      to: targetLanguage
    });
    
    // Show translation in popup
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showTranslationPopup,
      args: [{ original: selectedText, translated: translation.text, sourceLanguage, targetLanguage }]
    });
    
    // Track event
    AnalyticsService.track('text_translated', {
      tabId: tab.id,
      sourceLanguage,
      targetLanguage,
      textLength: selectedText.length
    });
    
  } catch (error) {
    console.error('Failed to translate text:', error);
    throw error;
  }
}

// Utility functions
async function detectMeetingPlatform(tab) {
  const url = tab.url.toLowerCase();
  
  if (url.includes('univo.app')) {
    return { name: 'Univo', native: true };
  } else if (url.includes('zoom.us')) {
    return { name: 'Zoom', native: false };
  } else if (url.includes('teams.microsoft.com')) {
    return { name: 'Microsoft Teams', native: false };
  } else if (url.includes('meet.google.com')) {
    return { name: 'Google Meet', native: false };
  } else if (url.includes('webex.com')) {
    return { name: 'Cisco Webex', native: false };
  }
  
  return null;
}

async function loadUserPreferences() {
  try {
    const result = await chrome.storage.sync.get('userPreferences');
    extensionState.userPreferences = result.userPreferences || {
      defaultLanguage: 'en',
      aiAssistantEnabled: true,
      quantumSecurityEnabled: false,
      neuralInterfaceEnabled: false,
      metaverseEnabled: true,
      biometricAuthEnabled: true
    };
  } catch (error) {
    console.error('Failed to load user preferences:', error);
  }
}

// Notification functions
function showWelcomeNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Welcome to Univo Extension!',
    message: 'Experience next-generation video conferencing with AI, quantum security, and metaverse features.'
  });
}

function showSuccessNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
}

function showErrorNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
}

// Injected functions (these run in the page context)
function injectQuantumMeetingInterface(meetingData) {
  // This function runs in the page context
  console.log('Injecting quantum meeting interface...', meetingData);
  
  // Create quantum security overlay
  const overlay = document.createElement('div');
  overlay.id = 'univo-quantum-overlay';
  overlay.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; z-index: 10000; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; padding: 15px; border-radius: 10px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
      <div style="font-weight: bold; margin-bottom: 5px;">🔐 Quantum Secured</div>
      <div style="font-size: 12px;">Post-quantum encryption active</div>
      <div style="font-size: 10px; opacity: 0.8; margin-top: 5px;">
        Key ID: ${meetingData.encryption.keyId || 'QK-' + Date.now().toString(36)}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }, 5000);
}

function injectMetaverseInterface(config) {
  console.log('Injecting metaverse interface...', config);
  
  // Create metaverse portal
  const portal = document.createElement('div');
  portal.id = 'univo-metaverse-portal';
  portal.innerHTML = `
    <div style="position: fixed; bottom: 20px; left: 20px; z-index: 10000;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
      <div style="font-weight: bold; margin-bottom: 10px;">🌐 Metaverse Active</div>
      <div style="font-size: 12px; margin-bottom: 5px;">World: ${config.worldType}</div>
      <div style="font-size: 12px; margin-bottom: 10px;">Physics: ${config.physics ? 'Enabled' : 'Disabled'}</div>
      <button onclick="this.parentElement.remove()" 
              style="background: rgba(255,255,255,0.2); border: none; color: white; 
                     padding: 5px 10px; border-radius: 5px; cursor: pointer;">
        Exit Metaverse
      </button>
    </div>
  `;
  document.body.appendChild(portal);
}

function injectAIAssistantInterface(context) {
  console.log('Injecting AI assistant interface...', context);
  
  // Create AI assistant panel
  const panel = document.createElement('div');
  panel.id = 'univo-ai-assistant';
  panel.innerHTML = `
    <div style="position: fixed; top: 50%; right: 20px; transform: translateY(-50%); 
                z-index: 10000; background: rgba(0,0,0,0.9); color: white; 
                padding: 20px; border-radius: 15px; width: 300px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
      <div style="font-weight: bold; margin-bottom: 15px;">🤖 AI Assistant</div>
      <div style="font-size: 12px; margin-bottom: 10px;">Status: Active</div>
      ${context.selectedText ? `
        <div style="font-size: 11px; margin-bottom: 10px; padding: 8px; 
                    background: rgba(255,255,255,0.1); border-radius: 5px;">
          Selected: "${context.selectedText.substring(0, 50)}..."
        </div>
      ` : ''}
      <div style="display: flex; gap: 5px; flex-wrap: wrap;">
        <button style="background: #4CAF50; border: none; color: white; 
                       padding: 5px 8px; border-radius: 3px; font-size: 10px; cursor: pointer;">
          Transcribe
        </button>
        <button style="background: #2196F3; border: none; color: white; 
                       padding: 5px 8px; border-radius: 3px; font-size: 10px; cursor: pointer;">
          Translate
        </button>
        <button style="background: #FF9800; border: none; color: white; 
                       padding: 5px 8px; border-radius: 3px; font-size: 10px; cursor: pointer;">
          Summarize
        </button>
      </div>
      <button onclick="this.parentElement.remove()" 
              style="position: absolute; top: 5px; right: 8px; background: none; 
                     border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
    </div>
  `;
  document.body.appendChild(panel);
}

function injectNeuralInterface(data) {
  console.log('Injecting neural interface...', data);
  
  // Create neural interface indicator
  const indicator = document.createElement('div');
  indicator.id = 'univo-neural-interface';
  indicator.innerHTML = `
    <div style="position: fixed; top: 20px; left: 20px; z-index: 10000;
                background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
                color: white; padding: 15px; border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,255,136,0.3);">
      <div style="font-weight: bold; margin-bottom: 5px;">🧠 Neural Interface</div>
      <div style="font-size: 12px;">Device: ${data.device.name}</div>
      <div style="font-size: 10px; opacity: 0.8; margin-top: 5px;">
        Status: ${data.calibrationData ? 'Calibrated' : 'Calibrating...'}
      </div>
    </div>
  `;
  document.body.appendChild(indicator);
}

function injectBlockchainInterface(data) {
  console.log('Injecting blockchain interface...', data);
  
  // Create blockchain identity badge
  const badge = document.createElement('div');
  badge.id = 'univo-blockchain-badge';
  badge.innerHTML = `
    <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
                z-index: 10000; background: ${data.verification.verified ? '#4CAF50' : '#F44336'};
                color: white; padding: 12px 20px; border-radius: 25px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
      <div style="font-weight: bold; text-align: center;">
        ⛓️ ${data.verification.verified ? 'Identity Verified' : 'Verification Failed'}
      </div>
      <div style="font-size: 10px; text-align: center; margin-top: 3px; opacity: 0.9;">
        DID: ${data.identity.did.substring(0, 20)}...
      </div>
    </div>
  `;
  document.body.appendChild(badge);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    badge.style.opacity = '0';
    setTimeout(() => badge.remove(), 300);
  }, 3000);
}

function injectMeetingEnhancements(data) {
  console.log('Injecting meeting enhancements...', data);
  
  // Create enhancement control panel
  const panel = document.createElement('div');
  panel.id = 'univo-enhancements';
  panel.innerHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; z-index: 10000;
                background: rgba(0,0,0,0.9); color: white; padding: 20px; 
                border-radius: 15px; min-width: 250px;">
      <div style="font-weight: bold; margin-bottom: 15px;">✨ Univo Enhancements</div>
      <div style="font-size: 12px; margin-bottom: 10px;">Platform: ${data.platform.name}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
        ${Object.entries(data.enhancements).map(([key, enabled]) => `
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="color: ${enabled ? '#4CAF50' : '#666'};">
              ${enabled ? '✓' : '○'}
            </span>
            <span>${key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
          </div>
        `).join('')}
      </div>
      <button onclick="this.parentElement.remove()" 
              style="position: absolute; top: 5px; right: 8px; background: none; 
                     border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
    </div>
  `;
  document.body.appendChild(panel);
}

function showTranslationPopup(data) {
  console.log('Showing translation popup...', data);
  
  // Create translation popup
  const popup = document.createElement('div');
  popup.id = 'univo-translation-popup';
  popup.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                z-index: 10000; background: white; color: black; padding: 25px; 
                border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                max-width: 400px; border: 2px solid #4CAF50;">
      <div style="font-weight: bold; margin-bottom: 15px; color: #4CAF50;">
        🌍 Translation
      </div>
      <div style="margin-bottom: 15px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
          Original (${data.sourceLanguage}):
        </div>
        <div style="padding: 10px; background: #f5f5f5; border-radius: 5px; font-size: 14px;">
          ${data.original}
        </div>
      </div>
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
          Translation (${data.targetLanguage}):
        </div>
        <div style="padding: 10px; background: #e8f5e8; border-radius: 5px; font-size: 14px;">
          ${data.translated}
        </div>
      </div>
      <button onclick="this.parentElement.remove()" 
              style="background: #4CAF50; border: none; color: white; 
                     padding: 8px 16px; border-radius: 5px; cursor: pointer; width: 100%;">
        Close
      </button>
    </div>
  `;
  document.body.appendChild(popup);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (popup.parentElement) {
      popup.style.opacity = '0';
      setTimeout(() => popup.remove(), 300);
    }
  }, 10000);
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'getExtensionState':
      sendResponse(extensionState);
      break;
      
    case 'updateExtensionState':
      extensionState = { ...extensionState, ...request.data };
      sendResponse({ success: true });
      break;
      
    case 'trackEvent':
      AnalyticsService.track(request.event, request.data);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async responses
});

// Handle tab updates to detect meeting platforms
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const platform = await detectMeetingPlatform(tab);
    
    if (platform) {
      // Store tab as connected meeting
      extensionState.connectedTabs.set(tabId, {
        platform: platform.name,
        url: tab.url,
        connectedAt: Date.now()
      });
      
      // Show platform-specific enhancements
      if (!platform.native) {
        chrome.action.setBadgeText({
          tabId: tabId,
          text: '✨'
        });
        chrome.action.setBadgeBackgroundColor({
          tabId: tabId,
          color: '#4CAF50'
        });
      }
    }
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  extensionState.connectedTabs.delete(tabId);
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extensionState,
    initializeServices,
    detectMeetingPlatform
  };
}