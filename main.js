'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');

ipcMain.handle('get-user-path', function () {
    return app.getPath('userData');
});
ipcMain.on('admin-restart', () => {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
    app.exit(0);
});

const Config = require('./include/js/config');
const config = new Config(app.getPath('userData'));
let mainWindow;

require('./include/js/camera');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: config.get('startup/fullscreen') ? 1200 : 1920,
        height: config.get('startup/fullscreen') ? 800 : 1080,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.setFullScreen(config.get('startup/fullscreen'));

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
