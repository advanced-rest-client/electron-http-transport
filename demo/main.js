const {app, BrowserWindow} = require('electron');
const {PreferencesManager} = require('@advanced-rest-client/arc-electron-preferences/main');
const path = require('path');
let mainWindow = null;
let prefs = null;

function initialize() {
  function createWindow() {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.getName()
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.on('ready', () => {
    createWindow();
    prefs = new PreferencesManager();
    prefs.observe();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}

initialize();
