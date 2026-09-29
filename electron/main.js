const { app, BrowserWindow, Menu, Tray, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let tray = null;
let serverProcess = null;
const APP_URL = 'http://localhost:3000';

function isServerAlive() {
  return new Promise((resolve) => {
    http.get(`${APP_URL}/api/admin/health`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const alive = await isServerAlive();
    if (alive) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function startServer() {
  const projectDir = path.resolve(__dirname, '..');
  serverProcess = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'start'], {
    cwd: projectDir,
    stdio: 'ignore',
    windowsHide: true,
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    title: 'KDP Intelligence Operating System',
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const alive = await isServerAlive();
  if (!alive) {
    startServer();
    await waitForServer(30);
  }

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});
