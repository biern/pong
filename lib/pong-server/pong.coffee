events = require 'events'

module.exports =
class Pong extends events.EventEmitter
  constructor: (@info) ->
    @lobbies = []
    @players = []

  addLobby: (lobby) ->
    @lobbies.push lobby

  addPlayer: (player) ->
    @players.push player
    @_bindPlayerEvents player
    @playerSendInfo player

  removePlayer: (player) ->
    @players.remove player

  playerSendInfo: (player) ->
    player.sendRaw player.makeResponse 'pongInfo', @toJSON player

  _bindPlayerEvents: (player) ->
    # TODO: Bind joining to lobbies
    player.on 'disconnect', =>
      @removePlayer player

  toJSON: (player) ->
    info: @info,
    lobbies: [l.toJSON player for l in @lobbies]
    playersNum: @players.length
