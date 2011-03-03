YUI.add("simulation", function (Y) {
  var prefix = "simulation:";
  var Simulation = Y.namespace("Pong").Simulation =
    Y.Base.create(
    "Simulation", Y.Base, [],
    {
      _simulationTimer: null,
      _snapshot: null,
      _simulated: null,
      // Interface
      initializer: function(){
	this._initEvents();
      },
      start: function(){
	this.stop();
	this.addSnapshot({ timestamp: (new Date).getTime() });
	this.set("running", true);
	var simulator = function(){
	  if(! this.get("paused")){
	    this._simulate();
	  }
	  // For the reasons unknown calling Y.later every time simulator is
	  // called is much faster / more accurate than setting it to periodic
	  this._simulationTimer = Y.later(
	    parseInt(this.get("simulationData.board.interval")),
	    this,
	    simulator,
	    []
	  );
	};
	simulator.apply(this);
      },
      stop: function(){
	if(this._simulationTimer){
	  this._simulationTimer.cancel();
	}
	this.set("running", false);
      },
      pause: function(){
	
      },
      resume: function(){

      },
      playerMove: function(moveData){
	var paddle = this.getPlayerPaddle();
	if(paddle){
	  paddle.set("moving", moveData);
	}
      },
      addSnapshot: function(snapshotData){
	// Save recieved snapshot
	var snapshot = this._snapshot = new Y.Pong.Snapshot();
	snapshot.setData(
	  snapshotData,
	  this.get('PaddleCls'),
	  this.get('BallCls'));
	// Create a copy of a recieved snapshot that is used for temporary
	// client side simulation
	var simulated = new Y.Pong.Snapshot();
	simulated.setData(
	  snapshotData,
	  this.get('PaddleCls'),
	  this.get('BallCls'));
	simulated.set('origin', snapshot);
	// Set paddle movement to that requested now, not one recieved from server
	if(this._simulated){
	  var paddle = simulated.getPlayerPaddle(this.get("player"));
	  var oldPaddle = this._simulated.getPlayerPaddle(this.get("player"));
	  if(paddle && oldPaddle){
	    paddle.set("moving", oldPaddle.get("moving"));
	  }
	}
	// Simulate snapshot forward to match server - client time delay
	var timeDelta = ((new Date).getTime() - simulated.get("timestamp")),
	  framesDelta = parseInt(timeDelta / this.get("simulationData.board.interval"));
	this._simulateSnapshotFor(simulated, framesDelta);
	simulated.set("timestamp", (new Date).getTime());
	simulated.set('originFramesDelta', framesDelta);
	this._simulated = simulated;
      },
      getPlayerPaddle: function(){
	var paddles = this._simulated.getPaddles();
	for(var i = 0; i < paddles.length; i++){
	  if(paddles[i].get("playerID") == this.get("player.id")){
	    return paddles[i];
	  }
	}
	return null;
      },
      log: function(msg, type){
	if(! type){
	  type = "debug";
	}
	Y.log(msg, type, "simulation");
      },
      // internals
      _simulate: function(){
	var simulated = this._simulated;
	// Quit if no temporary snapshot is out there
	if(! simulated){
	  return;
	}
	// Simulate one cycle
	this._simulateSnapshotFor(simulated, 1);
	// Set extra attributes
	simulated.set("timestamp", (new Date).getTime());
	simulated.set('originFramesDelta', simulated.get('originFramesDelta') + 1);
	// Fire simulation step event
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
	      paddle.set('y', 0);
	    }
	    break;
	  case "down":
	    paddle.set('y', paddle.get('y') + paddle.get('speed'));
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
	    board: {
	      interval: 1000 / 66,
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
	},
	player: {
	  value: {
	    id: -1
	  }
	}
      }
    }
  );
  Y.log("module loaded", "debug", "simulation");
}, "0", { requires: ["utils", "snapshot", "paddle", "ball"] });
