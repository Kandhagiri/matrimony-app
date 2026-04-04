const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const log = require('electron-log');

// Initialize electron-log to handle IPC from renderer
log.initialize();

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
// Configure electron-log
log.transports.file.level = app.isPackaged ? 'info' : 'debug';
log.transports.console.level = app.isPackaged ? 'warn' : 'debug';
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.info('Electron app starting...');
log.info('App version:', app.getVersion());
log.info('Platform:', process.platform);
log.info('Is packaged:', app.isPackaged);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  log.info('Squirrel startup detected, quitting...');
  app.quit();
}

// Import services
const DatabaseService = require('./main/services/DatabaseService');
const ExportService = require('./main/services/ExportService');
const FileService = require('./main/services/FileService');

// Initialize services
let dbService;
let exportService;
let fileService;

// App data path - use Electron's userData directory
let appDataPath;

// Initialize app data path and services
function initializeAppData() {
  // Use app.getPath('userData') for production, relative path for development
  appDataPath = app.isPackaged
    ? path.join(app.getPath('userData'), 'app_data')
    : path.join(__dirname, '../app_data');

  // Ensure app_data directory exists
  const fs = require('fs');
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }

  // Ensure subdirectories exist
  const imagesPath = path.join(appDataPath, 'images');
  const backupsPath = path.join(appDataPath, 'backups');
  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
  }
  if (!fs.existsSync(backupsPath)) {
    fs.mkdirSync(backupsPath, { recursive: true });
  }

  // Initialize services
  dbService = new DatabaseService(appDataPath);
  exportService = new ExportService(appDataPath);
  fileService = new FileService(appDataPath);

  // Initialize database
  dbService.init();
}

const createWindow = () => {
  // Check if we're in development mode
  const isDev = !app.isPackaged;

  // Determine preload path
  let preloadPath;
  if (typeof MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY !== 'undefined') {
    preloadPath = MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY;
  } else if (isDev) {
    preloadPath = path.join(__dirname, '../src/main/preload.js');
  } else {
    preloadPath = path.join(__dirname, 'main/preload.js');
  }

  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: false,
      allowEval: true,
      webSecurity: false, // Disable webSecurity in development to allow WebSocket connections
    },
    title: 'தமிழ்நாடு சைவ வேளாளர் சங்கம் - திருமண மேலாண்மை',
  });

  // Additional CSP handling for this specific window
  if (isDev && !isDev) {
    // Inject script to remove CSP meta tags and override CSP immediately
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          // Remove CSP meta tags
          const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"], meta[http-equiv="content-security-policy"], meta[http-equiv="X-Content-Security-Policy"]');
          metaTags.forEach(tag => tag.remove());
          
          // Override CSP at the document level
          const meta = document.createElement('meta');
          meta.httpEquiv = 'Content-Security-Policy';
          meta.content = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http: https: file:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'unsafe-inline' data:; connect-src * ws: wss: http: https: file:; img-src * data: blob: file:; font-src * data: file:; frame-src *; object-src *; media-src *; worker-src * blob:; frame-ancestors *;";
          document.head.appendChild(meta);
        })();
      `).catch(() => { });
    });

    // Also inject CSP override immediately when DOM is ready
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          if (document.head) {
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            meta.content = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http: https: file:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'unsafe-inline' data:; connect-src * ws: wss: http: https: file:; img-src * data: blob: file:; font-src * data: file:; frame-src *; object-src *; media-src *; worker-src * blob:; frame-ancestors *;";
            document.head.appendChild(meta);
          }
        })();
      `).catch(() => { });
    });
  }

  // Load React app

  if (isDev) {
    // Development mode - load from React dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - electron-forge webpack plugin bundles the renderer
    // Use the webpack entry point constant (injected by webpack)
    if (typeof MAIN_WINDOW_WEBPACK_ENTRY !== 'undefined') {
      mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    } else {
      // Fallback if constant not available
      mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set up CSP handling globally for development mode (BEFORE creating windows)
  if (!app.isPackaged && app.isPackaged) {
    const { session } = require('electron').session.defaultSession;

    // Remove CSP headers from all responses and replace with permissive CSP
    session.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };

      // Remove all CSP-related headers (case-insensitive)
      Object.keys(responseHeaders).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'content-security-policy' ||
          lowerKey === 'content-security-policy-report-only' ||
          lowerKey === 'x-content-security-policy') {
          delete responseHeaders[key];
        }
      });

      // Set a permissive CSP header to override any remaining CSP
      // This allows everything including Chrome DevTools connections
      responseHeaders['Content-Security-Policy'] = [
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http: https: file:; " +
        "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "style-src * 'unsafe-inline' data:; " +
        "connect-src * ws: wss: http: https: file:; " +
        "img-src * data: blob: file:; " +
        "font-src * data: file:; " +
        "frame-src *; " +
        "object-src *; " +
        "media-src *; " +
        "worker-src * blob:; " +
        "frame-ancestors *;"
      ];

      callback({ responseHeaders });
    });

    log.debug('CSP handler configured for development mode');
  }

  // Initialize app data and services first
  initializeAppData();

  // Then create the window
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Profile management
ipcMain.handle('get-profiles', async () => {
  try {
    const data = dbService.getAllProfiles();
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error getting profiles:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('get-profile-by-id', async (event, id) => {
  try {
    const data = await dbService.getProfileById(id);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error getting profile by ID:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('add-profile', async (event, profileData) => {
  try {
    const data = await dbService.addProfile(profileData);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error adding profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('update-profile', async (event, id, profileData) => {
  try {
    const data = await dbService.updateProfile(id, profileData);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error updating profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('delete-profile', async (event, id) => {
  try {
    const data = await dbService.deleteProfile(id);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error deleting profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('search-profiles', async (event, criteria) => {
  try {
    const data = await dbService.searchProfiles(criteria);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error searching profiles:', error);
    return { success: false, data: null, error: error.message };
  }
});

// Status management
ipcMain.handle('deactivate-profile', async (event, profileId, reason, marriedThroughService) => {
  try {
    const data = await dbService.deactivateProfile(profileId, reason, marriedThroughService);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error deactivating profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('activate-profile', async (event, profileId) => {
  try {
    const data = await dbService.activateProfile(profileId);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error activating profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

// Backup/Restore
ipcMain.handle('export-data', async () => {
  try {
    const data = await exportService.exportData();
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error exporting data:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('import-data', async (event, backupPath) => {
  try {
    const data = await exportService.importData(backupPath);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error importing data:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('list-backups', async () => {
  try {
    const data = await exportService.listBackups();
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error listing backups:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('delete-backup', async (event, filename) => {
  try {
    const data = await exportService.deleteBackup(filename);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error deleting backup:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('select-backup-file', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Backup Files', extensions: ['zip'] }
      ]
    });

    if (!result.canceled) {
      return { success: true, data: result.filePaths[0], error: null };
    }
    return { success: true, data: null, error: null };
  } catch (error) {
    log.error('Error selecting backup file:', error);
    return { success: false, data: null, error: error.message };
  }
});

// Image handling
ipcMain.handle('save-image', async (event, imageData, profileId, imageId) => {
  try {
    const data = await fileService.saveImage(imageData, profileId, imageId);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error saving image:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('delete-image', async (event, imagePath) => {
  try {
    const data = await fileService.deleteImage(imagePath);
    return { success: true, data, error: null };
  } catch (error) {
    log.error('Error deleting image:', error);
    return { success: false, data: null, error: error.message };
  }
});

// Resource path resolution for production builds
ipcMain.handle('get-resource-path', async (event, relativePath) => {
  try {
    // In production, files are in resources/js/ directory
    if (app.isPackaged) {
      // Get the path to resources directory
      const resourcesPath = process.resourcesPath || path.join(process.resourcesPath || __dirname, '..');
      const fullPath = path.join(resourcesPath, relativePath);

      // Check if file exists
      const fs = require('fs');
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }

      // Try alternative paths
      const alternatives = [
        path.join(process.resourcesPath, relativePath),
        path.join(__dirname, '..', 'resources', relativePath),
        path.join(__dirname, '..', relativePath),
      ];

      for (const altPath of alternatives) {
        if (fs.existsSync(altPath)) {
          return altPath;
        }
      }
    } else {
      // Development mode - use public directory
      return path.join(__dirname, '../public', relativePath);
    }

    return null;
  } catch (error) {
    log.error('Error resolving resource path:', error);
    return null;
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
