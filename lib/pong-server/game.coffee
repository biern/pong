events = require 'events'
Board = require __dirname + '/board'
Player = require __dirname + '/player'

# TODO: Redesign simulationData, board data format

module.exports =
class Game extends events.EventEmitter
  snapshotInterval: 400
  finished = no
  constructor: (@data, @player1, @player2) ->
    @data.interval = 1000 / @data.fps
    @points = {}
    @points[@player1.id] = 0
    @points[@player2.id] = 0
    @_start()

  _initSnapshotSender: ->
    sender = =>
      if @finished
        return

      response = Player::makeResponse 'snapshot', @board.getSnapshot()
      @players (player) =>
        player.sendRaw response

      setTimeout (=> sender()), @snapshotInterval

    sender()

  _initBoard: ->
    @board = new Board(@data, @player1, @player2)
    @players (player) =>
      player.send 'gameSimulationData', board: @data

    @board.on 'score', (playerScored) =>
      score = (@points[playerScored.id] += 1)
      scores = [@points[@player1.id], @points[@player2.id]]
      if score >= 3
        @_gameFinished()
      else
        @board.newRound()

      @players (player) =>
        player.send 'gameScore',
          scores: scores,
          player: playerScored,
          self: player == playerScored,

        if @finished
          player.send 'gameFinished',
            winner: playerScored,
            won: playerScored == player

  _gameFinished: ->
    @finished = yes
    @board.stop()
    @emit 'gameFinished'

  _start: ->
    @_initBoard()
    @_initSnapshotSender()
    @players (player) =>
      player.send 'gameNewRound'
    @board.start()
    @board.newRound()

  players: (func) ->
    func.call this, @player1, @player2, 0
    func.call this, @player2, @player1, 1
