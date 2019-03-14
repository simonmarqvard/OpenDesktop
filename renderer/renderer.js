const { ipcRenderer } = require("electron");
const username = require("username");
const os = require("os");
const fs = require("fs");

//socket
const socket = io("http://localhost:8080");
const container = document.getElementById("containUserAndFiles");

//connect to server
socket.on("connect", () => {
  console.log("you connected to socket" + socket.id);
  const electronFileTestFolder = process.env.FOLDER;
  const testfolder = `${os.homedir}/Desktop/${electronFileTestFolder}`;
  console.log(testfolder);
  let files = [];
  fs.readdir(testfolder, (err, files) => {
    username().then(name =>
      socket.emit("newUser", { name: name, files: files })
    );
  });
});

socket.on("reqStreamFromUser", data => {
  console.log(data);
  const stream = ss.createStream();
  const fileToSend = data.file;
  ss(socket).emit("streamToServer", stream, {
    receiver: data.to,
    name: fileToSend
  });
  console.log(`sending ${fileToSend}`);
  const blobStream = ss.createBlobReadStream(fileToSend).pipe(stream);
});

socket.on("updateUsers", onlineUsers => {
  // console.log(onlineUsers);
  container.innerHTML = "";
  onlineUsers.forEach(user => {
    displayUser(user);
  });
  addListeners();
});

function displayUser(user) {
  // make list of files
  let fileList = "";
  user.files.sort();
  user.files.forEach(file => {
    fileList += `<div draggable="true" class="file"
    data-user=${user.id} data-filename="${file}"> ${file} </div>`;
  });

  let userblock = `<div class="user">
        <div class="username"> ${user.username} </div>
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
      let sender = curDrag.getAttribute("data-user");
      let filename = curDrag.getAttribute("data-filename");
      let receiver = e.target.getAttribute("data-user");
      console.log(`rec: ${receiver}, sender: ${sender}`);

      let fileTransfer = {
        from: sender,
        to: receiver,
        file: filename
      };
      socket.emit("fileTransferReq", fileTransfer);
    });
  });
}

ss(socket).on("fileStreamFromServer", (stream, data) => {
  console.log("I received file");
  const testfile = `${os.homedir}/Desktop/${process.env.FOLDER}/${data.name}`;
  stream.pipe(fs.createWriteStream(testfile));
});
