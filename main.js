"use strict";

const {
  app,
  BrowserWindow,
  ipcMain: ipc
} = require('electron')

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })
  mainWindow.maximize();

  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

const Webcam = require('./include/js/camera/webcam');
let w = new Webcam();

ipc.on('check', function (event, arg) {
  return w.list_cameras();
})