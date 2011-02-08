YUI.add("ball", function (Y) {
  var Ball = Y.namespace("Pong").Ball =
    Y.Base.create(
    "Ball", Y.Base, [],
    {
      // Interface
      initializer: function(data){
	this.set('x', data.x);
	this.set('y', data.y);
	this.set('moving', data.moving);
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
	moving: {
	  value: false
	}
      }
    }
  );
  Y.log("module loaded", "debug", "ball");
}, "0", { requires: [] })
;