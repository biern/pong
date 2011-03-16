YUI.add("keyboardhandler", function (Y) {
  var prefix = "input:";
  var KeyboardHandler = Y.namespace("Pong").KeyboardHandler = Y.Base.create(
    "KeyboardHandler", Y.Widget, [],
    {
      _lastKey: null,
      _controlsStack: [],
      initializer: function(){
	this._initEvents();
      },
      _initEvents: function(){
	this.get("node").on("keydown", this._onKeyDown, this);
	this.get("node").on("keyup", this._onKeyUp, this);
	this.publish("move", {
	  emitFacade: true,
	  bubbles: true,
	  prefix: prefix
	});
      },
      _fireMove: function(dir){
	this.fire(prefix + "move", {}, dir);
      },
      _onKeyDown: function (evt) {
	if(this._lastKey == evt.keyCode){
	  return;
	}
	this._lastKey = evt.keyCode;
	Y.each(this.get("movementKeys"), function(dir){
	  if(this.get("bindings")[dir] == evt.keyCode){
	    this._controlsStack.unshift(dir);
	    this._fireMove(dir);
	  }
	}, this);
      },
      _onKeyUp: function(evt){
	this._lastKey = null;
	// Checking stack of pressed keys, removing this one if present
	var move;
	Y.each(this.get("movementKeys"), function(dir, i){
	  if(this.get("bindings")[dir] == evt.keyCode){
	    move = dir;
	  }
	}, this);
	for(var i in this._controlsStack){
	  if(this._controlsStack[i] == move){
	    this._controlsStack.splice(i);
	    break;
	  }
	}
	if(this._controlsStack.length){
	  this._fireMove(move);
	} else {
	  this._fireMove("stop");
	}
      }
    },
    {
      ATTRS: {
	node: {
	  value: null,
	  writeOnce: true
	},
	movementKeys: {
	  value: ["up", "down"]
	},
	bindings: {
	  value: {
	    up: 87,   // W
	    down: 83  // S
	  }
	}
      }
    }
  );
  Y.log("module loaded", "debug", "keyboardhandler");
}, "0", { requires: [] });
