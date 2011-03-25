events = require 'events'

exports.Pong =
class Pong extends events.EventEmitter
  constructor: (@info) ->
    @lobbies = []
    @players = []

  addLobby: (lobby) ->
    @lobbies.push lobby

  addPlayer: (player) ->
    players.push player

  removePlayer: (player) ->
    players.remove player

  playerSendInfo: (player) ->
    player.send 'pongInfo', this

  _bindPlayerEvents: (player) ->
    # TODO: Bind joining to lobbies
    player.on 'disconnect', =>
      @removePlayer player

  toJSON: ->
    lobbies = [l.toJSONMini() for l in @lobbies]
    { @info, lobbies, @players }
