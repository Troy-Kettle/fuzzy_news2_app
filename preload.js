const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // App settings
    getApiUrl: () => ipcRenderer.invoke('get-api-url'),
    setApiUrl: (url) => ipcRenderer.invoke('set-api-url', url),
    getTheme: () => ipcRenderer.invoke('get-theme'),
    setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
    getRecentPatients: () => ipcRenderer.invoke('get-recent-patients'),
    addRecentPatient: (patientId) => ipcRenderer.invoke('add-recent-patient', patientId),
    
    // API communication
    apiHealthCheck: () => ipcRenderer.invoke('api-health-check'),
    apiCalculate: (vitals) => ipcRenderer.invoke('api-calculate', vitals),
    apiGetHistory: (patientId, limit) => ipcRenderer.invoke('api-get-history', patientId, limit),
    apiGetStatistics: (patientId, days) => ipcRenderer.invoke('api-get-statistics', patientId, days),
    
    // Navigation events
    onNewAssessment: (callback) => ipcRenderer.on('new-assessment', callback),
    onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
    
    // Helper methods to remove listeners when they're no longer needed
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel);
    }
  }
);

// Expose versions
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});
