YUI.add("lobby", function(Y) {
  
  Y.namespace("Pong").Lobby = Y.Base.create(
    'lobby', Y.Widget, [Y.WidgetParent], {
      initializer: function(){
	if(this.get('autoAdd')){
	  this._addChildren();
	}
      },

      destructor: function(){
	
      },

      renderUI: function(){
	
      },

      bindUI: function(){
	
      },

      syncUI: function(){
	
      },

      _addChildren: function(){
	var contentBox = this.get('contentBox'),
	  client = this.get('client');
	
	this.add(new Y.Pong.PlayerList({
	  contentBox: contentBox.one('.player-list-widget'),
	  client: client
	}));
	this.add(new Y.Pong.LobbyControls({
	  contentBox: contentBox.one('.controls-widget'),
	  client: client
	}));
	this.add(new Y.Pong.LobbyChat({
	  contentBox: contentBox.one('.chat-widget'),
	  client: client
	}));
      }
    }, {
      ATTRS: {
	client: {
	  value: null,
	  writeOnce: true
	},
	autoAdd: {
	  value: true,
	  writeOnce: true
	}
      }
    });

}, "3.2.0", {requires:["widget", "widget-child", "widget-parent", "substitute", "lobbychat", "playerslist", "lobbycontrols"]});
