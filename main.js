const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");

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
	//win.loadFile("src/bouquete/chooseFlowers.html");
	 win.loadFile("src/index.html");
	// win.webContents.openDevTools();
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

	ipcMain.handle("take-screenshot", async () => {
		const image = await win.webContents.capturePage();
		const screenshotPath = path.join(app.getPath("desktop"), `screenshot-${Date.now()}.png`);
		fs.writeFileSync(screenshotPath, image.toPNG());
		return screenshotPath;
	});
});

function captureScreenshot() {
	return new Promise((resolve, reject) => {
		win.capturePage()
			.then(image => {
				const filePath = path.join(app.getPath('downloads'), 'screenshot.png');
				fs.writeFileSync(filePath, image.toPNG());
				resolve(filePath);
			})
			.catch(err => {
				console.error('Error capturing the application window:', err);
				reject('Error capturing the application window');
			});
	});
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});