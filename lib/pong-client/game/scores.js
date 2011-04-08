YUI.add("scores", function(Y) {
  function GameScores(config) {
    GameScores.superclass.constructor.apply(this, arguments);
  }
  GameScores.NAME = "gameScores";
  GameScores.ATTRS = {
    scores: {
      value: [0, 0]
    },
    client: {
      value: null,
      writeOnce: true
    }
  };
  GameScores.SCORES_TEMPLATE = '<div class="left">0</div><div class="right">0</div>';
  /* GameScores extends the base Widget class */
  Y.extend(GameScores, Y.Widget, {
    initializer: function() {
      
    },

    destructor : function() {
      
    },

    renderUI : function() {
      this._renderScoresNode();
    },

    bindUI : function() {
      this.after("scoresChange", this._afterScoresChange);
    },

    syncUI : function() {
      this._uiSetScores(this.get('scores'));
      this._bindClient(this.get('client'));
    },

    // Beyond this point is the GameScores specific application and rendering logic
    _renderScoresNode: function() {
      this._scoresNode = Y.Node.create(
	Y.substitute(GameScores.SCORES_TEMPLATE, {}));
      var node = this.get('contentBox').append(this._scoresNode);
      this._leftScoreNode = node.one('.left');
      this._rightScoreNode = node.one('.right');
    },

    _bindClient: function(client){
      client.on("*:gameScore", function(evt, data){
	this.set('scores', data.scores);
      }, this);
      client.on("*:gameStarted", function(evt, data){
	this.set('scores', [0, 0] );
      }, this);
    },
    
    /* Listeners, UI update methods */
    _afterScoresChange : function(e) {
      this._uiSetScores(e.newVal);
    },
    
    _uiSetScores: function(scores){
      this._leftScoreNode.set('innerHTML', scores[0]);
      this._rightScoreNode.set('innerHTML', scores[1]);
    },

    _afterClientChange: function(e){
      this._bindClient(e.newVal);
    }
  });
  Y.namespace("Pong").GameScores = GameScores;
  
}, "0.0.0", {requires:["node", "widget", "substitute"]});
