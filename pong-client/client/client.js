YUI.add("client", function (Y) {
  var Client = Y.namespace("Pong").Client = Y.Base.create(
    "Client", Y.Base, [],
    {
      // Shorthands (these are stored in _options anyway)
      _connectionHandler: null,
      // Default options
      _options: {
	connectionHandler: null
      },
      // Interface
      initializer: function(options){
	this._initEvents();
	this.initOptions(this._options, options);
	this._initConnectionHandler();
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
      _afterOptionsUpdate: function(evt, options, updated){
	this._connectionHandler = options.connectionHandler;
      },
      // internals
      _initEvents: function(){
	this.after("optionsUpdate", this._afterOptionsUpdate);
      },
      _initConnectionHandler: function(){
	var ch = this._connectionHandler = new Y.Pong.ConnectionHandler();
	ch.addTarget(this);
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
  Y.augment(Client, Y.Pong.utils.ObjectWithOptions());
  Y.log("module loaded", "debug", "client");
}, "0", { requires: ["connectionhandler", "utils"] });
