YUI.add("lobbychat", function(Y) {
  /* MyWidget class constructor */
  function LobbyChat(config) {
    LobbyChat.superclass.constructor.apply(this, arguments);
  }

  /* 
   * Required NAME static field, to identify the Widget class and 
   * used as an event prefix, to generate class names etc. (set to the 
   * class name in camel case). 
   */
  LobbyChat.NAME = "lobbyChat";

  /*
   * The attribute configuration for the widget. This defines the core user facing state of the widget
   */
  LobbyChat.ATTRS = {
    client: {
      // Pong Client instance
      value: null,
      writeOnce: true
    }
  };
  
  LobbyChat.HTML_PARSER = {
    
  };
  /* Templates for any markup the widget uses. Usually includes {} tokens, which are replaced through Y.substitute */
  LobbyChat.LOBBYCHAT_TEMPLATE = '<div class="messages"></div>' +
    '<div class="say"><label>say: </label><div class="input-wrap"><input type="text" value=""/></div></div>';

  LobbyChat.PLAYER_MSG_TEMPLATE = '<p class="msg"><span class="player-name">{name}:</span><span class="chat">{text}</span></p>';
  LobbyChat.SERVER_MSG_TEMPLATE = '<p class="msg"><span class="{class}">{text}</span></p>';
  /* LobbyChat extends the base Widget class */
  Y.extend(LobbyChat, Y.Widget, {
    initializer: function() {
      // TODO: Selecting player + emitting this event
      this.publish("msgSend", {
        bubbles: true,
	emitFacade: true
      });
    },

    destructor : function() {
      
    },

    _sendInputMsg: function(){
      var client = this.get('client');
      var text = this._sayNode.get('value');
      this._sayNode.set('value', '');
      client.send('lobbyChatMessage', { text: text });
    },

    _addChatMessage: function(data){
      var messagesNode = this._chatMessagesNode;
      if (data.player){
	messagesNode.append(Y.substitute(LobbyChat.PLAYER_MSG_TEMPLATE, {
	  name: data.player.get('name'),
	  text: data.text
	}));
      } else {
	messagesNode.append(Y.substitute(LobbyChat.SERVER_MSG_TEMPLATE, {
	  'class': data.sender,
	  text: data.text
	}));
      }
    },

    renderUI : function() {
      this._renderLobbyChatNode();
    },

    bindUI : function() {
      this.after("clientChange", this._afterClientChange);
      this._chatMessagesNode.after('click', Y.bind(this._onChatFocus, this));
      this._sayNode.on('change', Y.bind(this._onInputSubmitted, this));
    },

    syncUI : function() {
      this._bindToClient(this.get('client'));
    },

    // Beyond this point is the LobbyChat specific application and rendering logic
    _renderLobbyChatNode: function() {
      // TODO
      var chatNode = this._lobbyChatNode = Y.Node.create(
	Y.substitute(LobbyChat.LOBBYCHAT_TEMPLATE, {}));
      this._chatMessagesNode = chatNode.one('.messages');
      this._sayNode = chatNode.one('.say input');
      this.get('contentBox').append(this._lobbyChatNode);
    },

    _onInputSubmitted: function(evt){
      this._sendInputMsg();
    },

    _onChatFocus: function(evt){
      this._sayNode.focus();
    },

    _bindToClient: function(client){
      var that = this;
      client.on("*:lobbyChatMessage", function(evt, data){
	that._addChatMessage(data);
      });
    },
    
    /* attribute state supporting methods (see attribute config above) */
    _afterClientChange: function(e){
      this._bindToClient(e.newVal);
    }
  });
  Y.namespace("Pong").LobbyChat = LobbyChat;
  
}, "3.2.0", {requires:["widget", "substitute"]});
