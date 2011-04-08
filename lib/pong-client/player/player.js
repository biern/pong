YUI.add("player", function (Y) {
  var Player = Y.namespace("Pong").Player =
    Y.Base.create(
    "Player", Y.Base, [],
    {
      initializer: function(){
	
      },
      makeClasses: function(){
	var result = '';
	Y.each(['inGame', 'quickGame'], function(attr){
	  if (this.get(attr)){
	    result += attr + ' ';
	  }
	}, this);
	if (result.length){
	  // Be nice - remove last space :-)
	  result = result.substring(0, result.length - 1);
	}
	return result.toLowerCase();
      }
    },
    {
      ATTRS: {
	id: {
	  value: 0
	},
	name: {
	  value: '#unset'
	},
	inGame: {
	  value: false
	},
	quickGame: {
	  value: false
	}
      }
    }
  );
  Y.log("module loaded", "debug", "paddle");
}, "0", { requires: ['base'] });
