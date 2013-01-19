var server = require('http').createServer(handler)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , dronestream = require("dronestream");

server.listen(1337);
dronestream.listen(server); 

function handler (req, res) {
  fs.readFile(__dirname + '/public/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('drone', function (data) {
    console.log(data);
    if(data.action == 'land'){
      console.log('land')
    } else if(data.action == 'takeoff'){
      console.log('takeoff')
    }
  });
});