import { app, shell, BrowserWindow } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { initializeDatabase } from './database/prisma-client';
import { registerIpcHandlers } from './ipc';
import { BackupService } from './services/backup.service';

let mainWindow: BrowserWindow | null = null;
let autoBackupInterval: NodeJS.Timeout | null = null;

async function createWindow(): Promise<void> {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: 'Purchase Management System ERP',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      if (is.dev) {
        // mainWindow.webContents.openDevTools();
      }
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Register IPC handlers
  registerIpcHandlers(mainWindow);
}

// Start app
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.purchase.erp');

  // Watch shortcuts
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Initialize DB before loading window
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('CRITICAL: Database initialization failed:', error);
  }

  await createWindow();

  // Schedule auto backup every 1 hour
  const backupService = new BackupService();
  autoBackupInterval = setInterval(() => {
    backupService.runAutoBackup();
  }, 60 * 60 * 1000);

  // Run initial auto backup on startup
  backupService.runAutoBackup();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
