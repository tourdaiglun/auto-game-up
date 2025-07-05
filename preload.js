const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Renderer -> Main
    startProcess: (data) => ipcRenderer.invoke('start-process', data),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.send('save-settings', settings),

    // Main -> Renderer
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_event, value) => callback(value)),
    onProcessComplete: (callback) => ipcRenderer.on('process-complete', (_event, value) => callback(value)),
});