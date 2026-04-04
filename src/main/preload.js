const { contextBridge, ipcRenderer } = require('electron');
const log = require('electron-log');

// Expose electron-log to renderer process
contextBridge.exposeInMainWorld('electronLog', {
  error: (...args) => log.error(...args),
  warn: (...args) => log.warn(...args),
  info: (...args) => log.info(...args),
  verbose: (...args) => log.verbose(...args),
  debug: (...args) => log.debug(...args),
  silly: (...args) => log.silly(...args),
});

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  versions: process.versions
});
// src/preload.js

contextBridge.exposeInMainWorld('pramukh', {
  isElectron: true,
  versions: process.versions
});
contextBridge.exposeInMainWorld('electronProcess', {
  versions: { electron: process.versions.electron }
});
contextBridge.exposeInMainWorld('electronAPI', {
  // Profile management
  getProfiles: () => ipcRenderer.invoke('get-profiles'),
  getProfileById: (id) => ipcRenderer.invoke('get-profile-by-id', id),
  addProfile: (profileData) => ipcRenderer.invoke('add-profile', profileData),
  updateProfile: (id, profileData) => ipcRenderer.invoke('update-profile', id, profileData),
  deleteProfile: (id) => ipcRenderer.invoke('delete-profile', id),
  searchProfiles: (criteria) => ipcRenderer.invoke('search-profiles', criteria),

  // Status management
  deactivateProfile: (profileId, reason, marriedThroughService) =>
    ipcRenderer.invoke('deactivate-profile', profileId, reason, marriedThroughService),
  activateProfile: (profileId) => ipcRenderer.invoke('activate-profile', profileId),

  // Backup/Restore
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: (backupPath) => ipcRenderer.invoke('import-data', backupPath),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  deleteBackup: (filename) => ipcRenderer.invoke('delete-backup', filename),
  selectBackupFile: () => ipcRenderer.invoke('select-backup-file'),

  // Image handling
  saveImage: (imageData, profileId, imageId) =>
    ipcRenderer.invoke('save-image', imageData, profileId, imageId),
  deleteImage: (imagePath) => ipcRenderer.invoke('delete-image', imagePath),

  // Utility
  getResourcePath: (relativePath) => ipcRenderer.invoke('get-resource-path', relativePath),
});

