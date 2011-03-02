events = require 'events'
Game = require __dirname + '/game'
Player = require __dirname + '/player'

# TODO: Move to some 'utils' module
Array::remove = (e) -> @[t..t] = [] if (t = @.indexOf(e)) > -1

module.exports =
class Lobby extends events.EventEmitter
  constructor: (@name) ->
    @players = []
    @games = []

  joinPlayer: (player) ->
    @_bindPlayerEvents player
    player.send "lobbyEntered", name: @name
    @sendPlayersList player
    for p in @players
      p.send "lobbyPlayerJoined", player

    # Update players list at the end
    @players.push player

  removePlayer: (player) ->
    for p, i in @players
      p.send "lobbyPlayerLeft", player

    player.send "lobbyLeft", name: @name
    # Update players list at the end
    #TODO: Unbind player lobby events
    @players.remove player

  sendPlayersList: (player) ->
    player.send "lobbyPlayersList", players: @players

  sendToPlayers: (type, data, players=@players) ->
    response = Player::makeResponse type, data
    for p in players
      p.sendRaw response

  sendPlayerUpdated: (player, changed) ->
    # Some attribute(s) of a player changed
    @sendToPlayers "lobbyPlayerUpdated",
      player: player,
      changed: changed

  _bindPlayerEvents: (player) ->
    player.on 'disconnect', =>
      @removePlayer player
    player.on 'lobbyLeave', =>
      @removePlayer player
    player.on 'lobbyPlayersList', =>
      @sendPlayersList player
    player.on 'gameQuick', (value) =>
      @_playerQuickGame player, value
    player.on 'gameRequest', =>
      "TODO"

  _playerQuickGame: (player, value) ->
    if value
      return

    for p in @players
      if not p.ingame and p.quickGame and p != player
        return @_newGame player, p

    @sendPlayerUpdated player, ['quickGame']

  _newGame: (p1, p2) ->
    @games.push new Game(p1, p2)
    @sendPlayerUpdated p1, ['ingame']
    @sendPlayerUpdated p2, ['ingame']
