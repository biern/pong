YUI.add("connectionhandler", function (Y) {
  var prefix = "server:";
  var ConnectionHandler = Y.namespace("Pong").ConnectionHandler = Y.Base.create(
    "ConnectionHandler", Y.Base, [],
    {
      _socket: null,
      _before: {},
      // Interface
      initializer: function(){
	this._initEvents();
      },
      connect: function(url){
	this._set("url", url);
	var host = url.split(":")[0];
	var port = url.split(":")[1] || 80;
	var socket = this._socket = new io.Socket(host,
	  { port: port,
	    rememberTransport: false });
	var that = this;
	socket.on("connect", function(evt){
	  that.log("connection opened");
	  that._set("connected", true);
	  that.fire(prefix + "connectionOpened");
	});
	socket.on("disconnect", function(evt){
	  that.log("connection closed");
	  that._set("connected", false);
	  that.fire(prefix + "connectionClosed");
	});
	// TODO: is 'error' supported?
	socket.on("error", function(evt){
	  that.log("connection error");
	  that.fire(prefix + "connectionError");
	});
	// non socket.io variant
	// socket.on("message", function(evt){
	//   var response = that._getResponse(evt.data);
	//   if(response != null){
	//     that._handleResponse(response);
	//   }
	// });
	socket.on("message", function(data){
	  var response = that._getResponse(data);
	  if(response != null){
	    that._handleResponse(response);
	  }
	});
	socket.connect();
      },
      before: function(eventName, func){
	this._before[eventName] = func;
      },
      disconnect: function(){
	if(this._socket){
	  this._socket.close();
	}
      },
      authenticate: function(authData){
	this._makeRequest("authRequest", authData);
      },
      requestGame: function(playerID){
	// if playerID is undefined, then random game is requested.
	if(playerID == 0 || playerID){
	  this._makeRequest("gameRequest", playerID);
	}
	this._makeRequest("gameQuick", playerID);
      },
      quitGame: function(){
	
      },
      playerMove: function(moveData){
	this._makeRequest("playerMove", moveData);
      },
      // Handling events
      _onDebugMessage: function(evt, msg){
	this._logServerDebugMsg(msg);
      },
      _onServerMessage: function(evt, msg){
	this.log(msg, "info");
      },
      _onNotSupported: function(evt, type){
	this.log(type + " is not supported by server", "debug");
      },
      _onPingResponse: function(evt, from){
	this.fire("server:ping", (new Date).getTime() - from);
        evt.halt();
      },
      _afterConnectedChange: function(evt){
	// Connected
	if(evt.newVal){
	  this._startPinger(evt.newVal);
	// Disconnected
	} else {
	  
	}
      },
      // internals
      _beforeEvent: function(eventName, data){
	var func = this._before[eventName];
	if (func){
	  return func.call(this, data);
	}
	return data;
      },
      
      _startPinger: function(){
	var that = this;
	var pinger = function(){
	  if(that.get("connected")){
	    that._makeRequest("pingRequest", (new Date).getTime());
	    setTimeout(pinger, that.get('pingInterval'));
	  }
	};
	pinger();
      },
      _initEvents: function(options){
	// Publishing WebSocket events
	var eventNames = this.get("eventNames");
	for(var i in eventNames){
	  this.publish(eventNames[i], {
	    emitFacade: true,
	    bubbles: true,
	    prefix: prefix
	  });
	}
	// Server responses events
	var responses = this.get('allResponses');
	for(var i in responses){
	  var type = responses[i];
	  // publication
	  this.publish(type, {
	    broadcast: 0,
	    // TODO: co z tym?
	    // defaultFn: this._unhandledServerResponse,
	    bubbles: true,
	    emitFacade: true,
	    prefix: prefix
	  });
	  // binding to existing methods
	  var handler = this['_on' + type[0].toUpperCase() + type.slice(1)];
	  if(typeof(handler) != "undefined"){
	    this.on(prefix + type, handler);
	  }
	}
	// Binding other events
	this.after("connectedChange", this._afterConnectedChange);
      },
      _unhandledServerResponse: function(response){
	this.log('unhandled response "' + response.type + '"', "warning");
      },
      _unknownServerResponse: function(response){
	this.log('unknown response "' + response.type +
		 '" (' + JSON.stringify(response.data) + ')', "warning");
      },
      _makeRequest: function(type, data){
	this._socket.send(JSON.stringify(
	  { type: type, data: data }));
      },
      _getResponse: function(data){
	try {
	  return JSON.parse(data);
	} catch(SyntaxError){
	  this.log('Bad response: ' + data);
	}
	return null;
      },
      _handleResponse: function(response){
	var all = Y.Array(this.get('allResponses'));
	var type = response.type;
	// validating response
	if(all.indexOf(response.type) < 0){
	  this._unknownServerResponse(response);
	} else {
	  var data = this._beforeEvent(response.type, response.data);
	  this._logResponse(response);
	  this.fire(prefix + response.type, {}, data);
	}
      },
      _logServerDebugMsg: function(msg){
	this.log("server: " + msg, "debug-server-msg");
      },
      _logResponse: function(response){
	this.log("response: " + response.type, "debug-response");
      },
      log: function(msg, type){
	Y.log(msg, type ? type : "debug", "connectionhandler");
      }
    },
    {
      ATTRS: {
	url: {
	  value: "",
	  readOnly: true
	},
	allResponses: {
	  value: ['authRequest', 'authSuccess', 'authFailed', 'pingResponse',
		  'debugMessage', 'serverMessage', 'snapshot', 'gameStartCount',
		  'gameSimulationData', 'gameNewRound', 'gameScore',
		  'gameRivalLeft', 'gameFinished', 'playerData', 'notSupported',
		  'serverInfo', 'lobbyPlayersList', 'lobbyPlayerJoined',
		  'lobbyPlayerLeft', 'lobbyPlayerUpdated', 'lobbyEntered'],
	  readOnly: true
	},
	eventNames: {
	  // Does not include events generated by responses
	  value: ["connectionOpened", "connectionError", "connectionClosed", "ping"],
	  readOnly: true
	},
	connected: {
	  value: false,
	  readOnly: true
	},
	authenticated: {
	  value: false,
	  readOnly: true
	},
	pingInterval: {
	  value: 1000
	}
      }
    }
  );
  Y.log("module loaded", "debug", "connectionhandler");
}, "0", { requires: ['utils'] });
