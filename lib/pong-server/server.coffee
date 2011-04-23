events = require 'events'
PlayerContainer = require __dirname + '/playercontainer'

module.exports =
class Server extends PlayerContainer
  constructor: (@description) ->
    @lobbies = []
    super

  addLobby: (lobby) ->
    @lobbies.push lobby

  addPlayer: (player) ->
    super player
    @playerSendInfo player

  removePlayer: (player) ->
    super player

  playerSendInfo: (player) ->
    player.sendRaw player.makeResponse 'serverInfo', @toJSON player

  toJSON: (player) ->
    description: @description
    lobbies: l.toJSON player for l in @lobbies
    playersNum: @players.length

  _onPlayerLobbyJoin: (player, lobbyID) ->
    # TODO: What if player is already in another lobby?
    for l in @lobbies
      if l.id == lobbyID
        l.addPlayer player
