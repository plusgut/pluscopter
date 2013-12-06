#!/usr/bin/env nodejs
var arDrone  = require('ar-drone');
var Joystick = require('joystick');
var mapping  = require('./mapping.json');

var stick = new Joystick(0, 3500, 350);



function handleButton(evt) {
	handleEvent(evt, 'buttons');
}

function handleStick(evt) {
	handleEvent(evt, 'axis');
}

function handleEvent(evt, type) {
	var scope = mapping[type];
	for(var i = 0; i <scope.length; i++) {
		var single = scope[i];
		if(evt.number === single.number) {
			if(type == 'axis') {
				executeMove(evt, single);
			} else if(joy[single.action]) {
				joy[single.action](evt);
			} else{
				console.log(single.action + ' did not exist');
			}
		}
	}
}

function executeMove(evt, map) {
	var func = null;
	if(evt.value >= 0) {
		func = map.positive;
	} else if(evt.value < 0){
		func = map.negative;
	}

	speed = '0';
	execute(func, speed);
}

function execute(func, payload) {
	console.log(func, payload);
}

stick.on('button', handleButton);
stick.on('axis', handleStick);

var joy = {
	// spin: function(evt, func, value) {
	// 	console.log(evt);
	// }
};