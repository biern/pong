YUI.add("playerlist", function(Y) {
  /* MyWidget class constructor */
  function PlayerList(config) {
    PlayerList.superclass.constructor.apply(this, arguments);
  }

  /* 
   * Required NAME static field, to identify the Widget class and 
   * used as an event prefix, to generate class names etc. (set to the 
   * class name in camel case). 
   */
  PlayerList.NAME = "playerList";

  /*
   * The attribute configuration for the widget. This defines the core user facing state of the widget
   */
  PlayerList.ATTRS = {
    players: {
      value: []
      , setter: "_setPlayers"
    },
    client: {
      // Pong Client instance
      value: null,
      writeOnce: true
    }
  };
  
  PlayerList.HTML_PARSER = {
    
  };
  /* Templates for any markup the widget uses. Usually includes {} tokens, which are replaced through Y.substitute */
  PlayerList.PLAYERLIST_TEMPLATE = "<ul></ul>";
  PlayerList.PLAYER_TEMPLATE = '<li class="player {classes}">{name}</li>';
  /* PlayerList extends the base Widget class */
  Y.extend(PlayerList, Y.Widget, {
    initializer: function() {
      // TODO: Selecting player + emitting this event
      this.publish("playerSelected", {
        defaultFn: this._onPlayerSelected,
        bubbles: true,
	emitFacade: true
      });
    },

    destructor : function() {
      
    },

    addPlayer: function(player){
      var players = this.get('players');
      players.push(player);
      this.set('players', players);
    },

    removePlayer: function(player){
      var players = this.get('players');
      for (var i in players){
	if(players[i].get('id') == player.get('id')){
	  players.splice(i,1);
	  this.set('players', players);
	  return;
	}
      }
    },

    updatePlayer: function(player){
      var players = this.get('players');      
      for (var i in players){
	if(players[i].get('id') == player.get('id')){
	  players.splice(i, 1);
	  break;
	}
      }
      players.push(player);
      this.set('players', players);
    },
    
    renderUI : function() {
      this._renderPlayerListNode();
    },

    bindUI : function() {
      // TODO: bind clicks and keyboard
      this.after("playersChange", this._afterPlayersChange);
      this.after("clientChange", this._afterClientChange);
    },

    syncUI : function() {
      this._uiSetPlayers(this.get('players'));
      this._bindToClient(this.get('client'));
    },

    // Beyond this point is the PlayerList specific application and rendering logic
    _renderPlayerListNode: function() {
      this._playerListNode = Y.Node.create(
	Y.substitute(PlayerList.PLAYERLIST_TEMPLATE, {}));
      this.get('contentBox').append(this._playerListNode);
    },

    _bindToClient: function(client){
      var that = this;
      client.on("*:lobbyPlayersList", function(evt, data){
	that.set('players', data.players);
      });
      client.on("*:lobbyPlayerJoined", function(evt, data){
	that.addPlayer(data.player);
      });
      client.on("*:lobbyPlayerLeft", function(evt, data){
	that.removePlayer(data.player);
      });
      client.on("*:lobbyPlayerUpdated", function(evt, data){
	that.updatePlayer(data.player);
      });
    },
    
    /* attribute state supporting methods (see attribute config above) */
    _setPlayers : function(attrVal, attrName) {
      var compare = function(a, b){
	var result;
	Y.some(['quickGame', 'inGame', ['name', Y.ArraySort.compare]],
		function(val){
		  var attr, cmp;
		  if (Y.Lang.isString(val)){
		    attr = val;
		    cmp = function(x, y){ return x - y; };
		  } else {
		    attr = val[0];
		    cmp = val[1];
		  }
		  result = cmp(a.get(attr), b.get(attr));
		  return result;
	});
	return result;
      };
      return attrVal.sort(compare);
    },
    /* Listeners, UI update methods */

    _afterPlayersChange : function(e) {
      this._uiSetPlayers(e.newVal);
    },
    
    _uiSetPlayers: function(players){
      var playerList = this._playerListNode;
      // Clear previous content
      playerList.set('innerHTML', '');
      // Refill it
      Y.each(players, function(player, i){
	// TODO: adding classes attribute to player is a bad solution
	playerList.append(Y.substitute(PlayerList.PLAYER_TEMPLATE, {
	  name: player.get('name'),
	  classes: player.makeClasses()
	}));
      }, this);
    },

    _onPlayerSelected : function(e) {
      // The default behavior for the "myEvent" event.
    },

    _afterClientChange: function(e){
      this._bindToClient(e.newVal);
    }
  });
  Y.namespace("Pong").PlayerList = PlayerList;
  
}, "0.0.0", {requires:["node", "widget", "arraysort", "substitute"]});
