YUI.add("simulation", function (Y) {
  var prefix = "simulation:";
  var Simulation = Y.namespace("Pong").Simulation =
    Y.Base.create(
    "Simulation", Y.Base, [],
    {
      _options: {
	PaddleCls: Y.Pong.Paddle,
	BallCls: Y.Pong.Ball
      },
      _stopSimulator: false,
      _snapshot: null,
      // Interface
      initializer: function(options){
	this._initEvents();
	this.initOptions(this._options, options);
      },
      start: function(){
	var that = this;
	this._snapshot = new Y.Pong.Snapshot(
	  { timestamp: (new Date).getTime() },
	  this._options.PaddleCls,
	  this._options.BallCls);
	var simulator = function(){
	  that.set("running", true);
	  if(! that.get("paused")){
	    that._simulate();
	  }
	  if(that._stopSimulator){
	    that._stopSimulator = false;
	    that._set("running", false);
	  } else {
	    setTimeout(simulator, parseInt(1000 / that.get("simulationData.fps")));
	  }
	};
	simulator();
      },
      stop: function(){
	this._stopSimulator = true;
      },
      pause: function(){
	
      },
      resume: function(){

      },
      addSnapshot: function(snapshotData){
	this._snapshot = new Y.Pong.Snapshot();
	this._snapshot.setData(
	  snapshotData,
	  this._options.PaddleCls,
	  this._options.BallCls);

      },
      log: function(msg, type){
	if(! type){
	  type = "debug";
	}
	Y.log(msg, type, "simulation");
      },
      // internals
      _simulate: function(){
	var snapshot = this._getLastSnapshot();
	var timeDelta = ((new Date).getTime() - snapshot.get('timestamp')) * 2;
	var frameDelta = parseInt(timeDelta / this._fps);
	this.fire(prefix + "step", {},
		  this._getSnapshotAfter(snapshot, frames));
      },
      _getLastSnapshot: function(){
	return this._snapshot;
      },
      _getSnapshotAfter: function(snapshot, frames){
	var predicted = snapshot.copy();
	for(var i = 0; i < frames; i++){
	  this._simulationCycle(predicted);
	}
	return predicted;
      },
      _simulationCycle: function(snapshot){
	this._simulatePaddles(snapshot);
	this._simulateBalls(snapshot);
      },
      _simulatePaddles: function(snapshot){
	var hMax = this.get("simulationData.board.h");
	var paddles = snapshot.getPaddles();
	for(var key in paddles){
	  var paddle = paddles[key];
	  switch(paddle.moving){
	  case "up":
	    paddle.y -= paddle.speed;
	    if (paddle.y < 0){
	      paddle.y = 0;
	    }
	    break;
	  case "down":
	    paddle.y += paddle.speed;
	    if (paddle.y + paddle.h > hMax){
	      paddle.y = hMax - paddle.h;
	    }
	    break;
	  }
	}
      },
      _simulateBalls: function(snapshot){
	var hMax = this.get("simulationData.board.h");
	var balls = snapshot.getBalls();
	for (var key in balls){
	  var ball = balls[key];
	  ball.x += ball.speed * Math.sin(ball.dir);
	  ball.y -= ball.speed * Math.cos(ball.dir);
	  if (ball.y + 2*ball.r >= hMax){
	    ball.dir = Math.PI - ball.dir;
	  } else if (ball.y <= 0){
	    ball.dir = Math.PI - ball.dir;	  
	  }
	}
      },
      _initEvents: function(){
	// Publishing
	this.publish(prefix + ":step", {
	  emitFacade: true,
	  bubbles: true,
	  prefix: prefix
	});
      }
    },
    {
      ATTRS: {
	simulationData: {
	  value: {
	    fps: 30,
	    board: {
	      'h': 800,
	      'w': 600
	    }
	  }
	},
	running: {
	  value: false,
	  readonly: true
	},
	paused: {
	  value: false,
	  readonly: true
	}
      }
    }
  );
  Y.augment(Simulation, Y.Pong.utils.ObjectWithOptions());
  Y.log("module loaded", "debug", "simulation");
}, "0", { requires: ["utils", "snapshot", "paddle", "ball"] });
