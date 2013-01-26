#!/usr/bin/env nodejs

var server = require('http').createServer(handler)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , arDrone = require('ar-drone')
//  , dronestream = require('dronestream')
  , Joystick = require('joystick');

io.set('log level', 0)
var droneClient  = arDrone.createClient();
var joystick = new Joystick(0, 3500, 350);

server.listen(1337);
//dronestream.listen(server); 

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

      try{
        droneClient[data.action](data.args[0], data.args[1]);
      } catch(err){
        console.log(err);
      }
    }
  });
});

joystick.on('button', function(evt, foo){
  var pressed = false;
  if(evt.value == 1){
    pressed = true
  }

  if(evt.number == 0){
    joy.secondary = pressed;
    joy.exec();
  } else if(evt.number == 1 && evt.value){
    if(joy.started){
      joy.started = false;
      console.log('land')
    } else {
      joy.started = true;
      console.log('start')
    }
  }

});

joystick.on('axis', function(evt){
  var secondary = joy.secondary;
  if(evt.number == 1){
    joy.x = joy.grade(evt.value)
    if(evt.value > 0){
      joy.typeX = 'back';
    } else if(evt.value < 0){
      joy.typeX = 'front'
    } else if(evt.value == 0){
      joy.typeX = 'stop'
    }
  } else if(evt.number == 2){
    joy.y = joy.grade(evt.value)
    if(evt.value > 0){
      joy.typeY = 'right';
    } else if(evt.value < 0){
      joy.typeY = 'left'
    } else if(evt.value == 0){
      joy.typeY = 'stop'
    }
  }

  joy.exec();
});

var joy = {
  x: 0,
  y: 0,
  started: false,
  secondary: false,
  grade: function(value){
    if(value < 0){
      value = value * -1;
    }

    return percentage = value / 35000;
  },
  updateMode: function(){
    if(this.secondary){
      if(this.typeX == 'front'){
        this.typeX = 'up';
      } else if(this.typeX == 'back'){
        this.typeX = 'down'
      }

      if(this.typeY == 'right'){
        this.typeY = 'clockwise'
      } else if(this.typeY == 'left'){
        this.typeY = 'counterClockwise'
      }
    } else{
      if(this.typeX == 'up'){
        this.typeX = 'front';
      } else if(this.typeX == 'down'){
        this.typeX = 'back';
      }

      if(this.typeY == 'clockwise'){
        this.typeY = 'right'
      } else if(this.typeY == 'counterClockwise'){
        this.typeY = 'left';
      }
    }
  },
  exec: function(){
    this.updateMode();
    if(joy.x > joy.y){
      console.log(joy.x + ' ' + joy.typeX)
    } else if(joy.y > joy.x){
      console.log(joy.y + ' ' + joy.typeY)
    } else if(joy.y == 0 && joy.x == 0){
      console.log('stop')
    } else{
      console.log('please choose something..')
    }
  }

}