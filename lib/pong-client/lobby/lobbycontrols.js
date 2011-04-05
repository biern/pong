YUI.add("lobbycontrols", function(Y) {
  /* MyWidget class constructor */
  function LobbyControls(config) {
    LobbyControls.superclass.constructor.apply(this, arguments);
  }
  LobbyControls.NAME = "lobbyControls";
  LobbyControls.ATTRS = {
    client: {
      // Pong Client instance
      value: null,
      writeOnce: true
    }
  };
  LobbyControls.QUICKGAME_TEMPLATE = '<div class="quickgame"><label for="quickGame">quick game</label><input id="quickGame" type="checkbox"/></div>';
  LobbyControls.EXIT_TEMPLATE = '<input type="button">exit</input>';
  Y.extend(LobbyControls, Y.Widget, {
    initializer: function() {

    },

    destructor : function() {
      
    },

    renderUI : function() {
      this._renderQuickGameButton();
      // this._renderExitButton();
    },

    bindUI : function() {
      this._quickGameNode.after("click", Y.bind(this._afterQuickGameClicked, this));
    },

    syncUI : function() {
      // this._afterQuickGameClicked();
    },

    // Beyond this point is the LobbyControls specific application and rendering logic
    _renderQuickGameButton: function() {
      this._quickGameNode = this.get('contentBox').append(
	LobbyControls.QUICKGAME_TEMPLATE).one('input');
    },

    _afterQuickGameClicked: function(evt){
      var checked = this._quickGameNode.get('checked'),
	client = this.get('client');
      if(checked){
	client.send('gameQuick', { value: true });
      } else {
	client.send('gameQuick', { value: false });
      }
    },

    _bindClient: function(client){
      var that = this;
    }
  });
  Y.namespace("Pong").LobbyControls = LobbyControls;
  
}, "3.2.0", {requires:["widget", "substitute"]});
