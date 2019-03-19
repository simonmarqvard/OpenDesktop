const express = require("express");
const bodyParser = require("body-parser");
const server = express();
const socket = require("socket.io");
const ss = require("socket.io-stream");
const http = require("http");
const path = require("path");
// let ss = require("socket.io-stream");

server.use("/", express.static("public"));
server.use(bodyParser.json());

let httpServer = http.createServer(server);

httpServer.listen(8080, () => {
  console.log("listening on 8080");
});

var io = socket(httpServer);
let arrayOfUsers = [];
let user;

io.sockets.on("connection", socket => {
  console.log("we have a connection: " + socket.id);

  socket.on("newUser", userData => {
    console.log(userData);
    console.log("server new user");
    let user = {
      id: socket.id,
      username: userData.name,
      files: userData.files
    };
    console.log(userData);
    arrayOfUsers.push(user);
    io.emit("updateUsers", arrayOfUsers);
  });

  //does this work? if/else statement
  socket.on("fileTransferReq", data => {
    console.log(data);
    const user = arrayOfUsers.find(user => user.id === data.to);
    //hvis user har filen som bliver sendt så afbryd
    const dataFile = user.files.find(obj => data.file === obj);
    if (dataFile) {
      console.log("file exists");
    } else {
      user.files.push(data.file);
      io.emit("updateUsers", arrayOfUsers);
      let fromUser = data.from;
      io.to(fromUser).emit("reqStreamFromUser", data);
    }
    // user.files.push(data.file);
    // io.emit("updateUsers", arrayOfUsers);
    // let fromUser = data.from;
    // io.to(fromUser).emit("reqStreamFromUser", data);
  });

  ss(socket).on("streamToServer", (stream, data) => {
    const outgoingstream = ss.createStream();
    const userToReceiveData = data.receiver;
    const connection = io.sockets.connected[userToReceiveData];

    ss(connection).emit("fileStreamFromServer", outgoingstream, data);
    stream.pipe(outgoingstream);
  });

  socket.on("disconnect", user => {
    console.log("user disconnected" + socket.id);
    for (let i = 0; i < arrayOfUsers.length; i++) {
      if (arrayOfUsers[i].id == socket.id) {
        arrayOfUsers.splice(i, 1);
      }
      console.log(arrayOfUsers);
      io.sockets.emit("updateUsers", arrayOfUsers);
    }
  });
});
