YUI.add("paddle", function (Y) {
  var Paddle = Y.namespace("Pong").Paddle =
    Y.Base.create(
    "Paddle", Y.Base, [],
    {
      // Interface
      initializer: function(){
	
      }
    },
    {
      ATTRS: {
	x: {
	  value: 0
	},
	y: {
	  value: 0
	},
	w: {
	  value: 0
	},
	h: {
	  value: 0
	},
	moving: {
	  value: 0
	}
      }
    }
  );
  Y.log("module loaded", "debug", "paddle");
}, "0", { requires: [] });
