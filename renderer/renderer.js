const { ipcRenderer } = require("electron");
const username = require("username");
const os = require("os");
const fs = require("fs");

console.log("this is renderer");

//socket
let socket = io("http://localhost:8080");

//connect to server
socket.on("connect", () => {
  console.log("you connected to socket");
});

socket.on("getUserName", () => {
  username().then(data => socket.emit("newUserName", { data }));
});

socket.on("onlineUsers", users => {
  console.log(users);
  let container = document.getElementById("containUserAndFiles");

  let html = "";
  users.forEach((user, i) => {
    let userblock = `<div class="newComputer">
      <div class="ComputerName"> ${user.username}</div>
      <button id="btn-${i}" class="btn"> show files </button>
      <div id="cls-${i}" class="listOfFiles"> </div>
    </div>`;
    html += userblock;
  });
  container.innerHTML = html;

  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button, i) => {
    button.addEventListener("click", () => {
      console.log("you clicked button");
      console.log(users[i]);
      let list = document.getElementById(`cls-${i}`);
      const testfolder = `${os.homedir}/Desktop/`;
      fs.readdir(testfolder, (err, files) => {
        files.forEach(element => addFileElement(element, list));
      });
    });
  });
});

function addFileElement(text, list) {
  let myfiles = document.createElement("div");
  myfiles.setAttribute("class", "myfiles");
  let myContent = document.createTextNode(text);
  myfiles.appendChild(myContent);
  list.appendChild(myfiles);
}

// ******************** getting other peoples files ***************

// function addElement(text) {
//   let newDiv = document.createElement("div");
//   newDiv.setAttribute("class", "fileElement");
//   let newContent = document.createTextNode(text);
//   newDiv.appendChild(newContent);
//
//   let listOfFiles = document.getElementById("listOfFiles");
//   listOfFiles.appendChild(newDiv);
// }
//
// //on buttonPress emit to server
// let button = document.getElementById("0");
// button.addEventListener("click", () => {
//   console.log("click button 0");
//   socket.emit("getFiles");
// });
//
// //when asking for files send
// socket.on("fileReq", () => {
//   console.log("A FILE IS REQUESTED");
//   ipcRenderer.send("channel1", "This is sent to main");
// });
//
// ipcRenderer.on("channel1", (e, args) => {
//   // console.log(args);
//   socket.emit("returnfrommain", args);
// });
//
// socket.on("finalDestination", data => {
//   let elements = JSON.parse(data).files;
//   elements.forEach(element => addElement(element));
// });
