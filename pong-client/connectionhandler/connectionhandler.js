YUI.add("connectionhandler", function (Y) {
  var prefix = "server:";
  var ConnectionHandler = Y.namespace("Pong").ConnectionHandler = Y.Base.create(
    "ConnectionHandler", Y.Base, [],
    {
      _socket: null,
      // Interface
      initializer: function(){
	this._initEvents();
      },
      connect: function(url){
	this._set("url", url);
	var socket = this._socket = new WebSocket(url);
	var that = this;
	socket.onopen = function(evt){
	  that.log("connection opened");
	  that._set("connected", true);
	  that.fire(prefix + "connectionOpened");
	};
	socket.onclose = function(evt){
	  that.log("connection closed");
	  that._set("connected", false);
	  that.fire(prefix + "connectionClosed");
	};
	socket.onerror = function(evt){
	  that.log("connection error");
	  that.fire(prefix + "connectionError");
	};
	socket.onmessage = function(evt){
	  var response = that._getResponse(evt.data);
	  if(response != null){
	    that._handleResponse(response);
	  }
	};
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
	this._makeRequest("gameRequested", playerID);
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
	this.log('unknown response "' + response.type + '"', "warning");
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
	  // TODO preparsing
	  this._logResponse(response);
	  this.fire(prefix + response.type, {}, response.data);
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
		  'gameSimulationData', 'gameNewRound', 'playerData'],
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
