YUI.add("paddle", function (Y) {
  var Paddle = Y.namespace("Pong").Paddle =
    Y.Base.create(
    "Paddle", Y.Base, [],
    {
      // Interface
      initializer: function(data){
	this.set('x', data.x);
	this.set('y', data.y);
	this.set('direction', data.direction);
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
	direction: {
	  value: 0
	}
      }
    }
  );
  Y.log("module loaded", "debug", "paddle");
}, "0", { requires: [] });
