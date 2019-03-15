const { ipcRenderer } = require("electron");
const username = require("username");

// Sockets
// ----------------------------------------------

ipcRenderer.on("updateUsers", updateUsers);

ipcRenderer.send("browserReady");

// Functions
// ----------------------------------------------

//socket
// const socket = io("http://localhost:8080");
const container = document.getElementById("containUserAndFiles");

function updateUsers(event, onlineUsers) {
  container.innerHTML = "";
  onlineUsers.forEach(user => {
    displayUser(user);
  });
  addListeners();
}

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
      ipcRenderer.send("fileTransferReq", fileTransfer);
    });
  });
}
