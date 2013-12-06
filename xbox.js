#!/usr/bin/env nodejs
var arDrone  = require('ar-drone');
var Joystick = require('joystick');
var mapping  = require('./mapping.json');

var stick        = new Joystick(0, 3500, 350);
var droneClient  = arDrone.createClient();

function handleButton(evt) {
	handleEvent(evt, 'buttons');
}

function handleStick(evt) {
	handleEvent(evt, 'axis');
}

function handleEvent(evt, type) {
	var scope = mapping[type];
	var found = false;
	for(var i = 0; i <scope.length; i++) {
		var single = scope[i];
		if(evt.number === single.number) {
			found = true;

			if(type == 'axis') {
				executeMove(evt, single);
			} else if(joy[single.action]) {
				
				if(evt.value === 1) {
					joy[single.action](evt, single.payload);
				}
			} else{
				console.log(single.action + ' did not exist');
			}
		}
	}

	if(!found) {
		console.log(evt.number);
	}
}

function executeMove(evt, map) {
	var func = null;
	if(evt.value >= 0) {
		func = map.positive;
	} else if(evt.value < 0){
		func = map.negative;
	}

	speed = joy.grade(evt.value);
	execute(func, speed);
}

function execute(func, payload, extra) {
	console.log(func, payload);
	try{
		droneClient[func](payload, extra);
	} catch(err){
		console.log(err);
	}
}

stick.on('button', handleButton);
stick.on('axis', handleStick);

var joy = {
	started: false,
	duration: 1000,
	toggleStart: function() {
		if(this.started) {
			execute('land');
		} else {
			execute('takeoff');
		}

		this.started = !this.started;
	},
	exec: function(evt, type) {
		execute(type);
	},
	animate: function(evt, type) {
		execute('animate', type, this.duration);
	},
	calibrate: function() {
		execute('calibrate', 0);
	},
	grade: function(value){
		if(value < 0){
			value = value * -1;
		}

		return value / 35000;
	}
};