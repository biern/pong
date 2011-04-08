YUI.add("game", function(Y) {
  /** 
   * TODOS:
   * 
   */
  Y.namespace("Pong").Game = Y.Base.create(
    'game', Y.Widget, [Y.WidgetParent], {
      initializer: function(){
	if(this.get('autoAdd')){
	  this._addChildren();
	}
      },

      destructor: function(){
	
      },

      renderUI: function(){
	this._initKeyboardHandler();
      },

      bindUI: function(){
	var client = this.get('client');
	client.on('input:move', this._onPlayerMove, this);
	// TODO: In future move showing / hiding game outside this widget
	client.on('*:gameFinished', function(evt){
	  this.fadeOut();
	}, this);
	client.on('*:gameStarted', function(evt){
	  this.fadeIn();
	}, this);
      },

      syncUI: function(){
	// TODO: Move outside the widget
	this.hide();
	this.get('boundingBox').append('<div class="curtain"></div>');
      },

      hide: function(){
	this.get('boundingBox').hide();
      },
      
      fadeOut: function(){
	this.get('boundingBox').hide();
      },

      fadeIn: function(){
	this.get('boundingBox').show();
      },

      _initKeyboardHandler: function(){
	this._keyboardHandler = new Y.Pong.KeyboardHandler({
	  node: Y.one(document)
	});
	this._keyboardHandler.addTarget(this.get('client'));
      },

      _onPlayerMove: function(evt, data){
	this.get('client').send('playerMove', data);
      },
      
      _addChildren: function(){
	var contentBox = this.get('contentBox'),
	  client = this.get('client');
	this._board = this.add(new Y.Pong.GameBoard({
	  contentBox: contentBox.one('.board'),
	  client: client
	}));
	this.add(new Y.Pong.GameScores({
	  contentBox: contentBox.one('.scores'),
	  client: client
	}));
      },
      
      log: function(msg, type){
	if(! type){
	  type = "debug";
	}
	Y.log(msg, type, "game");
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
	},
	running: {
	  value: false
	}
      }
    });

}, "0.0.0", {requires:["widget", "widget-parent", "substitute", "board", "scores", "messages", "keyboardhandler"]});
