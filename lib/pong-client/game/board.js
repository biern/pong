YUI.add('board', function(Y){
  /** 
   * TODO
   */
  var CANVAS_TEMPLATE = '<canvas></canvas>';
  Y.namespace("Pong").GameBoard = Y.Base.create(
    'gameBoard', Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
      initializer: function(){

      },

      destructor: function(){
	
      },

      renderUI: function(){
	this._canvasNode = this.get('contentBox').appendChild(CANVAS_TEMPLATE);
	this._initSimulator();
	this._initRenderer();
      },

      bindUI: function(){
	this.on('boardChange', this._onBoardChange);
      },

      syncUI: function(){
	this._updateBoard(this.get('board'));
	this._bindClient(this.get('client'));
      },

      _bindClient: function(client){
	client.on('*:gameBoardInfo', function(evt, board){
	  this.set('board', board);
	}, this);
      },
      
      _initSimulator: function(){
	this._simulator = new Y.Pong.GameSimulator({
	  client: this.get('client')
	});
      },

      _initRenderer: function(){
	this._renderer = new Y.Pong.GameRenderer({
	  client: this.get('client'),
	  canvas: this._canvasNode
	});
      },

      _onBoardChange: function(evt){
	this._updateBoard(evt.newVal);
      },

      _updateBoard: function(board){
	this._canvasNode.setAttrs({
	  width: board.w,
	  height: board.h
	});
      }
    }, {
      ATTRS: {
	client: {
	  value: null,
	  writeOnce: true
	},
	board: {
	  value: {
	    w: 100,
	    h: 100
	  }
	}
      }
    });
}, "0.0.0", {
  requires: ['widget', 'widget-parent', 'widget-child', 'simulator', 'renderer']
});
