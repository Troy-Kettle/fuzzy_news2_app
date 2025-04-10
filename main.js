const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Store = require('electron-store');
const log = require('electron-log');

// Initialize store for settings
const store = new Store({
  defaults: {
    apiUrl: 'http://localhost:8000',
    windowSize: { width: 1200, height: 800 },
    theme: 'light',
    recentPatients: []
  }
});

// Configure logging
log.transports.file.level = 'info';
log.info('Application starting...');

let mainWindow;
let apiUrl = store.get('apiUrl');

function createWindow() {
  const { width, height } = store.get('windowSize');
  
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Save window size on close
  mainWindow.on('close', () => {
    store.set('windowSize', mainWindow.getBounds());
  });

  // Create menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Assessment',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('new-assessment')
        },
        { type: 'separator' },
        {
          label: 'Settings',
          click: () => mainWindow.webContents.send('open-settings')
        },
        { type: 'separator' },
        { role: 'quit' }
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
      role: 'help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: 'About Fuzzy NEWS-2',
              message: 'Fuzzy NEWS-2 Desktop',
              detail: 'Version 0.1.0\nA fuzzy logic implementation of the National Early Warning Score 2 (NEWS-2) system.\n\nCopyright © 2025',
              buttons: ['OK'],
              icon: path.join(__dirname, 'assets/icon.png')
            });
          }
        },
        {
          label: 'Documentation',
          click: async () => {
            await require('electron').shell.openExternal('https://github.com/yourusername/fuzzy-news2-electron#readme');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for communication with the renderer process
ipcMain.handle('get-api-url', () => {
  return apiUrl;
});

ipcMain.handle('set-api-url', (event, url) => {
  apiUrl = url;
  store.set('apiUrl', url);
  return true;
});

ipcMain.handle('get-theme', () => {
  return store.get('theme');
});

ipcMain.handle('set-theme', (event, theme) => {
  store.set('theme', theme);
  return true;
});

ipcMain.handle('get-recent-patients', () => {
  return store.get('recentPatients');
});

ipcMain.handle('add-recent-patient', (event, patientId) => {
  const recentPatients = store.get('recentPatients');
  
  // Remove if already exists
  const index = recentPatients.indexOf(patientId);
  if (index !== -1) {
    recentPatients.splice(index, 1);
  }
  
  // Add to beginning of array
  recentPatients.unshift(patientId);
  
  // Keep only the last 10
  if (recentPatients.length > 10) {
    recentPatients.pop();
  }
  
  store.set('recentPatients', recentPatients);
  return recentPatients;
});

// API communication handlers
ipcMain.handle('api-health-check', async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/health`);
    return response.data;
  } catch (error) {
    log.error('API health check failed:', error);
    throw new Error(`API health check failed: ${error.message}`);
  }
});

ipcMain.handle('api-calculate', async (event, vitals) => {
  try {
    const response = await axios.post(`${apiUrl}/api/calculate`, vitals);
    return response.data;
  } catch (error) {
    log.error('API calculate failed:', error);
    throw new Error(`API calculation failed: ${error.message}`);
  }
});

ipcMain.handle('api-get-history', async (event, patientId, limit = 10) => {
  try {
    const response = await axios.get(`${apiUrl}/api/history/${patientId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    log.error('API get history failed:', error);
    throw new Error(`API get history failed: ${error.message}`);
  }
});

ipcMain.handle('api-get-statistics', async (event, patientId, days = 7) => {
  try {
    const response = await axios.get(`${apiUrl}/api/statistics/${patientId}?days=${days}`);
    return response.data;
  } catch (error) {
    log.error('API get statistics failed:', error);
    throw new Error(`API get statistics failed: ${error.message}`);
  }
});
