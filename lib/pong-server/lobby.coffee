events = require 'events'
Game = require __dirname + '/game'
Player = require __dirname + '/player'
PlayerContainer = require __dirname + '/playercontainer'

module.exports =
class Lobby extends PlayerContainer
  gameParams:
    fps: 66
    w: 550
    h: 400

  constructor: (@name, @description="", @_playerTest=(player)->{pass: true}) ->
    @players = []
    @games = []

  addPlayer: (player) ->
    if not @playerPassesTest player
      return false

    player.send "lobbyEntered", @toJSON player
    @sendPlayersList player
    for p in @players
      p.send "lobbyPlayerJoined", player

    # Update players list at the end
    super player
    console.log "New player joined to " + @name +
                ". Players: " + (@players.length)
    return true

  playerPassesTest: (player) ->
    @_playerTest.call this, player

  removePlayer: (player) ->
    for p, i in @players
      p.send "lobbyPlayerLeft", player

    player.send "lobbyLeft", name: @name
    # Update players list at the end
    super player
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

  toJSON: (player=null) ->
    { pass, comment } = @playerPassesTest player
    playersNum: @players.length
    gameParams: @gameParams
    name: @name
    canJoin: pass
    reason: comment

  _onPlayerDisconnect: (player) ->
    console.log "Player left"
    @removePlayer player

  _onPlayerLobbyLeave: (player) ->
    @removePlayer player

  _onPlayerGameQuick: (player, value) ->
      @_playerQuickGame player, value

  _bindGameEvents: (game) ->
    game.on 'gameFinished', =>
      game.players (player) =>
        player.ingame = false
        # Debug only - in future change to:
        # player.quickGame = false
        player.quickGame = true
        player.emit 'quickGame'
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
