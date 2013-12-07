#!/usr/bin/env nodejs
var arDrone      = require('ar-drone');
var Joystick     = require('joystick');
var mapping      = require('./mapping.json');

var droneClient  = arDrone.createClient();

var joy = {
	started: false,
	duration: 1000,
	precision: 3500,
	execute: function(action, payload, extra) {
		console.log(action, payload);
		try{
			droneClient[action](payload, extra);
		} catch(err){
			console.log(err);
		}
	},
	executeMove: function(evt, map) {
		var action = null;
		if(evt.value > 0) {
			action = map.positive;
		} else if(evt.value < 0){
			action = map.negative;
		} else if(evt.value === 0) {
			action = 'stop';
		}
		speed = this.grade(evt.value);
		this.execute(action, speed);
	},
	handleButton: function(evt) {
		joy.handleEvent(evt, 'buttons');
	},
	handleStick: function(evt) {
		joy.handleEvent(evt, 'axis');
	},
	handleEvent: function(evt, type) {
		var scope = mapping[type];
		var found = false;
		for(var i = 0; i <scope.length; i++) {
			var single = scope[i];
			if(evt.number === single.number) {
				found = true;
				if(type == 'axis') {
					this.executeMove(evt, single);
				} else if(this[single.action]) {
					
					if(evt.value === 1) {
						this[single.action](evt, single.payload);
					}
				} else{
					console.log(single.action + ' did not exist');
				}
			}
		}
		if(!found) {
			console.log(evt.number);
		}
	},
	toggleStart: function() {
		if(this.started) {
			this.execute('land');
		} else {
			this.execute('takeoff');
		}
		this.started = !this.started;
	},
	exec: function(evt, type) {
		this.execute(type);
	},
	animate: function(evt, type) {
		this.execute('animate', type, this.duration);
	},
	calibrate: function() {
		this.execute('calibrate', 0);
	},
	grade: function(value){
		return Math.abs(value) / this.precision;
	}
};

var stick        = new Joystick(0, joy.precision, 350);
stick.on('button', joy.handleButton);
stick.on('axis', joy.handleStick);
