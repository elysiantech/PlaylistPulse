"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Packages
const electron_1 = require("electron");
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const electron_log_1 = __importDefault(require("electron-log"));
const path = __importStar(require("path"));
// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
if (electron_1.app.isPackaged) {
    electron_log_1.default.transports.file.level = 'warn';
    electron_log_1.default.transports.file.resolvePathFn = () => path.join(electron_1.app.getPath('userData'), 'logs', 'playlistpulse.log');
    electron_log_1.default.initialize();
    Object.assign(console, electron_log_1.default.functions);
    process.on('uncaughtException', (error) => { electron_log_1.default.error(error); });
    process.on('unhandledRejection', (reason, promise) => { electron_log_1.default.error('Unhandled Rejection at:', promise, 'reason:', reason); });
}
const isProd = electron_1.app.isPackaged;
// Always use Next.js but with different configs
const rendererDir = isProd
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'renderer')
    : path.join(electron_1.app.getAppPath(), 'renderer');
const nextApp = (0, next_1.default)({
    dev: !isProd,
    dir: rendererDir,
    conf: {
        distDir: '.next'
    }
});
const handle = nextApp.getRequestHandler();
// IPC handlers for directory selection
electron_1.ipcMain.handle('show-open-dialog', async (_, options) => {
    const result = await electron_1.dialog.showOpenDialog(options);
    return result;
});
electron_1.ipcMain.handle('show-item-in-folder', async (_, fullPath) => {
    electron_1.shell.showItemInFolder(fullPath);
});
// Prepare the renderer once the app is ready
electron_1.app.on('ready', async () => {
    try {
        await nextApp.prepare();
        const port = process.argv[2] || 3000;
        (0, http_1.createServer)((req, res) => {
            const parsedUrl = (0, url_1.parse)(req.url, true);
            handle(req, res, parsedUrl);
        }).listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`);
        });
        const mainWindow = new electron_1.BrowserWindow({
            width: 1200,
            height: 1050,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
            },
            show: false
        });
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            electron_1.shell.openExternal(url);
            return { action: 'deny' };
        });
        mainWindow.webContents.on('did-finish-load', () => {
            if (!isProd) {
                mainWindow.webContents.openDevTools();
            }
            mainWindow.show();
        });
        mainWindow.loadURL(`http://localhost:${port}/`);
    }
    catch (error) {
        console.error('Failed to start app:', error);
        electron_log_1.default.error('Failed to start app:', error);
    }
});
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
