YUI.add("snapshot", function (Y) {
  var Snapshot = Y.namespace("Pong").Snapshot =
    Y.Base.create("Snapshot", Y.Base, [], {
      _balls: [],
      _paddles: [],
      _PaddleCls: null,
      _BallCls: null,
      initializer: function(){

      },
      setData: function(snapshotData, PaddleCls, BallCls){
	this._PaddleCls = PaddleCls;
	this._BallCls = BallCls;
	this._set("timestamp", snapshotData.timestamp);
	this._balls = [];
	for(var i in snapshotData.balls){
	  this._balls.push(new BallCls(snapshotData.balls[i]));
	}
	this._paddles = [];
	for(var i in snapshotData.paddles){
	  this._paddles.push(new PaddleCls(snapshotData.paddles[i]));
	}
      },
      update: function(snapshot){
	// Update all objects data with data from given snapshot
	var addNew,
	  objTypes = ["ball", "paddle"],
	  newObjects = {
	    paddles: snapshot.getPaddles(),
	    balls: snapshot.getBalls()
	  };
	// For every type of object
	for(key in objTypes){
	  var type = objTypes[key],
	    typeSingular = type[0].toUpperCase() + type.substr(1, type.length-1),
	    oldObjs = this['_' + type],
	    objs = newObjects[type];
	  // Updating / removing objects
	  for(var i in objs){
	    addNew = true;
	    var newObj = objs[i];
	    // Find matching obj in old snapshot
	    for(var j in oldObjs){
	      var oldObj = oldObjs[j];
	      // Got match
	      if(oldObj.id == newObj.id){
		addNew = false;
		this['_update'+typeSingular](oldObj, newObj);
		// Update it
		updatedObjs.push(oldObj);
		// Save and quit
		oldObjs.splice(j, 1);
		break;
	      }
	    }
	    // Check if obj needs to be added and add it.
	    if(addNew){
	      updatedObjs.push(newObj);
	    }
	  }
	  // At this moment all objects left in original obj array are "dead"
	  // Update old array with new one
	  this['_' + type] = updatedObjs;
	}
	this._set("timestamp", snapshot.get("timestamp"));
      },
      copy: function(){
	return Y.clone(this);
      },
      getPaddles: function(){
	return this._paddles;
      },
      getBalls: function(){
	return this._balls;
      },
      getPaddleByID: function(id){
	var paddles = this.getPaddles();
	for(var key in paddles){
	  if(paddles[key].id == id){
	    return paddles[key];
	  }
	}
	return null;
      },
      getBallByID: function(id){
	var balls = this.getBalls();
	for(var key in balls){
	  if(balls[key].id == id){
	    return balls[key];
	  }
	}
	return null;
      },
      _updateBall: function(ball, toUpdate){
	var attrs = ['x', 'y', 'dir'];
	for(var i in attrs){
	  ball.set(attrs[i], toUpdate.get(attrs[i]));
	}
      },
      _updatePaddle: function(paddle, toUpdate){
	var attrs = ['x', 'y', 'moving', 'ownerID'];
	for(var i in attrs){
	  paddle.set(attrs[i], toUpdate.get(attrs[i]));
	}
      }
    }, {
      ATTRS: {
	timestamp: {
	  readonly: true
	}
      }
    });
}, "0", { requires: ["oop"] });