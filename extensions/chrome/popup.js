/**
 * Univo Chrome Extension - Popup Interface
 * Advanced AI, Quantum Security, Blockchain Identity Integration
 */

// DOM elements
const elements = {
    aiStatus: document.getElementById('ai-status'),
    quantumStatus: document.getElementById('quantum-status'),
    neuralStatus: document.getElementById('neural-status'),
    metaverseStatus: document.getElementById('metaverse-status'),
    startMeeting: document.getElementById('start-meeting'),
    joinMeeting: document.getElementById('join-meeting'),
    enhanceCurrent: document.getElementById('enhance-current'),
    toggleAI: document.getElementById('toggle-ai'),
    enterMetaverse: document.getElementById('enter-metaverse'),
    neuralConnect: document.getElementById('neural-connect'),
    blockchainVerify: document.getElementById('blockchain-verify'),
    loading: document.getElementById('loading')
};

// Extension state
let extensionState = {
    isActive: false,
    aiAssistantEnabled: false,
    quantumSecurityEnabled: false,
    neuralInterfaceConnected: false,
    metaverseModeActive: false,
    currentTab: null
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Univo popup initialized');
    
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        extensionState.currentTab = tab;
        
        // Load extension state
        await loadExtensionState();
        
        // Update UI
        updateStatusIndicators();
        
        // Set up event listeners
        setupEventListeners();
        
        // Check if current page is a meeting platform
        checkMeetingPlatform(tab);
        
    } catch (error) {
        console.error('❌ Popup initialization failed:', error);
        showError('Initialization failed');
    }
});

// Load extension state from background
async function loadExtensionState() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getExtensionState' });
        if (response) {
            extensionState = { ...extensionState, ...response };
        }
    } catch (error) {
        console.error('Failed to load extension state:', error);
    }
}

// Update status indicators
function updateStatusIndicators() {
    elements.aiStatus.className = `status-indicator ${extensionState.aiAssistantEnabled ? '' : 'inactive'}`;
    elements.quantumStatus.className = `status-indicator ${extensionState.quantumSecurityEnabled ? '' : 'inactive'}`;
    elements.neuralStatus.className = `status-indicator ${extensionState.neuralInterfaceConnected ? '' : 'inactive'}`;
    elements.metaverseStatus.className = `status-indicator ${extensionState.metaverseModeActive ? '' : 'inactive'}`;
}

// Set up event listeners
function setupEventListeners() {
    // Main action buttons
    elements.startMeeting.addEventListener('click', handleStartMeeting);
    elements.joinMeeting.addEventListener('click', handleJoinMeeting);
    elements.enhanceCurrent.addEventListener('click', handleEnhanceCurrent);
    
    // Quick action buttons
    elements.toggleAI.addEventListener('click', handleToggleAI);
    elements.enterMetaverse.addEventListener('click', handleEnterMetaverse);
    elements.neuralConnect.addEventListener('click', handleNeuralConnect);
    elements.blockchainVerify.addEventListener('click', handleBlockchainVerify);
}

// Check if current page is a meeting platform
function checkMeetingPlatform(tab) {
    const url = tab.url.toLowerCase();
    const isMeetingPlatform = 
        url.includes('univo.app') ||
        url.includes('zoom.us') ||
        url.includes('teams.microsoft.com') ||
        url.includes('meet.google.com') ||
        url.includes('webex.com') ||
        url.includes('gotomeeting.com');
    
    // Enable/disable enhance button based on platform
    elements.enhanceCurrent.disabled = !isMeetingPlatform;
    if (!isMeetingPlatform) {
        elements.enhanceCurrent.style.opacity = '0.5';
        elements.enhanceCurrent.title = 'No supported meeting platform detected';
    }
}

// Event handlers
async function handleStartMeeting() {
    showLoading('Starting quantum-secured meeting...');
    
    try {
        // Open Univo app in new tab
        await chrome.tabs.create({
            url: 'https://univo.app/meeting/new?quantum=true',
            active: true
        });
        
        // Track event
        await trackEvent('quantum_meeting_started_from_popup');
        
        // Close popup
        window.close();
        
    } catch (error) {
        console.error('Failed to start meeting:', error);
        showError('Failed to start meeting');
    } finally {
        hideLoading();
    }
}

async function handleJoinMeeting() {
    showLoading('Opening join meeting page...');
    
    try {
        // Open Univo join page
        await chrome.tabs.create({
            url: 'https://univo.app/meeting/join',
            active: true
        });
        
        // Track event
        await trackEvent('join_meeting_from_popup');
        
        // Close popup
        window.close();
        
    } catch (error) {
        console.error('Failed to open join page:', error);
        showError('Failed to open join page');
    } finally {
        hideLoading();
    }
}

async function handleEnhanceCurrent() {
    if (!extensionState.currentTab) return;
    
    showLoading('Enhancing current meeting...');
    
    try {
        // Send message to background to enhance meeting
        await chrome.runtime.sendMessage({
            action: 'enhanceCurrentMeeting',
            tabId: extensionState.currentTab.id
        });
        
        // Track event
        await trackEvent('meeting_enhanced_from_popup');
        
        showSuccess('Meeting enhanced successfully!');
        
    } catch (error) {
        console.error('Failed to enhance meeting:', error);
        showError('Failed to enhance meeting');
    } finally {
        hideLoading();
    }
}

async function handleToggleAI() {
    if (!extensionState.currentTab) return;
    
    showLoading('Toggling AI Assistant...');
    
    try {
        // Send message to background to toggle AI
        await chrome.runtime.sendMessage({
            action: 'toggleAIAssistant',
            tabId: extensionState.currentTab.id
        });
        
        // Update state
        extensionState.aiAssistantEnabled = !extensionState.aiAssistantEnabled;
        updateStatusIndicators();
        
        // Track event
        await trackEvent('ai_assistant_toggled_from_popup', {
            enabled: extensionState.aiAssistantEnabled
        });
        
        showSuccess(`AI Assistant ${extensionState.aiAssistantEnabled ? 'activated' : 'deactivated'}`);
        
    } catch (error) {
        console.error('Failed to toggle AI:', error);
        showError('Failed to toggle AI Assistant');
    } finally {
        hideLoading();
    }
}

async function handleEnterMetaverse() {
    if (!extensionState.currentTab) return;
    
    showLoading('Entering metaverse mode...');
    
    try {
        // Send message to background to enter metaverse
        await chrome.runtime.sendMessage({
            action: 'enterMetaverse',
            tabId: extensionState.currentTab.id
        });
        
        // Update state
        extensionState.metaverseModeActive = true;
        updateStatusIndicators();
        
        // Track event
        await trackEvent('metaverse_entered_from_popup');
        
        showSuccess('Welcome to the metaverse!');
        
    } catch (error) {
        console.error('Failed to enter metaverse:', error);
        showError('Failed to enter metaverse');
    } finally {
        hideLoading();
    }
}

async function handleNeuralConnect() {
    if (!extensionState.currentTab) return;
    
    showLoading('Connecting neural interface...');
    
    try {
        // Send message to background to connect neural interface
        await chrome.runtime.sendMessage({
            action: 'connectNeuralInterface',
            tabId: extensionState.currentTab.id
        });
        
        // Update state
        extensionState.neuralInterfaceConnected = true;
        updateStatusIndicators();
        
        // Track event
        await trackEvent('neural_interface_connected_from_popup');
        
        showSuccess('Neural interface connected!');
        
    } catch (error) {
        console.error('Failed to connect neural interface:', error);
        showError('Failed to connect neural interface');
    } finally {
        hideLoading();
    }
}

async function handleBlockchainVerify() {
    if (!extensionState.currentTab) return;
    
    showLoading('Verifying blockchain identity...');
    
    try {
        // Send message to background to verify blockchain identity
        await chrome.runtime.sendMessage({
            action: 'verifyBlockchainIdentity',
            tabId: extensionState.currentTab.id
        });
        
        // Track event
        await trackEvent('blockchain_identity_verified_from_popup');
        
        showSuccess('Blockchain identity verified!');
        
    } catch (error) {
        console.error('Failed to verify blockchain identity:', error);
        showError('Failed to verify blockchain identity');
    } finally {
        hideLoading();
    }
}

// Utility functions
function showLoading(message = 'Processing...') {
    elements.loading.querySelector('div:last-child').textContent = message;
    elements.loading.style.display = 'block';
    
    // Disable all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

function hideLoading() {
    elements.loading.style.display = 'none';
    
    // Re-enable all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
    
    // Re-check meeting platform for enhance button
    if (extensionState.currentTab) {
        checkMeetingPlatform(extensionState.currentTab);
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        padding: 10px;
        border-radius: 5px;
        color: white;
        font-size: 12px;
        z-index: 1000;
        text-align: center;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function trackEvent(event, data = {}) {
    try {
        await chrome.runtime.sendMessage({
            action: 'trackEvent',
            event: event,
            data: {
                ...data,
                source: 'popup',
                timestamp: Date.now()
            }
        });
    } catch (error) {
        console.error('Failed to track event:', error);
    }
}

// Handle messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Popup received message:', request);
    
    switch (request.action) {
        case 'updateState':
            extensionState = { ...extensionState, ...request.data };
            updateStatusIndicators();
            break;
            
        case 'showNotification':
            showNotification(request.message, request.type);
            break;
    }
    
    sendResponse({ success: true });
    return true;
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + Enter: Start meeting
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleStartMeeting();
    }
    
    // Ctrl/Cmd + J: Join meeting
    if ((event.ctrlKey || event.metaKey) && event.key === 'j') {
        event.preventDefault();
        handleJoinMeeting();
    }
    
    // Ctrl/Cmd + E: Enhance current
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        handleEnhanceCurrent();
    }
    
    // Escape: Close popup
    if (event.key === 'Escape') {
        window.close();
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extensionState,
        loadExtensionState,
        updateStatusIndicators,
        trackEvent
    };
}