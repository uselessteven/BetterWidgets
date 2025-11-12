const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const {
	getAuthenticatedClient,
	loginWithGoogle,
	logoutGoogle
} = require(path.join(__dirname, "src/auth/googleAuth.js"));

let win;

function createWindow() {
	win = new BrowserWindow({
		width: 1024,
		height: 600,
		resizable: false,
		maximizable: false,
		fullscreenable: false,
		frame: false,
		icon: path.join(__dirname, "assets/icon.png"),
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	win.removeMenu();
	win.loadFile("src/index.html");
	// win.webContents.openDevTools();

	ipcMain.on("minimize-window", () => win.minimize());
	ipcMain.on("close-window", () => win.close());
	ipcMain.on("load-page", (event, page) => win.loadFile(page));

	ipcMain.on("capture-screenshot", async () => {
		try {
			const screenshotPath = await captureScreenshot();
			win.webContents.send("screenshot-saved", screenshotPath);
		} catch (error) {
			console.error("Error capturing screenshot:", error);
		}
	});

	win.webContents.on("did-finish-load", () => {
		const cursorPath = path.join(__dirname, "assets", "cursor.png").replace(/\\/g, "/");
		const loadingCursorPath = path.join(__dirname, "assets", "cursor-loading.png").replace(/\\/g, "/");

		win.webContents.insertCSS(`
			html, body, * {
				cursor: url("file://${cursorPath}") 0 0, auto !important;
			}
			a, button, [role="button"], .clickable, *:hover {
				cursor: url("file://${cursorPath}") 0 0, pointer !important;
			}
			body.waiting, body.loading, *[data-loading="true"], .loading {
				cursor: url("file://${loadingCursorPath}") 0 0, wait !important;
			}
			img {
				user-select: none;
				-webkit-user-drag: none;
				pointer-events: auto;
			}
		`);
	});
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	// 🖼️ Captura de pantalla
	ipcMain.handle("take-screenshot", async () => {
		const image = await win.webContents.capturePage();
		const screenshotPath = path.join(app.getPath("desktop"), `screenshot-${Date.now()}.png`);
		fs.writeFileSync(screenshotPath, image.toPNG());
		return screenshotPath;
	});

	// 🔐 Login con Google
	ipcMain.handle("google-login", async () => {
		try {
			const client = await getAuthenticatedClient();
			return { success: true };
		} catch (err) {
			console.error("Google login failed:", err);
			return { success: false, error: err.message };
		}
	});

	// 🚪 Logout de Google (ahora también notifica al render)
	ipcMain.handle("google-logout", async () => {
		try {
			logoutGoogle();
			console.log("👋 Sesión de Google cerrada correctamente.");
			if (win && win.webContents) {
				win.webContents.send("google-logged-out");
			}
			return { success: true };
		} catch (err) {
			console.error("❌ Error al cerrar sesión:", err);
			return { success: false, error: err.message };
		}
	});

	// 📅 Obtener eventos del calendario
	ipcMain.handle("get-calendar-events", async () => {
		try {
			const { getCalendarEvents } = require(path.join(__dirname, "src/auth/googleAuth.js"));
			const events = await getCalendarEvents();
			console.log("EVENTOS OBTENIDOS DESDE GOOGLE CALENDAR:", events);
			return { ok: true, events };
		} catch (err) {
			console.error("Error al obtener eventos de Google Calendar:", err);
			return { ok: false, error: err.message };
		}
	});
});

function captureScreenshot() {
	return new Promise((resolve, reject) => {
		win.capturePage()
			.then(image => {
				const filePath = path.join(app.getPath("downloads"), "screenshot.png");
				fs.writeFileSync(filePath, image.toPNG());
				resolve(filePath);
			})
			.catch(err => {
				console.error("Error capturing the application window:", err);
				reject("Error capturing the application window");
			});
	});
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
