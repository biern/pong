YUI.add("client", function (Y) {
  var Client = Y.namespace("Pong").Client = Y.Base.create(
    "Client", Y.Widget, [],
    {
      _connectionHandler: null,
      _simulation: null,
      _renderer: null,
      // Interface
      initializer: function(){
	this._publishEvents();
	this._initConnectionHandler();
	this._initSimulation();
	this._initRenderer();
	this._initInputHandlers();
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
      _publishEvents: function(){
	var eventNames = this.get('eventNames');
	for(var i in eventNames){
	  this.publish(eventNames[i], {
	    broadcast: 0,
	    bubbles: true,
	    emitFacade: true
	  });
	}
      },
      _initConnectionHandler: function(){
	var ch = this._connectionHandler = new Y.Pong.ConnectionHandler();
	ch.addTarget(this);
	this._bindConnectionHandler();
      },
      _bindConnectionHandler: function(){
	// Callbacks code is temporary
	this.on("server:snapshot", function(evt, snapshot){
	  this._simulation.addSnapshot(snapshot);
	});
	this.on("server:gameStartCount", function(evt, count){
	  this._gameMessage("Start in: " + count);
	});
	this.on("server:gameNewRound", function(evt){
	  this._gameMessage("New round");
	  this._onGameStarted();
	});
	this.on("server:connectionClosed", function(evt){
	  this._onGameStopped();
	});
	this.on("server:gameSimulationData", function(evt, data){
	  this._simulation.set("simulationData", data);
	  this._renderer.set("simulationData", data);
	});
	this.on("server:playerData", function(evt, playerData){
	  this._simulation.set("player", playerData);
	});
	this.on("server:gameRivalLeft", function(evt, rival){
	  this._gameMessage("Rival left");
	  this._onGameStopped();
	});
	this.on("server:gameFinished", function(){
	  this._gameMessage("Game finished");
	  this._onGameStopped();
	});
      },
      _initSimulation: function(){
	var sim = this._simulation = new Y.Pong.Simulation();
	sim.addTarget(this);
	this._bindSimulation();
      },
      _bindSimulation: function(){
	this.on("simulation:step", function(evt, snapshot){
	  this._renderer.renderFrame(snapshot);
	});
      },
      _initRenderer: function(){
	var r = this._renderer = new Y.Pong.Renderer();
	r.addTarget(this);
      },
      _initInputHandlers: function(){
	var k = new Y.Pong.KeyboardHandler({
	  node: Y.one(document)
	});
	k.addTarget(this);
	this._bindInputHandlers();
      },
      _bindInputHandlers: function(){
	this.on("input:move", function(evt, moveData){
	  this.playerMove(moveData);
	});
      },
      _commandNotImplemented: function(cmd, data){
	
      },
      _onGameStarted: function(){
	if(!this.get('ingame')){
	  this._set('ingame', true);
	  this._simulation.start();
	  this.fire("gameStarted");
	}
      },
      _onGameStopped: function(){
	if(this.get('ingame')){
	  this._set('ingame', false);
	  this._simulation.stop();
	  this._renderer.clear();
	  this.log("Game stopped");
	  this.fire("gameStopped");
	}
      },
      _gameMessage: function(text){
	this.fire("gameMessage", {}, text);
      }
    },
    {
      ATTRS: {
	ingame: {
          validator: Y.Lang.isBoolean,
	  value: false,
	  readOnly: true
	},
	eventNames: {
	  value: ['gameMessage', 'gameStopped', 'gameStarted'],
	  readOnly: true
	}
      }
    }
  );
  Y.log("module loaded", "debug", "client");
}, "0", { requires: ["connectionhandler", "simulation", "renderer",
		     "keyboardhandler"] });
