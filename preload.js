const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    loadPage: (page) => ipcRenderer.send("load-page", page),
    minimize: () => ipcRenderer.send("minimize-window"),
    maximize: () => ipcRenderer.send("maximize-window"),
    close: () => ipcRenderer.send("close-window"),
    onMaximize: (callback) => ipcRenderer.on("window-maximized", callback),
    onRestore: (callback) => ipcRenderer.on("window-restored", callback),
    takeScreenshot: () => ipcRenderer.invoke("take-screenshot"),
    captureScreenshot: () => ipcRenderer.send('capture-screenshot'),
    onScreenshotSaved: (callback) => ipcRenderer.on('screenshot-saved', callback),
	loginWithGoogle: () => ipcRenderer.invoke('google-login'),
	logoutGoogle: () => ipcRenderer.invoke('google-logout'),
	getCalendarEvents: () => ipcRenderer.invoke("get-calendar-events"),
	onGoogleLogout: (callback) => ipcRenderer.on("google-logged-out", callback),
});