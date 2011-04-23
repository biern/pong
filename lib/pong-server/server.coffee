events = require 'events'
PlayerContainer = require __dirname + '/playercontainer'

module.exports =
class Server extends PlayerContainer
  constructor: (@description) ->
    @lobbies = []
    @_bind()
    super

  _bind: ->
    @on 'lobbyPlugged', (lobby) =>
      @_addLobby lobby

  _addLobby: (lobby) ->
    @lobbies.push lobby

  addPlayer: (player) ->
    super player
    @playerSendInfo player
    @emit 'playerJoined', player

  removePlayer: (player) ->
    super player

  playerSendInfo: (player) ->
    player.sendRaw player.makeResponse 'serverInfo', @toJSON player

  toJSON: (player) ->
    description: @description
    lobbies: l.toJSON player for l in @lobbies
    playersNum: @players.length
