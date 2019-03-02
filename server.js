let express = require("express");
let bodyParser = require("body-parser");
let server = express();
var socket = require("socket.io");
var http = require("http");

server.use("/", express.static("public"));
server.use(bodyParser.json());

let httpServer = http.createServer(server);

httpServer.listen(8080, () => {
  console.log("listening on 8080");
});

var io = socket(httpServer);

let members = 0;

io.sockets.on("connection", socket => {
  console.log("we have a connection: " + socket.id);
  members++;
  console.log(members);

  socket.on("getFiles", data => {
    socket.broadcast.emit("fileReq");
  });

  socket.on("returnfrommain", data => {
    console.log("this is coming back from others pc main : " + data);
    socket.broadcast.emit("finalDestination", data);
  });

  socket.on("disconnect", socket => {
    console.log("user disconnected");
    members--;
    console.log(members);
  });
});
