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

io.sockets.on("connection", socket => {
  console.log("we have a connection" + socket.id);
});
