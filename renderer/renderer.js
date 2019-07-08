const io = require("socket.io-client");
const ss = require("socket.io-stream");
const fs = require("fs");
const os = require("os");
const username = require("username");
const watch = require("node-watch");

// Sockets
// ----------------------------------------------

const socket = io("http://smj470.itp.io:8080");
//NOTE: for local testing
// const socket = io("http://localhost:8080");
let arrayWithoutFolders = [];
let filesOnly = [];
//NOTE: for local testing
// const electronFileTestFolder = process.env.FOLDER;
// const testfolder = `${os.homedir}/Desktop/${electronFileTestFolder}`;
const testfolder = `${os.homedir}/Desktop/`;
let noFolders = [];
let updateDesktop;

socket.on("connect", () => {
  console.log("you connected to socket" + socket.id);

  fs.readdir(testfolder, (err, files) => {
    files.map(file => {
      let path = `${testfolder}/${file}`;
      const directories = fs.statSync(path).isDirectory();
      if (!directories && file !== ".DS_Store" && file !== ".localized") {
        noFolders.push(file);
      }
    });
    username().then(name => {
      socket.emit("newUser", { name: name, files: noFolders });
    });
  });
});

watch(`${testfolder}`, { recursive: true }, function(evt, name) {
  console.log(evt);
  fs.readdir(testfolder, (err, files) => {
    updateDesktop = [];
    files.map(file => {
      let path = `${testfolder}/${file}`;
      const directories = fs.statSync(path).isDirectory();
      if (!directories && file !== ".DS_Store" && file !== ".localized") {
        updateDesktop.push(file);
      }
    });
    let socketId = socket.id;
    socket.emit("updateChangesToDesktop", {
      id: socketId,
      files: updateDesktop
    });
  });
});

socket.on("updateUsers", onlineUsers => {
  console.log(onlineUsers);
  updateUsers(onlineUsers);
});

socket.on("reqStreamFromUser", data => {
  const fileToSend = data.file;
  const localFile = `${os.homedir}/Desktop/${fileToSend}`;
  // const localFile = `${os.homedir}/Desktop/${process.env.FOLDER}/${fileToSend}`;
  console.log(`sending ${fileToSend}`);

  let myNotification = new Notification("Sending file", {
    body: `filename : ${fileToSend}`
  });

  const stream = ss.createStream();
  ss(socket).emit("streamToServer", stream, {
    receiver: data.to,
    name: fileToSend
  });

  const blobStream = fs.createReadStream(localFile).pipe(stream);
  console.log(blobStream, "SIMON");

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
  const testfile = `${os.homedir}/Desktop/${data.name}`;
  // const testfile = `${os.homedir}/Desktop/${process.env.FOLDER}/${data.name}`;
  stream.pipe(fs.createWriteStream(testfile));

  let myNotification = new Notification("You received file", {
    body: `filename : ${data.name}`
  });
});

// Functions
// ----------------------------------------------

const container = document.getElementById("containUserAndFiles");

function updateUsers(onlineUsers) {
  container.innerHTML = "";
  onlineUsers.forEach(user => {
    displayUser(user);
  });
  addListeners();
}

function getFileExtension(filename) {
  var a = filename.split(".");
  if (a.length === 1 || (a[0] === "" && a.length === 2)) {
    return "";
  }
  return a.pop();
}

function displayUser(user) {

  let fileList = "";
  user.files.sort();
  user.files.forEach((file, i) => {
    let fileblock = ` <div class="info" data-user=${user.id}>
                      <div class="filename" data-user=${user.id}>${file}</div>
                      </div>
                      <div class="extension" data-user=${
                        user.id
                      } data-extension='${getFileExtension(file)}'>
                      ${getFileExtension(file)}</div>
                    `;

    fileList += `<div draggable="true" class="file"
    data-user=${user.id} data-filename="${file}"
    data-size=""> ${fileblock} </div>`;
  });

  let userblock = `<div class="user">
        <div class="username"> <p>${user.username}</p> </div>
        <div class="listOfFiles" data-user="${user.id}">${fileList}</div>
      </div>`;

  container.innerHTML += userblock;
}

function addListeners() {
  let curDrag;
  const files = document.querySelectorAll(".file");

  files.forEach(file => {
    file.addEventListener("dragstart", e => {
      file.classList.add("dragOutline");
      curDrag = e.target;
    });
    file.addEventListener("dragend", e => {
      file.classList.remove("dragOutline");
    });
  });

  const lists = document.querySelectorAll(".listOfFiles");
  lists.forEach(list => {
    list.addEventListener("dragover", e => {
      e.preventDefault();
      list.classList.add("hover");
    });
    list.addEventListener("dragleave", e => {
      list.classList.remove("hover");
    });
    list.addEventListener("drop", e => {
      e.preventDefault();
      list.classList.remove("hover");
      let sender = curDrag.getAttribute("data-user");
      let filename = curDrag.getAttribute("data-filename");
      let receiver = e.target.getAttribute("data-user");
      // console.log(`rec: ${receiver}, sender: ${sender}`);
      let fileTransfer = {
        from: sender,
        to: receiver,
        file: filename
      };
      socket.emit("fileTransferReq", fileTransfer);
    });
  });
}
