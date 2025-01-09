"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Packages
const electron_1 = require("electron");
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const isProd = process.env.NODE_ENV === 'production';
const nextApp = (0, next_1.default)({ dev: !isProd, dir: electron_1.app.getAppPath() + '/renderer' });
const handle = nextApp.getRequestHandler();
// Prepare the renderer once the app is ready
electron_1.app.on('ready', async () => {
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
            contextIsolation: false,
            //preload: join(__dirname, 'preload.js'),
        },
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url); // Open external links in the default browser
        return { action: 'deny' }; // Prevent Electron from navigating the current window
    });
    mainWindow.webContents.on('did-finish-load', () => {
        if (!isProd) {
            mainWindow.webContents.openDevTools();
        }
    });
    mainWindow.loadURL(`http://localhost:${port}/`);
});
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
