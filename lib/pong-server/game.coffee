events = require 'events'
Board = require __dirname + '/board'
Player = require __dirname + '/player'
PlayerContainer = require __dirname + '/playercontainer'

# Game Class
# Implements higher level game logic - creation,
# waiting for players, starting and finishing.
# All game rules related logic is handled by Board class.
module.exports =
class Game extends PlayerContainer
  newRoundTimeout: 3000
  snapshotInterval: 400
  finished: no
  constructor: (@host, @data, @player1, @player2) ->
    super
    @data.interval = 1000 / @data.fps
    @points = {}
    @points[@player1.id] = 0
    @points[@player2.id] = 0
    @host.emit 'gameCreated', this
    @addPlayer player1
    @addPlayer player2
    @_start()

  # - initialization -
  # TODO: Move to board
  _initSnapshotSender: ->
    sender = =>
      if @finished
        return

      response = Player::makeResponse 'gameSnapshot', @board.getSnapshot()
      @playersCall (player) =>
        player.sendRaw response

      setTimeout (=> sender()), @snapshotInterval

    sender()

  # Create board (game simulation) and bind it
  _initBoard: ->
    @board = new Board(@data, @player1, @player2)
    @playersCall (player) =>
      player.send 'gameBoardInfo', @board

    @board.on 'score', (playerScored) =>
      score = (@points[playerScored.id] += 1)
      scores = [@points[@player1.id], @points[@player2.id]]
      @playersCall (player) =>
        player.send 'gameScore',
          scores: scores,
          player: playerScored,
          self: player == playerScored,

      if score >= 3
        @_finish playerScored
      else
        @_newRound()

  # - Player events -
  # Finish game when player disconnects
  _onPlayerDisconnect: (player) ->
    winner = if @player1 == player then @player2 else @player1
    @_finish winner, 'quit'
    super player

  # - Game logic -
  _start: ->
    @playersCall (player) =>
      player.send 'gameStarted'
    @_initBoard()
    @_initSnapshotSender()
    @board.start()
    @_newRound()

  _newRound: ->
    @board.newRound @newRoundTimeout

  _finish: (winner, reason) ->
    # Game can be finished only once :-)
    if @finished
      return

    @finished = yes
    @playersCall (player) =>
      player.send 'gameFinished',
        winner: winner
        won: winner == player
        reason: reason

    @board.stop()
    @emit 'gameFinished',
        winner: winner
        reason: reason

  # - Other / helpers -
  playersCall: (func) ->
    func.call this, @player1, @player2, 0
    func.call this, @player2, @player1, 1

  # - Static -
  @plugTo: (host) ->
    host.on 'newGame', (data, player1, player2) =>
      game = new Game host, data, player1, player2
