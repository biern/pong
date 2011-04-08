YUI.add("ball", function (Y) {
  var Ball = Y.namespace("Pong").Ball =
    Y.Base.create(
    "Ball", Y.Base, [],
    {
      
      // Interface
      initializer: function(data){
	// for(var i in this.get("setAttrs")){
	//   var name = this.get("setAttrs")[i];
	//   this.set(name, data[name]);
	// }
      }
    },
    {
      ATTRS: {
	setAttrs: {
	  value: ['x', 'y', 'r', 'dir', 'speed'],
	  readonly: true
	},
	x: {
	  value: 0
	},
	y: {
	  value: 0
	},
	r: {
	  value: 0
	},
	dir: {
	  value: 0
	},
	speed: {
	  value: 0
	}
      }
    }
  );
  Y.log("module loaded", "debug", "ball");
}, "0", { requires: [] })
;