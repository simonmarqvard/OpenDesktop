const io = require("socket.io-client");
const ss = require("socket.io-stream");
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const os = require("os");
const username = require("username");

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
  if (mainWindow === null) mainWindow.createWindow();
});

// Sockets
// ----------------------------------------------

const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("you connected to socket" + socket.id);
});

socket.on("updateUsers", onlineUsers => {
  console.log(onlineUsers);
  win.webContents.send("updateUsers", onlineUsers);
});

socket.on("reqStreamFromUser", data => {
  const fileToSend = data.file;
  const localFile = `${os.homedir}/Desktop/${process.env.FOLDER}/${fileToSend}`;
  console.log(`sending ${fileToSend}`);

  const stream = ss.createStream();
  ss(socket).emit("streamToServer", stream, {
    receiver: data.to,
    name: fileToSend
  });

  const blobStream = fs.createReadStream(localFile).pipe(stream);

  blobStream.on("error", e => {
    console.log(e);
  });

  //show upload progress
  let size = 0;
  blobStream.on("data", function(chunk) {
    size += chunk.length;
    console.log(Math.floor((size / fileToSend.size) * 100) + "%");
  });
});

ss(socket).on("fileStreamFromServer", (stream, data) => {
  console.log("I received file");
  console.log(stream);
  const testfile = `${os.homedir}/Desktop/${process.env.FOLDER}/${data.name}`;
  stream.pipe(fs.createWriteStream(testfile));
});

// ICP
// ----------------------------------------------

let hasSentNewUser = false;

ipcMain.on("browserReady", (event, fileTransfer) => {
  if (!hasSentNewUser) {
    const electronFileTestFolder = process.env.FOLDER;
    const testfolder = `${os.homedir}/Desktop/${electronFileTestFolder}`;
    let files = [];
    fs.readdir(testfolder, (err, files) => {
      username().then(name =>
        socket.emit("newUser", { name: name, files: files })
      );
    });
    hasSentNewUser = true;
  } else {
    socket.emit("getUsers");
  }
});

ipcMain.on("fileTransferReq", (event, fileTransfer) => {
  socket.emit("fileTransferReq", fileTransfer);
});
