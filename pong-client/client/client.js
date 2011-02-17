YUI.add("client", function (Y) {
  var Client = Y.namespace("Pong").Client = Y.Base.create(
    "Client", Y.Widget, [],
    {
      // Shorthands (these are stored in _options anyway)
      _connectionHandler: null,
      _simulation: null,
      _renderer: null,
      _controlsStack: [],
      _lastKey: null,
      // Interface
      initializer: function(){
	this._initEvents();
	this._initConnectionHandler();
	this._initSimulation();
	this._initRenderer();
      },
      connect: function(url){
	this._connectionHandler.connect(url);
      },
      authenticate: function(authData){
	this._connectionHandler.authenticate(authData);
      },
      requestGame: function(playerID){
	// if playerID is undefined, then random game is requested.
	this._connectionHandler.requestGame(playerID);
      },
      quitGame: function(){
	
      },
      playerMove: function(moveData){
	// Move data should be one of strings: "up", "down", "stop"
	this._connectionHandler.playerMove(moveData);
	this._simulation.playerMove(moveData);
      },
      log: function(msg, type){
	if(! type){
	  type = "debug";
	}
	Y.log(msg, type, "client");
      },
      renderUI: function(){
	this._renderer.set("contentBox", this.get("contentBox"));
      },
      bindUI: function(){
	
      },
      // internals
      _initEvents: function(){
	var that = this;
	// Binding other events - glueing everything together
	this.on("server:snapshot", function(evt, snapshot){
	  that._simulation.addSnapshot(snapshot);
	});
	this.on("server:gameStart", function(evt, count){
	  if(count == 1){
	    that.log("START");
	    that._simulation.start();
	  } else {
	    this.log("Start in: " + count, "info");
	  }
	});
	this.on("server:connectionClosed", function(evt){
	  that._simulation.stop();
	  that.log("stopping simulation");
	});
	this.on("simulation:step", function(evt, snapshot){
	  this._renderer.renderFrame(snapshot);
	});
	this.on("server:gameSimulationData", function(evt, data){
	  this._simulation.set("simulationData", data);
	  this._renderer.set("simulationData", data);
	});
	this.on("server:playerData", function(evt, playerData){
	  this._simulation.set("player", playerData);
	});
	Y.one(document).on("keydown", this._onDocumentKeyDown, this);
	Y.one(document).on("keyup", this._onDocumentKeyUp, this);
      },
      _initConnectionHandler: function(){
	var ch = this._connectionHandler = new Y.Pong.ConnectionHandler();
	ch.addTarget(this);
      },
      _initSimulation: function(){
	var sim = this._simulation = new Y.Pong.Simulation();
	sim.addTarget(this);
      },
      _initRenderer: function(){
	var r = this._renderer = new Y.Pong.Renderer();
	r.addTarget(this);
      },
      _onDocumentKeyDown: function (evt) {
	if(this._lastKey == evt.keyCode){
	  return;
	}
	this._lastKey = evt.keyCode;
	Y.each(this.get("controls.movementKeys"), function(dir){
	  if(this.get("controls.bindings")[dir] == evt.keyCode){
	    this._controlsStack.unshift(dir);
	    this.playerMove(dir);
	  }
	}, this);
	// this.log("on down " + this._controlsStack.toString());
      },
      _onDocumentKeyUp: function(evt){
	this._lastKey = null;
	var move;
	Y.each(this.get("controls.movementKeys"), function(dir, i){
	  if(this.get("controls.bindings")[dir] == evt.keyCode){
	    move = dir;
	  }
	}, this);
	for(var i in this._controlsStack){
	  if(this._controlsStack[i] == move){
	    this._controlsStack.splice(i);
	    break;
	  }
	}
	// this.log("on up: " + this._controlsStack.toString());
	if(this._controlsStack.length){
	  this.playerMove(this._controlsStack[0]);
	} else {
	  this.playerMove("stop");
	}
      },
      _commandNotImplemented: function(cmd, data){
	
      }
    },
    {
      ATTRS: {
	ingame: {
          validator: Y.Lang.isBoolean,
	  value: false,
	  readOnly: true
	},
	controls: {
	  value: {
	    movementKeys: ["up", "down"],
	    bindings: {
	      up: 87,
	      down: 83
	    }
	  }
	}
      }
    }
  );
  Y.log("module loaded", "debug", "client");
}, "0", { requires: ["connectionhandler", "simulation", "renderer"] });
