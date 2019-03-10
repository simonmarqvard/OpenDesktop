let express = require("express");
let bodyParser = require("body-parser");
let server = express();
let socket = require("socket.io");
let http = require("http");
let path = require("path");
// let ss = require("socket.io-stream");

server.use("/", express.static("public"));
server.use(bodyParser.json());

let httpServer = http.createServer(server);

httpServer.listen(8080, () => {
  console.log("listening on 8080");
});

var io = socket(httpServer);

let members = 0;
let arrayOfUsers = [];
let user;

io.sockets.on("connection", socket => {
  console.log("we have a connection: " + socket.id);
  members++;
  socket.emit("getUserName");
  console.log(members);

  socket.on("newUserName", data => {
    let user = { id: socket.id, username: data.data };
    arrayOfUsers.push(user);
    console.log(arrayOfUsers);
    io.emit("onlineUsers", arrayOfUsers);
  });

  socket.on("disconnect", user => {
    console.log("user disconnected" + socket.id);
    members--;
    console.log(members);
    for (let i = 0; i < arrayOfUsers.length; i++) {
      if (arrayOfUsers[i].id == socket.id) {
        arrayOfUsers.splice(i, 1);
      }
      console.log(arrayOfUsers);
      io.sockets.emit("onlineUsers", arrayOfUsers);
    }
  });
});
