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
  const testfolder = `${os.homedir}/Desktop/`;
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
        <div class="listOfFiles">${fileList}</div>
      </div>`;

  container.innerHTML += userblock;
}

function addListeners() {
  let curDrag;
  const files = document.querySelectorAll(".file");
  files.forEach(file => {
    file.addEventListener("dragstart", e => {
      // change css to make it look like it's dragging
      curDrag = e.target;
    });
  });

  const lists = document.querySelectorAll(".listOfFiles");
  lists.forEach(list => {
    list.addEventListener("dragover", e => e.preventDefault());
    list.addEventListener("drop", e => {
      e.preventDefault();
      let sender = curDrag.getAttribute("data-user");
      let filename = curDrag.getAttribute("data-filename");
      let receiver = e.target.getAttribute("data-user");

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
  console.log(stream);
  console.log(data);
});
// socket.on("onlineUsers", users => {
//   console.log(users);
//   let container = document.getElementById("containUserAndFiles");
//
//   let html = "";
//   users.forEach((user, i) => {
//     let userblock = `<div class="newComputer">
//       <div class="ComputerName" id="${user.username}"> ${user.username}</div>
//       <button id="btn-${i}" class="btn"> show files </button>
//       <div id="cls-${i}" class="listOfFiles-${i}"> </div>
//     </div>`;
//     html += userblock;
//   });
//   container.innerHTML = html;
//
//   const buttons = document.querySelectorAll(".btn");
//
//   buttons.forEach((button, i, state) => {
//     state = false;
//     button.addEventListener("click", () => {
//       state = !state;
//       if (state) {
//         showFiles(i, button);
//       } else {
//         hideFiles(i, button);
//       }
//     });
//   });
// });
//
// function showFiles(i, button) {
//   console.log("showfiles");
//   button.innerHTML = "hide files";
//   const list = document.getElementById(`cls-${i}`);
//   // let userFileLocation = document.getElementById(`${user.username}`);
//   // console.log(userFileLocation);
//   const testfolder = `${os.homedir}/Desktop/`;
//   fs.readdir(testfolder, (err, files) => {
//     files.forEach((element, i) => addFileElement(element, list, i));
//   });
// }
//
// function hideFiles(i, button) {
//   console.log("hideFiles");
//   // button.innerHTML = "show";
//   button.innerHTML = "show files";
//   let list = document.getElementById(`cls-${i}`);
//   list.innerHTML = "";
// }
//
// function addFileElement(content, list, i) {
//   let columnNumber = list.id.split("-")[1];
//   let myfiles = document.createElement("div");
//   myfiles.setAttribute("class", `myfiles`);
//   myfiles.setAttribute("id", `file-${i}`);
//   myfiles.setAttribute("name", `columnNumber-${columnNumber}`);
//   myfiles.setAttribute("data-Filename", `${content}`);
//   // myfiles.setAttribute("data-orgLoc", )
//   let myContent = document.createTextNode(content);
//   myfiles.appendChild(myContent);
//   list.appendChild(myfiles);
// }
