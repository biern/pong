events = require 'events'
Game = require __dirname + '/game'
Player = require __dirname + '/player'
PlayerContainer = require __dirname + '/playercontainer'

# TODO: lobby ids

module.exports =
class Lobby extends PlayerContainer
  gameParams:
    fps: 66
    w: 400
    h: 400

  constructor: (@name, @description="", @_playerTest=(player)->{pass: true}) ->
    @games = []
    super

  addChatMessage: (player, data) ->
    if typeof data.text != 'string'
      return

    # TODO: Add utils method for stripping tags
    data.text = data.text.replace /</g, '&lt;'
    data.text = data.text.replace />/g, '&gt;'
    # Dont send empty messages
    if not data.text.length
      return

    for p in @players
      p.send 'lobbyChatMessage', { 'player': player, 'text': data.text}

  addPlayer: (player) ->
    if not @playerPassesTest player
      return false

    super player
    player.send "lobbyEntered", @toJSON player
    @sendPlayersList player
    for p in @players
      (p.send "lobbyPlayerJoined", player: player) if p != player

    console.log "New player joined to " + @name +
                ". Players: " + (@players.length)
    return true

  playerPassesTest: (player) ->
    @_playerTest.call this, player

  removePlayer: (player) ->
    for p, i in @players
      p.send "lobbyPlayerLeft", player: player

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

  _onPlayerLobbyLeave: (player) ->
    @removePlayer player

  _onPlayerLobbyChatMessage: (player, data) ->
    @addChatMessage player, data

  _onPlayerGameQuick: (player, data) ->
    if data.value
      for p in @players
        if not p.inGame and p.quickGame and p != player
          return @_newGame player, p

    @sendPlayerUpdated player, ['quickGame']

  _bindGameEvents: (game) ->
    game.on 'gameFinished', =>
      game.players (player) =>
        player.inGame = false
        # Debug only - in future change to:
        # player.quickGame = false
        player.quickGame = true
        player.emit 'quickGame'
        @sendPlayerUpdated player, ['inGame', 'quickGame']

      @games.remove game
      delete game
  # TODO: unbindGameEvents

  _newGame: (p1, p2) ->
    console.log "New game between " + p1.id + " and " + p2.id
    game = new Game(@gameParams, p1, p2)
    @_bindGameEvents game
    @games.push game
    for p in [p1, p2]
      p.inGame =  true
      @sendPlayerUpdated p, ['inGame']
