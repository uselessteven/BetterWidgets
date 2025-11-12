// src/auth/googleAuth.js
const { google } = require('googleapis');
const { BrowserWindow } = require('electron');
const ElectronStore = require('electron-store');
const store = new (ElectronStore.default || ElectronStore)();
require('dotenv').config({ path: 'credentials.env' });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid"
];

let oAuth2Client;

/**
 * Inicializa o reutiliza el cliente OAuth2.
 */
function getOAuthClient() {
  if (!oAuth2Client) {
    oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  }
  return oAuth2Client;
}

/**
 * Carga credenciales guardadas en electron-store.
 */
function loadSavedCredentials() {
  const token = store.get('google_token');
  if (token) {
    getOAuthClient().setCredentials(token);
    return true;
  }
  return false;
}

/**
 * Abre la ventana de login con Google y guarda los tokens.
 */
async function loginWithGoogle() {
  return new Promise((resolve, reject) => {
    const oAuth2Client = getOAuthClient();

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
    });

    let authWindow = new BrowserWindow({
      width: 400,
      height: 600,
      resizable: false,
      autoHideMenuBar: true,
      title: "Iniciar sesión con Google",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    authWindow.loadURL(authUrl);

    let handled = false; // evita múltiples ejecuciones del callback

    const handleCallback = async (targetUrl) => {
      if (handled) return; // Evita doble llamada
      handled = true;

      console.log("🔁 Callback recibido desde:", targetUrl);

      try {
        const codeMatch = targetUrl.match(/[?&]code=([^&]+)/);
        const errorMatch = targetUrl.match(/[?&]error=([^&]+)/);

        if (errorMatch) {
          const error = decodeURIComponent(errorMatch[1]);
          reject(new Error("Error en autenticación: " + error));
          authWindow.close();
          return;
        }

        if (codeMatch) {
          const code = decodeURIComponent(codeMatch[1]);
          console.log("Código OAuth recibido:", code);

          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);
          store.set('google_token', tokens);

          // Obtener info del perfil del usuario
          const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
          const { data: userInfo } = await oauth2.userinfo.get();

          console.log("Usuario autenticado:", userInfo.email);

          authWindow.close();
          resolve({ tokens, user: userInfo });
        } else {
          handled = false; // Si no se encontró el code, permitimos reintentar
        }
      } catch (err) {
        console.error("Error en handleCallback:", err);
        reject(err);
        if (authWindow) authWindow.close();
      }
    };

    // Algunos redireccionamientos usan `did-navigate`, otros `will-redirect`
    authWindow.webContents.on('will-redirect', (event, targetUrl) => {
      handleCallback(targetUrl);
    });

    authWindow.webContents.on('did-navigate', (event, targetUrl) => {
      handleCallback(targetUrl);
    });

    authWindow.on('closed', () => {
      authWindow = null;
    });
  });
}

/**
 * Devuelve un cliente autenticado (si no existe, lanza login).
 */
async function getAuthenticatedClient() {
  const client = getOAuthClient();

  if (!loadSavedCredentials()) {
    await loginWithGoogle();
  }

  // Guarda automáticamente los tokens si se renuevan
  client.on('tokens', (tokens) => {
    if (tokens.refresh_token || tokens.access_token) {
      store.set('google_token', { ...store.get('google_token'), ...tokens });
    }
  });

  return client;
}

/**
 * Cierra sesión borrando el token almacenado.
 */
function logoutGoogle() {
  store.delete('google_token');
}

/**
 * Obtiene eventos del calendario (método adicional opcional).
 */
async function getCalendarEvents() {
  const client = await getAuthenticatedClient();
  const calendar = google.calendar({ version: 'v3', auth: client });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items.map(event => ({
    summary: event.summary || "(Sin título)",
    start: event.start.dateTime || event.start.date,
  }));
}

module.exports = {
  getAuthenticatedClient,
  loginWithGoogle,
  logoutGoogle,
  getCalendarEvents,
};
