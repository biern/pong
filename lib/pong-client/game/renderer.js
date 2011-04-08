YUI.add("renderer", function (Y) {
  /**
   * Renders the game on canvas
   * TODO:
   * - move rendering outside to paddle / ball classes
   */
  var prefix = "renderer:";
  var Renderer = Y.namespace("Pong").GameRenderer =
    Y.Base.create(
    "GameRenderer", Y.Base, [],
    {
      _currentSnapshot: null,
      _canvasNode: null,
      _context: null,
      _toClear: [],
      _clearExtra: 10,
      // Interface
      initializer: function(){
	this._initEvents();
	this._sync();
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
	var canvas = this.get('canvas'),
	  w = canvas.get('width'),
	  h = canvas.get('height');
	this._context.clearRect(0, 0, w, h);
      },
      _initEvents: function(){
	this.on("canvasChange", this._onCanvasChange);
      },
      _sync: function(){
	this._bindClient(this.get('client'));
	this._updateCanvas(this.get('canvas'));
      },
      _onCanvasChange: function(evt){
	this._updateContext(evt.newVal);
      },
      _updateCanvas: function(canvas){
        this._context = Y.Node.getDOMNode(canvas).getContext("2d");
      },
      _bindClient: function(client){
	client.on('*:step', Y.bind(this._onSimulationStep, this));
	client.on('*:gameFinished', Y.bind(this.clear, this));
	this.addTarget(client);
      },
      _onSimulationStep: function(evt, snapshot){
	this.renderFrame(snapshot);
      },
      // Drawing methods
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
	client: {
	  value: null,
	  writeOnce: true
	},
	canvas: {
	  value: null,
	  writeOnce: true
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
      }
    }
  );
  Y.log("module loaded", "debug", "renderer");
}, "0.0.0", { requires: ['node'] });
