YUI.add("utils", function (Y) {
  var utils = Y.namespace("Pong").utils = {};
  /**
   * Works like 'substitute', but tries to get YUI defined attrs with .get(key)
   * first. If that is not defined, then standard attr lookup is performed
   */
  utils.substituteAttrs = function(text, obj){
    return Y.substitute(text, obj, this._substituteAttrsGetter(obj));
  },
  /**
   * substituteAttrs helper method
   */
  utils._substituteAttrsGetter = function(obj){
    return function(key){
      var value = obj.get(key);
      if(typeof value == 'undefined'){
	return obj[key];
      } else {
	return value;
      }
    };
  };
}, "0", { requires: ["substitute"] });
