"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('show-open-dialog', options),
    showItemInFolder: (fullPath) => electron_1.ipcRenderer.invoke('show-item-in-folder', fullPath),
});
