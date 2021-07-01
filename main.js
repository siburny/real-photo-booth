'use strict';

const {
  app,
  BrowserWindow,
  ipcMain: ipc,
} = require('electron');

require('@electron/remote/main').initialize();

const config = require('./include/js/config');
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  mainWindow.setFullScreen(true);

  mainWindow.loadFile('index.html');

  if (config.get('startup/showDevTools')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

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

const camera = require('./include/js/camera');

ipc.on('camera-capture', function (event, arg) {
  camera.capture(arg, function (err, data) {
    event.sender.send('camera-capture-done', data);
  });
});
