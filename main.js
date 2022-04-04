'use strict';

const DEBUG = false;

const { app, BrowserWindow, ipcMain } = require('electron');

ipcMain.handle('get-user-path', function () {
  return app.getPath('userData');
});

const Config = require('./include/js/config');
const config = new Config(app.getPath('userData'));
let mainWindow;

require('./include/js/camera');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.setFullScreen(!DEBUG);

  mainWindow.loadFile('index.html');

  if (config.get('startup/showDevTools')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.allowRendererProcessReuse = false;

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
