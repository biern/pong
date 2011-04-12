YUI.add("client", function (Y) {
  var Client = Y.namespace("Pong").Client = Y.Base.create(
    "Client", Y.Base, [],
    {
      _connectionHandler: null,
      // Interface
      initializer: function(){
	this._initConnectionHandler();
      },
      connect: function(url){
	this._connectionHandler.connect(url);
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
      // internals
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
	
      }
    }
  );
}, "0", { requires: ["base", "connectionhandler", "player"] });
