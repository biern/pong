events = require 'events'
Game = require __dirname + '/game'

module.exports =
class Lobby extends events.EventEmitter
  constructor: (@name) ->
    @players = []
    @games = []

  joinPlayer: (player) ->
    @_bindPlayerEvents player
    @players.push player
    player.sendMessage "Joined " + @name

  removePlayer: (player) ->
    @players.remove player

  _bindPlayerEvents: (player) ->
    player.on 'disconnect', =>
      @removePlayer player
    player.on 'quickgame', =>
      @_quickGameRequested player

  _quickGameRequested: (player) ->
    for p in @players
      if not p.ingame and p.quickgame and p != player
        @_newGame player, p
        return

  _newGame: (p1, p2) ->
    @games.push new Game(p1, p2)

