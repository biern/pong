YUI.add("simulation", function (Y) {
  var prefix = "simulation:";
  var Simulation = Y.namespace("Pong").Simulation =
    Y.Base.create(
    "Simulation", Y.Base, [],
    {
      _stopSimulator: false,
      _snapshot: null,
      _simulated: null,
      // Interface
      initializer: function(){
	this._initEvents();
      },
      start: function(){
	var that = this;
	this._snapshot = new Y.Pong.Snapshot(
	  { timestamp: (new Date).getTime() },
	  this.get('PaddleCls'),
	  this.get('BallCls'));
	var simulator = function(){
	  that.set("running", true);
	  if(! that.get("paused")){
	    that._simulate();
	  }
	  if(that._stopSimulator){
	    that._stopSimulator = false;
	    that._set("running", false);
	  } else {
	    setTimeout(simulator, parseInt(that.get("simulationData.interval")));
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
	  this.get('PaddleCls'),
	  this.get('BallCls'));
	this._simulated = new Y.Pong.Snapshot();
	this._simulated.setData(
	  snapshotData,
	  this.get('PaddleCls'),
	  this.get('BallCls'));
	this._simulated.set('origin', this._snapshot);
      },
      log: function(msg, type){
	if(! type){
	  type = "debug";
	}
	Y.log(msg, type, "simulation");
      },
      // internals
      _simulate: function(){
	// Quit if no temporary snapshot is out there
	if(! this._simulated){
	  return;
	}
	var simulated = this._simulated,
	  timeDelta = ((new Date).getTime() - simulated.get("timestamp")),
	  framesDelta = parseInt(timeDelta / this.get("simulationData.interval"));
	this._simulateSnapshotFor(simulated, framesDelta);
	simulated.set("timestamp", (new Date).getTime());
	simulated.set('originFramesDelta',
		      simulated.get('originFramesDelta') + framesDelta);
	this.fire(prefix + "step", {}, simulated);
      },
      _simulateSnapshotFor: function(snapshot, frames){
	for(var i = 0; i < frames; i++){
	  this._simulationCycle(snapshot);
	}
	return snapshot;
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
	  switch(paddle.get('moving')){
	  case "up":
	    paddle.set('y', paddle.get('y') - paddle.get('speed'));
	    if (paddle.get('y') < 0){
	      paddle.get('y') = 0;
	    }
	    break;
	  case "down":
	    paddle.set('y', paddle.get('y') + paddle.speed);
	    if (paddle.get('y') + paddle.get('h') > hMax){
	      paddle.set('y', hMax - paddle.get('h'));
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
	  ball.set('x', ball.get('x') +
		   ball.get('speed') * Math.sin(ball.get('dir')));
	  ball.set('y', ball.get('y') -
		   ball.get('speed') * Math.cos(ball.get('dir')));
	  if (ball.get('y') + 2*ball.get('r') >= hMax){
	    ball.set('dir', Math.PI - ball.get('dir'));
	  } else if (ball.get('y') <= 0){
	    ball.set('dir', Math.PI - ball.get('dir'));	  
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
	PaddleCls: {
	  value: Y.Pong.Paddle
	},
	BallCls: {
	  value: Y.Pong.Ball
	},
	simulationData: {
	  value: {
	    interval: 1000 / 66,
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
  Y.log("module loaded", "debug", "simulation");
}, "0", { requires: ["utils", "snapshot", "paddle", "ball"] });
