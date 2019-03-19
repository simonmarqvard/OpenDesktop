const io = require("socket.io-client");
const ss = require("socket.io-stream");
const fs = require("fs");
const os = require("os");
const username = require("username");

// Sockets
// ----------------------------------------------

const socket = io("http://localhost:8080");
let arrayWithoutFolders = [];

socket.on("connect", () => {
  console.log("you connected to socket" + socket.id);

  const electronFileTestFolder = process.env.FOLDER;
  const testfolder = `${os.homedir}/Desktop/${electronFileTestFolder}`;
  let files = [];

  let fileSize = [];

  fs.readdir(testfolder, (err, files) => {
    files.map(file => {
      let path = `${testfolder}/${file}`;
      const stats = fs.statSync(path);
      fileSize.push(Math.floor(stats.size / 1000));
    });

    //   fs.lstat(path, (err, stat) => {
    //     if (!stat.isDirectory()) {
    //       arrayWithoutFolders.push(file);
    //     }
    //   });
    // });
    // //How are these different?
    // console.log(files);
    // console.log(arrayWithoutFolders);
    // the one to use is files

    username().then(name => {
      socket.emit("newUser", { name: name, files: files, size: fileSize });
    });
  });
});

socket.on("updateUsers", onlineUsers => {
  console.log(onlineUsers);
  updateUsers(onlineUsers);
});

socket.on("reqStreamFromUser", data => {
  const fileToSend = data.file;
  const localFile = `${os.homedir}/Desktop/${process.env.FOLDER}/${fileToSend}`;
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
  //.split(".")[0]

  let fileList = "";
  // user.files.sort();
  user.files.forEach((file, i) => {
    if (user.size[i] === 0) {
      user.size[i] = "";
    }
    let fileblock = `<div class="filename" data-user=${user.id}>${file}</div>
                    <div class="fileInfo" data-user=${user.id}>
                      <div class="extension" data-user=${user.id}>
                      ${getFileExtension(file)} </div>
                      <div class="size" data-user=${user.id}>
                      size :  ${user.size[i]} KB </div>
                    </div>`;

    fileList += `<div draggable="true" class="file"
    data-user=${user.id} data-filename="${file}"
    data-size="${user.size[i]}"> ${fileblock} </div>`;
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
      list.classList.remove("hover");
      let sender = curDrag.getAttribute("data-user");
      let filename = curDrag.getAttribute("data-filename");
      let receiver = e.target.getAttribute("data-user");
      let size = curDrag.getAttribute("data-size");
      // console.log(`rec: ${receiver}, sender: ${sender}`);
      let fileTransfer = {
        from: sender,
        to: receiver,
        file: filename,
        size: size
      };
      socket.emit("fileTransferReq", fileTransfer);
    });
  });
}
