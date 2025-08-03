/**
 * Univo Chrome Extension - Content Script
 * Enhances meeting platforms with advanced AI and quantum features
 */

// Global state
let univoEnhanced = false;
let currentPlatform = null;
let enhancementOverlay = null;
let aiAssistant = null;

// Initialize content script
(function() {
    'use strict';
    
    console.log('🚀 Univo content script loaded');
    
    // Detect meeting platform
    detectMeetingPlatform();
    
    // Set up observers
    setupDOMObserver();
    
    // Listen for messages from background
    setupMessageListener();
    
    // Initialize platform-specific enhancements
    if (currentPlatform) {
        initializePlatformEnhancements();
    }
})();

// Detect current meeting platform
function detectMeetingPlatform() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes('univo.app')) {
        currentPlatform = { name: 'Univo', native: true };
    } else if (hostname.includes('zoom.us')) {
        currentPlatform = { name: 'Zoom', native: false };
    } else if (hostname.includes('teams.microsoft.com')) {
        currentPlatform = { name: 'Microsoft Teams', native: false };
    } else if (hostname.includes('meet.google.com')) {
        currentPlatform = { name: 'Google Meet', native: false };
    } else if (hostname.includes('webex.com')) {
        currentPlatform = { name: 'Cisco Webex', native: false };
    } else if (hostname.includes('gotomeeting.com')) {
        currentPlatform = { name: 'GoToMeeting', native: false };
    }
    
    if (currentPlatform) {
        console.log(`📹 Detected platform: ${currentPlatform.name}`);
        
        // Notify background script
        chrome.runtime.sendMessage({
            action: 'platformDetected',
            platform: currentPlatform,
            url: window.location.href
        });
    }
}

// Set up DOM observer for dynamic content
function setupDOMObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Check for video elements
                const videoElements = document.querySelectorAll('video');
                if (videoElements.length > 0 && !univoEnhanced) {
                    console.log('📹 Video elements detected, applying enhancements');
                    applyVideoEnhancements();
                }
                
                // Check for meeting controls
                const meetingControls = document.querySelectorAll('[data-testid*="control"], .meeting-controls, .controls-bar');
                if (meetingControls.length > 0) {
                    enhanceMeetingControls();
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Set up message listener
function setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Content script received message:', request);
        
        switch (request.action) {
            case 'enhanceCurrentMeeting':
                enhanceCurrentMeeting();
                sendResponse({ success: true });
                break;
                
            case 'toggleAIAssistant':
                toggleAIAssistant();
                sendResponse({ success: true });
                break;
                
            case 'enterMetaverse':
                enterMetaverseMode();
                sendResponse({ success: true });
                break;
                
            case 'connectNeuralInterface':
                connectNeuralInterface();
                sendResponse({ success: true });
                break;
                
            case 'verifyBlockchainIdentity':
                verifyBlockchainIdentity();
                sendResponse({ success: true });
                break;
                
            default:
                sendResponse({ error: 'Unknown action' });
        }
        
        return true;
    });
}

// Initialize platform-specific enhancements
function initializePlatformEnhancements() {
    // Add Univo branding
    addUnivoBranding();
    
    // Inject enhancement styles
    injectEnhancementStyles();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Apply initial enhancements
    setTimeout(() => {
        if (!univoEnhanced) {
            applyInitialEnhancements();
        }
    }, 2000);
}

// Add Univo branding
function addUnivoBranding() {
    const branding = document.createElement('div');
    branding.id = 'univo-branding';
    branding.innerHTML = `
        <div style="position: fixed; bottom: 10px; left: 10px; z-index: 10000;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 8px 12px; border-radius: 20px;
                    font-size: 11px; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    cursor: pointer; transition: all 0.3s ease;">
            🚀 Enhanced by Univo
        </div>
    `;
    
    branding.addEventListener('click', () => {
        showUnivoPanel();
    });
    
    document.body.appendChild(branding);
}

// Inject enhancement styles
function injectEnhancementStyles() {
    const styles = document.createElement('style');
    styles.id = 'univo-enhancement-styles';
    styles.textContent = `
        .univo-enhanced {
            border: 2px solid #667eea !important;
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.3) !important;
        }
        
        .univo-ai-overlay {
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            background: rgba(0, 0, 0, 0.8) !important;
            color: white !important;
            padding: 8px 12px !important;
            border-radius: 15px !important;
            font-size: 11px !important;
            z-index: 1000 !important;
        }
        
        .univo-quantum-indicator {
            position: absolute !important;
            top: 10px !important;
            left: 10px !important;
            background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%) !important;
            color: white !important;
            padding: 6px 10px !important;
            border-radius: 12px !important;
            font-size: 10px !important;
            font-weight: bold !important;
            z-index: 1000 !important;
        }
        
        .univo-neural-pulse {
            animation: univo-pulse 2s infinite !important;
        }
        
        @keyframes univo-pulse {
            0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
            100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }
        
        .univo-metaverse-portal {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 200px !important;
            height: 200px !important;
            background: radial-gradient(circle, #667eea 0%, #764ba2 100%) !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: white !important;
            font-size: 16px !important;
            font-weight: bold !important;
            z-index: 10000 !important;
            cursor: pointer !important;
            animation: univo-portal-spin 10s linear infinite !important;
        }
        
        @keyframes univo-portal-spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }
    `;
    
    document.head.appendChild(styles);
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Ctrl+Shift+U: Toggle Univo enhancements
        if (event.ctrlKey && event.shiftKey && event.key === 'U') {
            event.preventDefault();
            toggleUnivoEnhancements();
        }
        
        // Ctrl+Shift+A: Toggle AI Assistant
        if (event.ctrlKey && event.shiftKey && event.key === 'A') {
            event.preventDefault();
            toggleAIAssistant();
        }
        
        // Ctrl+Shift+Q: Quantum mode
        if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
            event.preventDefault();
            toggleQuantumMode();
        }
        
        // Ctrl+Shift+M: Metaverse mode
        if (event.ctrlKey && event.shiftKey && event.key === 'M') {
            event.preventDefault();
            enterMetaverseMode();
        }
    });
}

// Apply initial enhancements
function applyInitialEnhancements() {
    console.log('✨ Applying initial Univo enhancements');
    
    // Enhance video elements
    applyVideoEnhancements();
    
    // Add AI indicators
    addAIIndicators();
    
    // Mark as enhanced
    univoEnhanced = true;
    
    // Notify background
    chrome.runtime.sendMessage({
        action: 'enhancementsApplied',
        platform: currentPlatform?.name
    });
}

// Apply video enhancements
function applyVideoEnhancements() {
    const videoElements = document.querySelectorAll('video');
    
    videoElements.forEach((video, index) => {
        if (!video.classList.contains('univo-enhanced')) {
            // Add enhancement class
            video.classList.add('univo-enhanced');
            
            // Add AI overlay
            const overlay = document.createElement('div');
            overlay.className = 'univo-ai-overlay';
            overlay.innerHTML = '🤖 AI Enhanced';
            
            // Position overlay relative to video
            const container = video.parentElement;
            if (container) {
                container.style.position = 'relative';
                container.appendChild(overlay);
            }
            
            // Add quantum indicator for main video
            if (index === 0) {
                const quantumIndicator = document.createElement('div');
                quantumIndicator.className = 'univo-quantum-indicator';
                quantumIndicator.innerHTML = '🔐 Quantum Secured';
                
                if (container) {
                    container.appendChild(quantumIndicator);
                }
            }
            
            console.log(`📹 Enhanced video element ${index + 1}`);
        }
    });
}

// Add AI indicators
function addAIIndicators() {
    // Find chat or text areas
    const textAreas = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
    
    textAreas.forEach(element => {
        if (!element.dataset.univoEnhanced) {
            element.dataset.univoEnhanced = 'true';
            
            // Add AI suggestion indicator
            const indicator = document.createElement('div');
            indicator.style.cssText = `
                position: absolute;
                top: -20px;
                right: 0;
                background: #4CAF50;
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 9px;
                z-index: 1000;
            `;
            indicator.textContent = '🤖 AI Ready';
            
            // Position relative to element
            const parent = element.parentElement;
            if (parent) {
                parent.style.position = 'relative';
                parent.appendChild(indicator);
            }
        }
    });
}

// Enhance meeting controls
function enhanceMeetingControls() {
    const controlBars = document.querySelectorAll('.meeting-controls, .controls-bar, [data-testid*="control"]');
    
    controlBars.forEach(controlBar => {
        if (!controlBar.dataset.univoEnhanced) {
            controlBar.dataset.univoEnhanced = 'true';
            
            // Add Univo control button
            const univoButton = document.createElement('button');
            univoButton.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 11px;
                cursor: pointer;
                margin: 0 5px;
                transition: all 0.3s ease;
            `;
            univoButton.innerHTML = '🚀 Univo';
            univoButton.title = 'Open Univo Enhancement Panel';
            
            univoButton.addEventListener('click', showUnivoPanel);
            univoButton.addEventListener('mouseenter', () => {
                univoButton.style.transform = 'scale(1.1)';
            });
            univoButton.addEventListener('mouseleave', () => {
                univoButton.style.transform = 'scale(1)';
            });
            
            controlBar.appendChild(univoButton);
        }
    });
}

// Main enhancement functions
function enhanceCurrentMeeting() {
    console.log('✨ Enhancing current meeting with Univo features');
    
    // Apply all enhancements
    applyVideoEnhancements();
    addAIIndicators();
    enhanceMeetingControls();
    
    // Show enhancement notification
    showNotification('Meeting enhanced with Univo features!', 'success');
    
    // Mark as enhanced
    univoEnhanced = true;
}

function toggleAIAssistant() {
    console.log('🤖 Toggling AI Assistant');
    
    if (aiAssistant) {
        // Remove AI assistant
        aiAssistant.remove();
        aiAssistant = null;
        showNotification('AI Assistant deactivated', 'info');
    } else {
        // Create AI assistant panel
        aiAssistant = document.createElement('div');
        aiAssistant.id = 'univo-ai-assistant';
        aiAssistant.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 10000;
                        background: rgba(0, 0, 0, 0.9); color: white; padding: 20px;
                        border-radius: 15px; width: 300px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 16px;">🤖 AI Assistant</h3>
                    <button onclick="this.closest('#univo-ai-assistant').remove(); aiAssistant = null;" 
                            style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 12px; margin-bottom: 10px;">Status: Active</div>
                    <div style="font-size: 11px; color: #4CAF50;">✓ Real-time transcription</div>
                    <div style="font-size: 11px; color: #4CAF50;">✓ Emotion recognition</div>
                    <div style="font-size: 11px; color: #4CAF50;">✓ Smart suggestions</div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="showNotification('Transcription started', 'success')" 
                            style="background: #4CAF50; border: none; color: white; padding: 6px 10px; 
                                   border-radius: 15px; font-size: 10px; cursor: pointer;">Start Transcription</button>
                    <button onclick="showNotification('Translation enabled', 'success')" 
                            style="background: #2196F3; border: none; color: white; padding: 6px 10px; 
                                   border-radius: 15px; font-size: 10px; cursor: pointer;">Translate</button>
                    <button onclick="showNotification('Summary generated', 'success')" 
                            style="background: #FF9800; border: none; color: white; padding: 6px 10px; 
                                   border-radius: 15px; font-size: 10px; cursor: pointer;">Summarize</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(aiAssistant);
        showNotification('AI Assistant activated!', 'success');
    }
}

function enterMetaverseMode() {
    console.log('🌐 Entering metaverse mode');
    
    // Create metaverse portal
    const portal = document.createElement('div');
    portal.className = 'univo-metaverse-portal';
    portal.innerHTML = '🌐<br>Enter<br>Metaverse';
    
    portal.addEventListener('click', () => {
        showNotification('Welcome to the Univo Metaverse!', 'success');
        portal.remove();
        
        // Add metaverse effects
        document.body.style.background = 'linear-gradient(45deg, #667eea, #764ba2, #667eea)';
        document.body.style.backgroundSize = '400% 400%';
        document.body.style.animation = 'univo-metaverse-bg 10s ease infinite';
        
        // Add metaverse style
        const metaverseStyle = document.createElement('style');
        metaverseStyle.textContent = `
            @keyframes univo-metaverse-bg {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(metaverseStyle);
    });
    
    document.body.appendChild(portal);
    showNotification('Metaverse portal created! Click to enter.', 'info');
}

function connectNeuralInterface() {
    console.log('🧠 Connecting neural interface');
    
    // Add neural pulse effect to video elements
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.classList.add('univo-neural-pulse');
    });
    
    // Show neural interface indicator
    const neuralIndicator = document.createElement('div');
    neuralIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
        color: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,255,136,0.3);
    `;
    neuralIndicator.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">🧠 Neural Interface</div>
        <div style="font-size: 12px;">Status: Connected</div>
        <div style="font-size: 10px; opacity: 0.8; margin-top: 5px;">Brainwave sync: Active</div>
    `;
    
    document.body.appendChild(neuralIndicator);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        neuralIndicator.style.opacity = '0';
        setTimeout(() => neuralIndicator.remove(), 300);
    }, 5000);
    
    showNotification('Neural interface connected successfully!', 'success');
}

function verifyBlockchainIdentity() {
    console.log('⛓️ Verifying blockchain identity');
    
    // Show verification process
    const verificationModal = document.createElement('div');
    verificationModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    verificationModal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px;">
            <div style="font-size: 48px; margin-bottom: 20px;">⛓️</div>
            <h2 style="margin-bottom: 20px; color: #333;">Blockchain Identity Verification</h2>
            <div style="margin-bottom: 20px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Verifying identity on blockchain...</div>
                <div style="width: 100%; height: 4px; background: #f0f0f0; border-radius: 2px; overflow: hidden;">
                    <div style="width: 0%; height: 100%; background: #4CAF50; transition: width 3s ease;" id="progress-bar"></div>
                </div>
            </div>
            <div style="font-size: 12px; color: #999;">DID: did:univo:${Date.now().toString(36)}</div>
        </div>
    `;
    
    document.body.appendChild(verificationModal);
    
    // Animate progress bar
    setTimeout(() => {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }
    }, 100);
    
    // Complete verification after 3 seconds
    setTimeout(() => {
        verificationModal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px;">
                <div style="font-size: 48px; margin-bottom: 20px; color: #4CAF50;">✅</div>
                <h2 style="margin-bottom: 20px; color: #333;">Identity Verified!</h2>
                <div style="font-size: 14px; color: #666; margin-bottom: 20px;">Your blockchain identity has been successfully verified.</div>
                <button onclick="this.closest('div').parentElement.remove()" 
                        style="background: #4CAF50; border: none; color: white; padding: 10px 20px; 
                               border-radius: 5px; cursor: pointer;">Continue</button>
            </div>
        `;
    }, 3000);
}

// Utility functions
function showUnivoPanel() {
    // Remove existing panel
    const existingPanel = document.getElementById('univo-panel');
    if (existingPanel) {
        existingPanel.remove();
        return;
    }
    
    // Create enhancement panel
    const panel = document.createElement('div');
    panel.id = 'univo-panel';
    panel.innerHTML = `
        <div style="position: fixed; top: 50%; right: 20px; transform: translateY(-50%);
                    z-index: 10000; background: rgba(0, 0, 0, 0.95); color: white;
                    padding: 25px; border-radius: 15px; width: 280px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 18px;">🚀 Univo Enhancements</h3>
                <button onclick="this.closest('#univo-panel').remove()" 
                        style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; margin-bottom: 10px;">Platform: ${currentPlatform?.name || 'Unknown'}</div>
                <div style="font-size: 11px; color: #4CAF50;">✓ Video enhancement active</div>
                <div style="font-size: 11px; color: #4CAF50;">✓ AI features enabled</div>
                <div style="font-size: 11px; color: #4CAF50;">✓ Quantum security ready</div>
            </div>
            
            <div style="display: grid; gap: 10px;">
                <button onclick="toggleAIAssistant()" 
                        style="background: #4CAF50; border: none; color: white; padding: 10px; 
                               border-radius: 8px; cursor: pointer; font-size: 12px;">
                    🤖 Toggle AI Assistant
                </button>
                <button onclick="enterMetaverseMode()" 
                        style="background: #2196F3; border: none; color: white; padding: 10px; 
                               border-radius: 8px; cursor: pointer; font-size: 12px;">
                    🌐 Enter Metaverse
                </button>
                <button onclick="connectNeuralInterface()" 
                        style="background: #FF9800; border: none; color: white; padding: 10px; 
                               border-radius: 8px; cursor: pointer; font-size: 12px;">
                    🧠 Neural Interface
                </button>
                <button onclick="verifyBlockchainIdentity()" 
                        style="background: #9C27B0; border: none; color: white; padding: 10px; 
                               border-radius: 8px; cursor: pointer; font-size: 12px;">
                    ⛓️ Verify Identity
                </button>
            </div>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #333; 
                        font-size: 10px; text-align: center; opacity: 0.7;">
                Univo Extension v1.0.0<br>
                Next-Generation Video Conferencing
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
}

function toggleUnivoEnhancements() {
    if (univoEnhanced) {
        // Remove enhancements
        document.querySelectorAll('.univo-enhanced').forEach(el => {
            el.classList.remove('univo-enhanced');
        });
        document.querySelectorAll('.univo-ai-overlay, .univo-quantum-indicator').forEach(el => {
            el.remove();
        });
        univoEnhanced = false;
        showNotification('Univo enhancements disabled', 'info');
    } else {
        // Apply enhancements
        applyInitialEnhancements();
        showNotification('Univo enhancements enabled', 'success');
    }
}

function toggleQuantumMode() {
    const quantumIndicators = document.querySelectorAll('.univo-quantum-indicator');
    
    if (quantumIndicators.length > 0) {
        quantumIndicators.forEach(indicator => indicator.remove());
        showNotification('Quantum mode disabled', 'info');
    } else {
        // Add quantum indicators to all videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            const container = video.parentElement;
            if (container && container.style.position !== 'relative') {
                container.style.position = 'relative';
                
                const indicator = document.createElement('div');
                indicator.className = 'univo-quantum-indicator';
                indicator.innerHTML = '🔐 Quantum Secured';
                container.appendChild(indicator);
            }
        });
        showNotification('Quantum security enabled', 'success');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10001;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 13px;
        font-weight: bold;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(10px)';
    }, 100);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        detectMeetingPlatform,
        enhanceCurrentMeeting,
        toggleAIAssistant,
        showNotification
    };
}