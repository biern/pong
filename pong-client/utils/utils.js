YUI.add("utils", function (Y) {
  var utils = Y.namespace("Pong").utils = {};
  // ObjectWithOptions
  var optObj = utils.ObjectWithOptions = function(config){
    config = config || {};
    var obj = function(){};
    var prototype = obj.prototype;
    prototype.initOptions = function(defaultOptions, updateOptions){
      if(! defaultOptions){
	defaultOptions = {};
      }
      this._options = defaultOptions;
      this.publish("optionsUpdate", {
        bubbles: false,
        emitFacade: true,
        defaultFn: function(evt, options, toUpdate){
	  this._performOptionsUpdate(toUpdate);
	}
      });
      if(updateOptions){
	this._updateOptions(updateOptions);
      }
    };
    prototype._updateOptions = function(toUpdate){
      this.fire("optionsUpdate", {}, this._options, toUpdate);
    };
    prototype._performOptionsUpdate = function(options){
      for(var key in options){
	this._options[key] = options[key];
      }
    };
    if(config.publicUpdate){
      prototype.updateOptions = function(options){
	return this._updateOptions(options);
      };
    }
    return obj;
  };
}, "0", { requires: ["utils"] });
