// Packages
import { BrowserWindow, app, shell, dialog, ipcMain } from 'electron'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import log from 'electron-log';
import * as path from 'path';

// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
if (app.isPackaged){
  log.transports.file.level = 'warn';
  log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs', 'vibesync.log')
  log.initialize()
  Object.assign(console, log.functions)
  process.on('uncaughtException', (error) => { log.error(error)})
  process.on('unhandledRejection', (reason, promise) => { log.error('Unhandled Rejection at:', promise, 'reason:', reason)})
}

const isProd = app.isPackaged

// Always use Next.js but with different configs
const rendererDir = isProd 
  ? path.join(process.resourcesPath, 'app.asar.unpacked', 'renderer')
  : path.join(app.getAppPath(), 'renderer')

const nextApp = next({ 
  dev: !isProd, 
  dir: rendererDir,
  conf: {
    distDir: '.next'
  }
})
const handle = nextApp.getRequestHandler()

// IPC handlers for directory selection
ipcMain.handle('show-open-dialog', async (_, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

ipcMain.handle('show-item-in-folder', async (_, fullPath) => {
  shell.showItemInFolder(fullPath);
});

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  try {
    await nextApp.prepare();
    
    const port = process.argv[2] || 3000;

    createServer((req: any, res: any) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    }).listen(port, () => {
      console.log(`> Ready on http://127.0.0.1:${port}`)
    })

    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 1050,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      show: false
    })

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    mainWindow.webContents.on('did-finish-load', () => {
      if (!isProd) {
        mainWindow.webContents.openDevTools();
      }
      mainWindow.show();
    });
    
    mainWindow.loadURL(`http://127.0.0.1:${port}/`)
  } catch (error) {
    console.error('Failed to start app:', error);
    log.error('Failed to start app:', error);
  }
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)
