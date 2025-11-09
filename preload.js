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
});

contextBridge.exposeInMainWorld("env", {
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
});
contextBridge.exposeInMainWorld("supabaseAuth", {
  isConfigured: () => ipcRenderer.invoke("supabase:is-configured"),
  signInWithPassword: (credentials) => ipcRenderer.invoke("supabase:sign-in", credentials),
  signUp: (credentials) => ipcRenderer.invoke("supabase:sign-up", credentials),
  getSession: () => ipcRenderer.invoke("supabase:get-session"),
  signOut: () => ipcRenderer.invoke("supabase:sign-out"),
});