YUI.add("plugins", function(Y) {
  var plugins;
  plugins = Y.namespace("Pong").plugins = {};
  return plugins.GameHiderPlugin = Y.Base.create("GameHiderPlugin", Y.Plugin.Base, [], {
    initializer: function() {
      var client, host;
      host = this.get('host');
      client = host.get('client');
      host.on('render', function() {
        return this.hide();
      });
      client.on('*:gameStarted', function() {
        return host.fadeIn();
      });
      client.on('*:gameFinished', function() {
        return host.hide();
      });
    }
  }, {
    NS: 'gameHider'
  });
}, '0.0.0', {
  requires: ['base', 'plugin']
});
