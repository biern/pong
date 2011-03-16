events = require 'events'
Game = require __dirname + '/game'
Player = require __dirname + '/player'

# TODO: Move to some 'utils' module
Array::remove = (e) -> @[t..t] = [] if (t = @.indexOf(e)) > -1

module.exports =
class Lobby extends events.EventEmitter
  _playerEvents:
    ['disconnect', 'lobbyLeave', 'lobbyPlayersList', 'gameQuick', 'gameRequest']
  gameParams:
    fps: 66
    w: 550
    h: 400

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
    console.log "New player joined to " + @name +
                ". Players: " + (@players.length)

  removePlayer: (player) ->
    for p, i in @players
      p.send "lobbyPlayerLeft", player

    player.send "lobbyLeft", name: @name
    # Update players list at the end
    #TODO: Unbind player lobby events
    @_unbindPlayerEvents player
    @players.remove player
    console.log "Player left " + @name + ". Players: " + (@players.length )

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
    for type in @_playerEvents
      do (type) =>
        handler = (args...) =>
          @['_onPlayer' + type[0].toUpperCase() + type[1..]](player, args...)
        player.on type, handler

  _onPlayerDisconnect: (player) ->
    console.log "Player left"
    @removePlayer player

  _onPlayerLobbyLeave: (player) ->
    @removePlayer player

  _onPlayerGameQuick: (player, value) ->
      @_playerQuickGame player, value

  _unbindPlayerEvents: (player) ->
    # player.removeAllListeners 'gameQuick'
    # player.removeAllListeners ''

  _bindGameEvents: (game) ->
    game.on 'gameFinished', =>
      game.players (player) =>
        player.ingame = false
        player.quickGame = false
        @sendPlayerUpdated player, ['ingame', 'quickGame']

      @games.remove game
      delete game

  # TODO: unbindGameEvents

  _playerQuickGame: (player, value) ->
    if value
      return

    for p in @players
      if not p.ingame and p.quickGame and p != player
        return @_newGame player, p

    @sendPlayerUpdated player, ['quickGame']

  _newGame: (p1, p2) ->
    console.log "New game between " + p1.id + " and " + p2.id
    game = new Game(@gameParams, p1, p2)
    @_bindGameEvents game
    @games.push game
    for p in [p1, p2]
      p.ingame =  true
      @sendPlayerUpdated p, ['ingame']
