var server = require('http').createServer(handler)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , arDrone = require('ar-drone')
  , dronestream = require("dronestream");

io.set('log level', 0)
var droneClient  = arDrone.createClient();

server.listen(1337);
dronestream.listen(server); 

function handler (req, res) {
  var path = '';
  if(req.url == '/jquery.min.js'){
    path =  '/public/jquery.min.js';
  } else{
    path = '/public/index.html';
  }
    fs.readFile(__dirname + path,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + path);
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('drone', function (data) {
    if(!data.args){
      data.args = [];
    }
    if(data.action && droneClient[data.action]){
      console.log(data.action)
      console.log(data.args)

      droneClient[data.action](data.args[0], data.args[1]);
    }
  });
});
