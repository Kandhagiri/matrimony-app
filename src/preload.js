// src/preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  versions: process.versions
});
contextBridge.exposeInMainWorld('__PRAMUKHIME_ELECTRON__', true);
// src/preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('pramukh', {
  isElectron: true,
  versions: process.versions
});
contextBridge.exposeInMainWorld('electronProcess', {
  versions: { electron: process.versions.electron }
});