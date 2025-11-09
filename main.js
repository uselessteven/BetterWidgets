require("dotenv").config();
const path = require("path");
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
let win;
let supabaseClient = null;
const hasSupabaseConfig =
  Boolean(process.env.SUPABASE_URL) && Boolean(process.env.SUPABASE_ANON_KEY);

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 600,
    frame: false,
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.removeMenu();
  win.loadFile("src/auth/login.html");
  //win.webContents.openDevTools();
  ipcMain.on("minimize-window", () => win.minimize());
  ipcMain.on("maximize-window", () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on("close-window", () => win.close());
  ipcMain.on("load-page", (event, page) => win.loadFile(page));
    ipcMain.on("capture-screenshot", async () => {
    try {
      const screenshotPath = await captureScreenshot();
      win.webContents.send('screenshot-saved', screenshotPath);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  });
  win.on("maximize", () => win.webContents.send("window-maximized"));
  win.on("unmaximize", () => win.webContents.send("window-restored"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle("take-screenshot", async () => {
    const image = await win.webContents.capturePage();
    const screenshotPath = path.join(app.getPath("desktop"), `screenshot-${Date.now()}.png`);
    fs.writeFileSync(screenshotPath, image.toPNG());
    return screenshotPath;
  });

  globalShortcut.register("Control+Shift+I", () => {
    if (!win) return;
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools({ mode: "detach" });
    }
  });
});

function captureScreenshot() {
  return new Promise((resolve, reject) => {
    win.capturePage().then(image => {
      const filePath = path.join(app.getPath('downloads'), 'screenshot.png');
      const imageBuffer = image.toPNG();
      fs.writeFileSync(filePath, imageBuffer);
      resolve(filePath);
    }).catch(err => {
      console.error('Error capturing the application window:', err);
      reject('Error capturing the application window');
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

function getSupabaseClient() {
  if (!hasSupabaseConfig) {
    throw new Error("SUPABASE_ENV_NOT_CONFIGURED");
  }
  if (!supabaseClient) {
    console.info("[auth] Inicializando cliente de Supabase");
    supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseClient;
}

function serializeSupabaseResponse(payload) {
  return JSON.parse(
    JSON.stringify({
      data: payload?.data ?? null,
      error: payload?.error
        ? {
            message: payload.error.message,
            status: payload.error.status ?? null,
            name: payload.error.name ?? payload.error.code ?? "SupabaseError",
          }
        : null,
    })
  );
}

ipcMain.handle("supabase:is-configured", () => hasSupabaseConfig);

ipcMain.handle("supabase:sign-in", async (_event, credentials) => {
  try {
    const client = getSupabaseClient();
    const result = await client.auth.signInWithPassword(credentials);
    console.info("[auth] signInWithPassword", {
      email: credentials?.email,
      success: !result.error,
    });
    return serializeSupabaseResponse(result);
  } catch (error) {
    console.error("[auth] signInWithPassword error", error);
    return serializeSupabaseResponse({ data: null, error });
  }
});

ipcMain.handle("supabase:sign-up", async (_event, credentials) => {
  try {
    const client = getSupabaseClient();
    const result = await client.auth.signUp(credentials);
    console.info("[auth] signUp", {
      email: credentials?.email,
      success: !result.error,
    });
    return serializeSupabaseResponse(result);
  } catch (error) {
    console.error("[auth] signUp error", error);
    return serializeSupabaseResponse({ data: null, error });
  }
});

ipcMain.handle("supabase:get-session", async () => {
  try {
    const client = getSupabaseClient();
    const result = await client.auth.getSession();
    return serializeSupabaseResponse(result);
  } catch (error) {
    console.warn("[auth] getSession error", error);
    return serializeSupabaseResponse({ data: { session: null }, error });
  }
});

ipcMain.handle("supabase:sign-out", async () => {
  try {
    const client = getSupabaseClient();
    const result = await client.auth.signOut();
    console.info("[auth] signOut", { success: !result.error });
    return serializeSupabaseResponse(result);
  } catch (error) {
    console.error("[auth] signOut error", error);
    return serializeSupabaseResponse({ data: null, error });
  }
});