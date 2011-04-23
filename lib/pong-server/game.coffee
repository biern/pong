events = require 'events'
Board = require __dirname + '/board'
Player = require __dirname + '/player'

module.exports =
class Game extends events.EventEmitter
  # Events:
  # Emitted to host: 'gameCreated', 'gameFinished'
  # (first argument is always a Game instance.
  # Sent to players: 'gameSnapshot', 'gameBoardInfo', 'gameScore', 'gameFinished'
  newRoundTimeout: 3000
  snapshotInterval: 400
  finished: no
  constructor: (@host, @data, @player1, @player2) ->
    @data.interval = 1000 / @data.fps
    @points = {}
    @points[@player1.id] = 0
    @points[@player2.id] = 0
    @host.emit 'gameCreated', this
    @_start()
    @_bind()

  _bind: ->
    @players (player1, player2) =>
      player1.on 'disconnect', =>
        @_gameFinished player2, 'quit'

  _initSnapshotSender: ->
    sender = =>
      if @finished
        return

      response = Player::makeResponse 'gameSnapshot', @board.getSnapshot()
      @players (player) =>
        player.sendRaw response

      setTimeout (=> sender()), @snapshotInterval

    sender()

  _initBoard: ->
    @board = new Board(@data, @player1, @player2)
    @players (player) =>
      player.send 'gameBoardInfo', @board

    @board.on 'score', (playerScored) =>
      score = (@points[playerScored.id] += 1)
      scores = [@points[@player1.id], @points[@player2.id]]
      @players (player) =>
        player.send 'gameScore',
          scores: scores,
          player: playerScored,
          self: player == playerScored,

      if score >= 3
        @_gameFinished playerScored
      else
        @_newRound()

  _gameFinished: (winner) ->
    if @finished
      return

    @finished = yes
    @players (player) =>
      player.send 'gameFinished',
      winner: winner,
      won: winner == player

    @board.stop()
    @host.emit 'gameFinished', this

  _start: ->
    @players (player) =>
      player.send 'gameStarted'
    @_initBoard()
    @_initSnapshotSender()
    @board.start()
    @_newRound()

  _newRound: ->
    @board.newRound @newRoundTimeout

  players: (func) ->
    func.call this, @player1, @player2, 0
    func.call this, @player2, @player1, 1

  @plugTo: (host) ->
    host.on 'newGame', (data, player1, player2) =>
      game = new Game host, data, player1, player2
