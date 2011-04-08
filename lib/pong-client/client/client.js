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
      log: function(msg, type){
	if(! type){
	  type = "debug";
	}
	Y.log(msg, type, "client");
      },
      send: function(type, data){
	this._connectionHandler.send(type, data);
      },
      
      renderUI: function(){
	
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
	Y.each(['lobbyPlayerJoined', 'lobbyPlayerLeft', 'lobbyPlayerUpdated',
		'lobbyChatMessage'],
	       function(event){
		 this._connectionHandler.before(event, function(data){
		   if(data.player){
		     data.player = new Y.Pong.Player(data.player);
		   }
		   return data;
		 });
	       }, this);
	this._connectionHandler.before('lobbyPlayersList', function(data){
	  var players = [];
	  Y.each(data.players, function(p){
	    players.push(new Y.Pong.Player(p));
	  });
	  data.players = players;
	  return data;
	});
      }
    },
    {
      ATTRS: {
	inGame: {
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
}, "0", { requires: ["connectionhandler", "player"] });
