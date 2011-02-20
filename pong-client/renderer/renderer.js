YUI.add("renderer", function (Y) {
  var prefix = "renderer:";
  var Renderer = Y.namespace("Pong").Renderer =
    Y.Base.create(
    "Renderer", Y.Base, [],
    {
      _currentSnapshot: null,
      _canvasNode: null,
      _context: null,
      _toClear: [],
      _clearExtra: 10,
      // Interface
      initializer: function(){
	this.on("simulationDataChange", this._onSimulationDataChange);
	this.on("contentBoxChange", this._onContentBoxChange);
      },
      renderFrame: function(snapshot){
	var ctx = this._context,
	  balls = snapshot.getBalls(),
	  paddles = snapshot.getPaddles();
	this._currentSnapshot = snapshot;
	while (this._toClear.length){
	  var coords = this._toClear.shift();
	  ctx.fillStyle = "red";
	  ctx.clearRect(coords[0], coords[1], coords[2], coords[3]);
	  // ctx.fillRect(coords[0], coords[1], coords[2], coords[3]);
	}
	if(this.get("debug")){
	  if(snapshot.get("origin")){
	    this._renderOriginFrame(snapshot.get("origin"));
	  }
	}
	ctx.fillStyle = this.get("color");
	for (var i in balls){
	  this._drawBall(balls[i]);
	}
	for (var i in paddles){
	  this._drawPaddle(paddles[i]);
	}
      },
      clear: function(){
	var board = this.get("simulationData.board");
	this._context.clearRect(0, 0, board.w, board.h);
      },
      _onSimulationDataChange: function(evt){
	this._updateBoard(evt.newVal.board);
	if(this._currentSnapshot){
	  this.renderFrame(this._currentSnapshot);
	}
      },
      _onContentBoxChange: function(evt){
        this._canvasNode = evt.newVal.appendChild("<canvas></canvas>");
        this._context = Y.Node.getDOMNode(this._canvasNode).getContext("2d");
	this._updateBoard(this.get("simulationData.board"));
	// this._context.fillStyle = this.get("color");
	// this._context.fillRect(0,0,100,200);
      },
      _updateBoard: function(board){
	this._canvasNode.setAttrs({
	  width: board.w,
	  height: board.h
	});
      },
      _renderOriginFrame: function(snapshot){
	var ctx = this._context,
	  balls = snapshot.getBalls(),
	  paddles = snapshot.getPaddles();
	this._currentSnapshot = snapshot;
	ctx.fillStyle = this.get("originColor");
	for (var i in balls){
	  this._drawBall(balls[i]);
	}
	for (var i in paddles){
	  this._drawPaddle(paddles[i]);
	}
      },
      _drawBall: function(ball){
	var r = ball.get('r'),
	  x = ball.get('x'),
	  y = ball.get('y'),
	  e = this._clearExtra;
	this._context.fillRect(x, y, r*2, r*2);
	this._toClear.push([x - e, y - e, r*2 + 2*e, r*2 + 2*e]);
      },
      _drawPaddle: function(paddle){
	var e = this._clearExtra,
	  x = paddle.get('x'),
	  y = paddle.get('y'),
	  w = paddle.get('w'),
	  h = paddle.get('h');
	this._context.fillRect(x, y, w, h);
	this._toClear.push([x - e, y - e, w + 2*e, h + 2*e]);
      },
      log: function(msg, type){
	if(! type){
	  type = "debug";
	}
	Y.log(msg, type, "renderer");
      }
    },
    {
      ATTRS: {
	contentBox: {
	  value: null
	},
	simulationData: {
	  value: {
	    fps: 30,
	    board: {
	      'h': 300,
	      'w': 400
	    }
	  }
	},
	color: {
	  value: "white"
	},
	originColor: {
	  value: "blue"
	},
	debug: {
	  value: true
	}
	// board: {
	//   value: {
	//     width: {
	//       value: 0,
	//       validator: Y.Lang.isNumber
	//     },
	//     height: {
	//       value: 0,
	//       validator: Y.Lang.isNumber
	//     }
	//   }
	// }
      }
    }
  );
  Y.log("module loaded", "debug", "renderer");
}, "0", { requires: [] });
