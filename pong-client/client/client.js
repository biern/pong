YUI.add("client", function (Y) {
  var Client = Y.namespace("Pong").Client = Y.Base.create(
    "Client", Y.Widget, [],
    {
      // Shorthands (these are stored in _options anyway)
      _connectionHandler: null,
      _simulation: null,
      _renderer: null,
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
	  that.log("START");
	  that._simulation.start();
	});
	this.on("server:connectionClosed", function(evt){
	  that._simulation.stop();
	  that.log("stopping simulation");
	});
	this.on("simulation:step", function(evt, snapshot){
	  this._renderer.renderFrame(snapshot);
	});
	this.on("server:simulationData", function(evt, data){
	  this._simulation.set("simulationData", data);
	  this._renderer.set("simulationData", data);
	});
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
      _commandNotImplemented: function(cmd, data){
	
      }
    },
    {
      ATTRS: {
	ingame: {
          validator: Y.Lang.isBoolean,
	  value: false,
	  readOnly: true
	}
      }
    }
  );
  Y.log("module loaded", "debug", "client");
}, "0", { requires: ["connectionhandler", "simulation", "renderer"] });
