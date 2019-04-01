const { app, BrowserWindow, ipcMain, Tray } = require("electron");
let win;

require("electron-reload")(__dirname);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Open the DevTools.
  win.webContents.openDevTools();

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/renderer/index.html`);

  // Emitted when the window is closed.
  win.on("closed", () => {
    win = null;
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) win.createWindow();
});
