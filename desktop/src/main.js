/**
 * Univo Desktop Application - Main Process
 * Advanced video conferencing with AI, quantum security, and metaverse features
 */

const { app, BrowserWindow, Menu, ipcMain, dialog, shell, screen, systemPreferences } = require('electron');
const { autoUpdater } = require('electron-updater');
const windowStateKeeper = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const Store = require('electron-store');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Initialize logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Initialize secure storage
const store = new Store({
  name: 'univo-config',
  encryptionKey: 'univo-secure-key-2024',
  defaults: {
    windowBounds: { width: 1200, height: 800 },
    userPreferences: {
      theme: 'dark',
      language: 'en',
      notifications: true,
      autoStart: false,
      hardwareAcceleration: true,
      quantumSecurity: false,
      neuralInterface: false,
      metaverseMode: false
    },
    meetingSettings: {
      defaultCamera: null,
      defaultMicrophone: null,
      defaultSpeaker: null,
      videoQuality: 'hd',
      audioQuality: 'high',
      backgroundBlur: true,
      noiseCancellation: true
    }
  }
});

// Global variables
let mainWindow = null;
let splashWindow = null;
let aboutWindow = null;
let settingsWindow = null;
let isQuitting = false;
let deepLinkUrl = null;

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// App configuration
const APP_CONFIG = {
  name: 'Univo',
  version: app.getVersion(),
  description: 'Next-Generation Video Conferencing',
  website: 'https://univo.app',
  supportEmail: 'support@univo.app',
  minWidth: 800,
  minHeight: 600,
  defaultWidth: 1200,
  defaultHeight: 800
};

// Enable live reload for development
if (isDevelopment) {
  require('electron-debug')({ showDevTools: true });
}

// Configure auto-updater
autoUpdater.logger = log;
autoUpdater.checkForUpdatesAndNotify();

// Set up context menu
contextMenu({
  showLookUpSelection: false,
  showSearchWithGoogle: false,
  showCopyImage: true,
  showCopyImageAddress: true,
  showSaveImageAs: true,
  showInspectElement: isDevelopment,
  prepend: (defaultActions, params, browserWindow) => [
    {
      label: '🚀 Start Quantum Meeting',
      click: () => {
        browserWindow.webContents.send('start-quantum-meeting');
      }
    },
    {
      label: '🌐 Enter Metaverse',
      click: () => {
        browserWindow.webContents.send('enter-metaverse');
      }
    },
    {
      label: '🤖 AI Assistant',
      click: () => {
        browserWindow.webContents.send('toggle-ai-assistant');
      }
    }
  ]
});

// App event handlers
app.whenReady().then(async () => {
  log.info('🚀 Univo Desktop starting...');
  
  // Request permissions
  await requestPermissions();
  
  // Create splash screen
  createSplashWindow();
  
  // Initialize main window after splash
  setTimeout(() => {
    createMainWindow();
    if (splashWindow) {
      splashWindow.close();
    }
  }, 3000);
  
  // Set up app menu
  createApplicationMenu();
  
  // Handle deep links
  handleDeepLinks();
  
  // Set up IPC handlers
  setupIpcHandlers();
  
  // Check for updates
  if (isProduction) {
    autoUpdater.checkForUpdatesAndNotify();
  }
  
  log.info('✅ Univo Desktop initialized successfully');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Handle protocol for deep links
app.setAsDefaultProtocolClient('univo');

app.on('open-url', (event, url) => {
  event.preventDefault();
  deepLinkUrl = url;
  
  if (mainWindow) {
    mainWindow.webContents.send('deep-link', url);
    mainWindow.show();
    mainWindow.focus();
  }
});

// Windows/Linux deep link handling
app.on('second-instance', (event, commandLine) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    
    // Handle deep link from command line
    const url = commandLine.find(arg => arg.startsWith('univo://'));
    if (url) {
      mainWindow.webContents.send('deep-link', url);
    }
  }
});

// Request system permissions
async function requestPermissions() {
  try {
    // Request camera permission
    if (process.platform === 'darwin') {
      const cameraAccess = await systemPreferences.askForMediaAccess('camera');
      const microphoneAccess = await systemPreferences.askForMediaAccess('microphone');
      
      log.info(`Camera access: ${cameraAccess}, Microphone access: ${microphoneAccess}`);
    }
    
    // Request screen recording permission on macOS
    if (process.platform === 'darwin') {
      const screenAccess = systemPreferences.getMediaAccessStatus('screen');
      log.info(`Screen recording access: ${screenAccess}`);
    }
    
  } catch (error) {
    log.error('Error requesting permissions:', error);
  }
}

// Create splash window
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: white;
          border-radius: 20px;
        }
        .logo {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 20px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .tagline {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 30px;
        }
        .loading {
          width: 200px;
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          overflow: hidden;
        }
        .loading-bar {
          width: 0%;
          height: 100%;
          background: white;
          border-radius: 2px;
          animation: loading 2s ease-in-out infinite;
        }
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="logo">UNIVO</div>
      <div class="tagline">Next-Generation Video Conferencing</div>
      <div class="loading">
        <div class="loading-bar"></div>
      </div>
    </body>
    </html>
  `;
  
  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
  
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

// Create main application window
function createMainWindow() {
  // Restore window state
  const mainWindowState = windowStateKeeper({
    defaultWidth: APP_CONFIG.defaultWidth,
    defaultHeight: APP_CONFIG.defaultHeight
  });
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: APP_CONFIG.minWidth,
    minHeight: APP_CONFIG.minHeight,
    show: false,
    icon: getIconPath(),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: true
    }
  });
  
  // Manage window state
  mainWindowState.manage(mainWindow);
  
  // Load the app
  const startUrl = isDevelopment 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../web/index.html')}`;
  
  mainWindow.loadURL(startUrl);
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus window
    if (isDevelopment) {
      mainWindow.webContents.openDevTools();
    }
    
    // Handle deep link if available
    if (deepLinkUrl) {
      mainWindow.webContents.send('deep-link', deepLinkUrl);
      deepLinkUrl = null;
    }
  });
  
  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Handle window close (minimize to tray on macOS)
  mainWindow.on('close', (event) => {
    if (!isQuitting && process.platform === 'darwin') {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  
  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  // Security: Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && 
        parsedUrl.origin !== 'https://univo.app' &&
        !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });
  
  return mainWindow;
}

// Create application menu
function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Meeting',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-meeting');
          }
        },
        {
          label: 'Join Meeting',
          accelerator: 'CmdOrCtrl+J',
          click: () => {
            mainWindow.webContents.send('join-meeting');
          }
        },
        { type: 'separator' },
        {
          label: 'Start Quantum Meeting',
          accelerator: 'CmdOrCtrl+Shift+Q',
          click: () => {
            mainWindow.webContents.send('start-quantum-meeting');
          }
        },
        {
          label: 'Enter Metaverse',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => {
            mainWindow.webContents.send('enter-metaverse');
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            createSettingsWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Meeting',
      submenu: [
        {
          label: 'Toggle Camera',
          accelerator: 'CmdOrCtrl+Shift+V',
          click: () => {
            mainWindow.webContents.send('toggle-camera');
          }
        },
        {
          label: 'Toggle Microphone',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            mainWindow.webContents.send('toggle-microphone');
          }
        },
        {
          label: 'Share Screen',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('share-screen');
          }
        },
        { type: 'separator' },
        {
          label: 'Start Recording',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.send('start-recording');
          }
        },
        {
          label: 'AI Assistant',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.send('toggle-ai-assistant');
          }
        }
      ]
    },
    {
      label: 'Advanced',
      submenu: [
        {
          label: 'Neural Interface',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow.webContents.send('toggle-neural-interface');
          }
        },
        {
          label: 'Blockchain Identity',
          accelerator: 'CmdOrCtrl+Shift+B',
          click: () => {
            mainWindow.webContents.send('verify-blockchain-identity');
          }
        },
        {
          label: 'Holographic Avatars',
          accelerator: 'CmdOrCtrl+Shift+H',
          click: () => {
            mainWindow.webContents.send('toggle-holographic-avatars');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' }
        ] : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Univo',
          click: () => {
            createAboutWindow();
          }
        },
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal(APP_CONFIG.website);
          }
        },
        {
          label: 'Support',
          click: () => {
            shell.openExternal(`mailto:${APP_CONFIG.supportEmail}`);
          }
        }
      ]
    }
  ];
  
  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create settings window
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }
  
  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  // Load settings page
  const settingsUrl = isDevelopment 
    ? 'http://localhost:3000/settings' 
    : `file://${path.join(__dirname, '../web/settings.html')}`;
  
  settingsWindow.loadURL(settingsUrl);
  
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });
  
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// Create about window
function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }
  
  aboutWindow = new BrowserWindow({
    width: 500,
    height: 400,
    resizable: false,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  const aboutHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 40px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .logo {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .version {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 20px;
        }
        .description {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 30px;
        }
        .features {
          text-align: left;
          font-size: 12px;
          opacity: 0.9;
        }
        .feature {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="logo">UNIVO</div>
      <div class="version">Version ${APP_CONFIG.version}</div>
      <div class="description">
        Next-Generation Video Conferencing Platform with AI, Quantum Security, 
        Blockchain Identity, Neural Interfaces, and Metaverse Integration.
      </div>
      <div class="features">
        <div class="feature">🤖 AI-Powered Meeting Assistant</div>
        <div class="feature">🔐 Quantum-Safe Encryption</div>
        <div class="feature">⛓️ Blockchain Identity Verification</div>
        <div class="feature">🧠 Neural Interface Integration</div>
        <div class="feature">🌐 Metaverse Meeting Spaces</div>
        <div class="feature">👻 Holographic Avatars</div>
        <div class="feature">🎯 Real-time Emotion Recognition</div>
        <div class="feature">🌍 Multi-language Translation</div>
      </div>
    </body>
    </html>
  `;
  
  aboutWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(aboutHtml)}`);
  
  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
  });
  
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

// Set up IPC handlers
function setupIpcHandlers() {
  // App info
  ipcMain.handle('get-app-info', () => {
    return {
      name: APP_CONFIG.name,
      version: APP_CONFIG.version,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron
    };
  });
  
  // User preferences
  ipcMain.handle('get-user-preferences', () => {
    return store.get('userPreferences');
  });
  
  ipcMain.handle('set-user-preferences', (event, preferences) => {
    store.set('userPreferences', preferences);
    return true;
  });
  
  // Meeting settings
  ipcMain.handle('get-meeting-settings', () => {
    return store.get('meetingSettings');
  });
  
  ipcMain.handle('set-meeting-settings', (event, settings) => {
    store.set('meetingSettings', settings);
    return true;
  });
  
  // System info
  ipcMain.handle('get-system-info', () => {
    return {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      cpus: os.cpus().length,
      memory: Math.round(os.totalmem() / 1024 / 1024 / 1024), // GB
      displays: screen.getAllDisplays().map(display => ({
        id: display.id,
        bounds: display.bounds,
        workArea: display.workArea,
        scaleFactor: display.scaleFactor
      }))
    };
  });
  
  // File operations
  ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  });
  
  ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  });
  
  // Notifications
  ipcMain.handle('show-notification', (event, options) => {
    const { title, body, icon } = options;
    
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: icon || getIconPath()
      }).show();
    }
    
    return true;
  });
  
  // Window controls
  ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });
  
  ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });
  
  ipcMain.handle('close-window', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });
}

// Handle deep links
function handleDeepLinks() {
  // Handle protocol on Windows/Linux
  if (process.platform === 'win32' || process.platform === 'linux') {
    const args = process.argv.slice(1);
    const url = args.find(arg => arg.startsWith('univo://'));
    
    if (url) {
      deepLinkUrl = url;
    }
  }
}

// Get icon path based on platform
function getIconPath() {
  if (process.platform === 'darwin') {
    return path.join(__dirname, '../assets/icons/icon.icns');
  } else if (process.platform === 'win32') {
    return path.join(__dirname, '../assets/icons/icon.ico');
  } else {
    return path.join(__dirname, '../assets/icons/icon.png');
  }
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
  logMessage += ` - Downloaded ${progressObj.percent}%`;
  logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
  log.info(logMessage);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  autoUpdater.quitAndInstall();
});

// Export for testing
module.exports = {
  createMainWindow,
  createSettingsWindow,
  createAboutWindow,
  APP_CONFIG
};