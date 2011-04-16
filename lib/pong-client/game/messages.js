YUI.add("messages", function(Y){
  function GameMessageDisplay(config){
    GameMessageDisplay.superclass.constructor.apply(this, arguments);
  }
  GameMessageDisplay.NAME = "gameMessageDisplay";
  GameMessageDisplay.ATTRS = {
    client: {
      value: null,
      writeOnce: true
    },
    displayTime: {
      value: 2
    }
  };
  GameMessageDisplay.TEMPLATE = "<ul></ul>";
  GameMessageDisplay.MSG_TEMPLATE = 
    '<li style="opacity: 0" class="{classes}">{text}</li>';

  Y.extend(GameMessageDisplay, Y.Widget, {
    initializer: function(){

    },

    destructor: function(){

    },

    renderUI: function(){
      this._msgListNode = this.get('contentBox').append(
	GameMessageDisplay.TEMPLATE);
    },

    bindUI: function(){
      this._bindClient(this.get('client'));
    },

    _bindClient: function(client){
      client.on("*:gameNewRound", function(evt, data){
	this.addMessage({ text: "New round!" });	
	this.addMessage({ text: "Get ready" });	
      }, this);
      client.on("*:gameFinished", function(evt, data){
	if(data.won){
	  this.addMessage({ text: "you won! :-)" });
	} else {
	  this.addMessage({ text: "You lost! :-(" });
	}
      }, this);
      client.on("*:gameMessage", function(evt, data){
	this.addMessage(data);
      }, this);
      // Changing msg box size based on board size
      client.on("*:gameBoardInfo", function(evt, board){
	this._msgListNode.setStyles({
	  width: board.w
	});
      }, this);
    },
    
    syncUI: function(){
      
    },

    /**
     * @param msg:
     * { text: string,
     *  [classes: string,]
     *  [duration: float] }
     */
    addMessage: function(msg){
      var displayTime = msg.displayTime || this.get('duration');
      msg.classes = msg.classes || "";
      var msgNode = Y.Node.create(Y.substitute(
	GameMessageDisplay.MSG_TEMPLATE, msg));
      this._msgListNode.prepend(msgNode);
      // Creating animation chain
      var fadeIn = new Y.Anim({
        node: msgNode,
	from: { opacity: 0 },
        to: { opacity: 1 },
	duration: 0.4
      });
      var wait = new Y.Anim({
	node: msgNode,
	duration: displayTime
      });
      var fadeOut = new Y.Anim({
	node: msgNode,
	from: { opacity: 1 },
	to: { opacity: 0,
	      height: 0 },
	duration: 0.4
      });
      // Binding them
      fadeIn.once('end', function(){ wait.run(); });
      wait.once('end', function(){ fadeOut.run(); });
      fadeOut.once('end', function(){ msgNode.remove(); });
      // Running animation
      fadeIn.run();      
    }
  });
  Y.namespace("Pong").GameMessageDisplay = GameMessageDisplay;
}, '0', { requires: ["node", "anim"] });
