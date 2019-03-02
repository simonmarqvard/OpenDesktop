const { ipcRenderer } = require("electron");

//connect to socket server
//click button to send req to server
//if request from server send IPC from renderer to main
//get files from main and send to renderer
//send from renderer to server
//

//elements

console.log("this is renderer");

function addElement(text) {
  let newDiv = document.createElement("div");
  newDiv.setAttribute("class", "fileElement");
  let newContent = document.createTextNode(text);
  newDiv.appendChild(newContent);

  let listOfFiles = document.getElementById("files");
  listOfFiles.appendChild(newDiv);
}

//socket
let socket = io("http://localhost:8080");

//connect to server
socket.on("connect", () => {
  console.log("you connected to socket");
});

//on buttonPress emit to server
let button = document.getElementById("addFiles");
button.addEventListener("click", () => {
  console.log("sending data");
  socket.emit("getFiles");
});

//when asking for files send
socket.on("fileReq", () => {
  console.log("A FILE IS REQUESTED");
  ipcRenderer.send("channel1", "This is sent to main");
});

ipcRenderer.on("channel1", (e, args) => {
  // console.log(args);
  socket.emit("returnfrommain", args);
});

socket.on("finalDestination", data => {
  let elements = JSON.parse(data).files;
  elements.forEach(element => addElement(element));
});
