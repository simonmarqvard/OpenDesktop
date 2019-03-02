const {
  BrowserWindow
} = require('electron')

//hvad gør denne?
// exports.win

exports.createWindow = () => {
  // Create the browser window.
  this.win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Open the DevTools.
  this.win.webContents.openDevTools()

  // and load the index.html of the app.
  this.win.loadURL(`file://${__dirname}/renderer/index.html`)


  // Emitted when the window is closed.
  this.win.on('closed', () => {
    this.win = null
  })
}