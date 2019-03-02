// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const os = require("os");

let mainWindow = require("./browserWindow.js");

require("electron-reload")(__dirname);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  mainWindow.createWindow();
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
  if (mainWindow === null) mainWindow.createWindow();
});

const testfolder = `${os.homedir}/Desktop/`;

ipcMain.on("channel1", (e, args) => {
  fs.readdir(testfolder, (err, files) => {
    e.sender.send(
      "channel1",
      JSON.stringify({
        files: files
      })
    );
  });
});
