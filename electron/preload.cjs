'use strict'

const { contextBridge, ipcRenderer } = require('electron')

/**
 * Expose safe Electron APIs to the renderer via window.electronAPI.
 * Only whitelisted IPC channels are exposed.
 */
contextBridge.exposeInMainWorld('electronAPI', {
    config: {
        /** Read (and parse) config.jsonc; resolves to object or null */
        read: () => ipcRenderer.invoke('config:read'),
        /** Write config object to config.jsonc */
        write: (data) => ipcRenderer.invoke('config:write', data),
    },
    folder: {
        /** Open native folder picker; resolves to { path, name } or null if cancelled */
        showPicker: () => ipcRenderer.invoke('folder:show-picker'),
        /**
         * Read image files from a folder path.
         * Resolves to [{ name, url, size }] where url is a carousel-local:// URL.
         */
        readImages: (folderPath) => ipcRenderer.invoke('folder:read-images', folderPath),
    },
})
