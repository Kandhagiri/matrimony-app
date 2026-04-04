const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Import services
const DatabaseService = require('../src/main/services/DatabaseService');
const ExportService = require('../src/main/services/ExportService');
const FileService = require('../src/main/services/FileService');

let mainWindow;
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
    : path.join(__dirname, '../src/app_data');

  // Ensure app_data directory exists
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

function createWindow() {
  // Determine preload path
  let preloadPath;
  if (typeof MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY !== 'undefined') {
    preloadPath = MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY;
  } else {
    preloadPath = path.join(__dirname, '../src/main/preload.js');
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      allowEval: true,
      webSecurity: false,
    },
    title: 'தமிழ்நாடு சைவ வேளாளர் சங்கம் - திருமண மேலாண்மை',
  });

  // Load React app
  // Check if we're in development mode
  const isDev = !app.isPackaged;

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
      mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize app data and services first
  initializeAppData();

  // Then create the window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Profile Management
ipcMain.handle('get-profiles', async () => {
  try {
    const data = dbService.getAllProfiles();
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error getting profiles:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('get-profile-by-id', async (event, id) => {
  try {
    const profile = dbService.getProfileById(id);
    return { success: true, data: profile, error: null };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('add-profile', async (event, profileData) => {
  try {
    const result = dbService.addProfile(profileData);
    return { success: true, data: { ProfileID: result.ProfileID }, error: null };
  } catch (error) {
    console.error('Error adding profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('update-profile', async (event, id, profileData) => {
  try {
    dbService.updateProfile(id, profileData);
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('delete-profile', async (event, id) => {
  try {
    dbService.deleteProfile(id);
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('search-profiles', async (event, criteria) => {
  try {
    const profiles = dbService.searchProfiles(criteria);
    return { success: true, data: profiles, error: null };
  } catch (error) {
    console.error('Error searching profiles:', error);
    return { success: false, data: null, error: error.message };
  }
});

// Status Management
ipcMain.handle('deactivate-profile', async (event, profileId, reason, marriedThroughService) => {
  try {
    dbService.deactivateProfile(profileId, reason, marriedThroughService);
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('Error deactivating profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('activate-profile', async (event, profileId) => {
  try {
    dbService.activateProfile(profileId);
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('Error activating profile:', error);
    return { success: false, data: null, error: error.message };
  }
});

// Backup/Restore
ipcMain.handle('export-data', async () => {
  try {
    const filename = await exportService.createBackup();
    return { success: true, data: filename, error: null };
  } catch (error) {
    console.error('Error creating backup:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('import-data', async (event, backupPath) => {
  try {
    const data = await exportService.importData(backupPath);
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('list-backups', async () => {
  try {
    const backups = exportService.listBackups();
    return { success: true, data: backups, error: null };
  } catch (error) {
    console.error('Error listing backups:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('delete-backup', async (event, filename) => {
  try {
    exportService.deleteBackup(filename);
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('Error deleting backup:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('select-backup-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Backup Files', extensions: ['zip'] }
      ]
    });
    
    if (result.canceled) {
      return { success: false, data: null, error: 'User canceled' };
    }
    
    return { success: true, data: result.filePaths[0], error: null };
  } catch (error) {
    console.error('Error selecting backup file:', error);
    return { success: false, data: null, error: error.message };
  }
});

// Image Handling
ipcMain.handle('save-image', async (event, imageData, profileId, imageId) => {
  try {
    const imagePath = await fileService.saveImage(imageData, profileId, imageId);
    return { success: true, data: imagePath, error: null };
  } catch (error) {
    console.error('Error saving image:', error);
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('delete-image', async (event, imagePath) => {
  try {
    await fileService.deleteImage(imagePath);
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, data: null, error: error.message };
  }
});

