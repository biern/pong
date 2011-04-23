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
  constructor: (@data, @player1, @player2) ->
    super
    @data.interval = 1000 / @data.fps
    @points = {}
    @points[@player1.id] = 0
    @points[@player2.id] = 0
    @addPlayer player1
    @addPlayer player2
    @_start()

  _onPlayerDisconnect: (player) ->
    winner = if @player1 == player then @player2 else @player1
    @_gameFinished winner, 'quit'
    super player

  _initSnapshotSender: ->
    sender = =>
      if @finished
        return

      response = Player::makeResponse 'gameSnapshot', @board.getSnapshot()
      @playersCall (player) =>
        player.sendRaw response

      setTimeout (=> sender()), @snapshotInterval

    sender()

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
        @_gameFinished playerScored
      else
        @_newRound()

  _gameFinished: (winner, reason) ->
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

  _start: ->
    @playersCall (player) =>
      player.send 'gameStarted'
    @_initBoard()
    @_initSnapshotSender()
    @board.start()
    @_newRound()

  _newRound: ->
    @board.newRound @newRoundTimeout

  playersCall: (func) ->
    func.call this, @player1, @player2, 0
    func.call this, @player2, @player1, 1
