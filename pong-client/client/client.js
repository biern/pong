YUI.add("client", function (Y) {
  var Client = Y.namespace("Pong").Client = Y.Base.create(
    "Client", Y.Base, [],
    {
      // Shorthands (these are stored in _options anyway)
      _connectionHandler: null,
      _simulation: null,
      // Interface
      initializer: function(){
	this._initEvents();
	this._initConnectionHandler();
	this._initSimulation();
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
      // Events
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
	this.on("simulation:step", function(evt, snapshot){
	  var ball = snapshot.getBalls()[0];
	  if(ball){
	    that.log(ball.get('x'));
	  }
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
}, "0", { requires: ["connectionhandler", "simulation"] });
