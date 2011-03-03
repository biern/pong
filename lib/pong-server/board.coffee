events = require 'events'

class Board extends events.EventEmitter
  # Emits 'score' (player)
  _paused: no
  simulator: {}
  constructor: (@w, @h, @fps, @player1, @player2) ->
    @balls = []
    @paddles = []
    @interval = 1000 / @fps
    @_createPlayersPaddles

  start: ->
    @_simulate()

  stop: ->
    @simulator.stop = yes

  pause: ->
    @_paused = yes

  unpause: ->
    @_paused = no

  newRound: (timeout) ->

  createBall: (data) ->
    ball = new Ball data
    @_bindBall ball
    @balls.push ball
    ball

  createPaddle: (data) ->
    paddle = new Paddle data
    @_bindPaddle paddle
    @paddles.push paddle
    paddle

  players: (func) ->
    func.call this, @player1, @player2
    func.call this, @player2, @player1

  getSnapshot: ->
    balls: @balls
    paddles: @paddles
    timestamp: (new Date).getTime()

  _createPlayersPaddles: ->
    @players (player) =>
      @createPaddle
        x: if player == @player1 then 0 else @w - w
        y: (@h - h) / 2
        w: 12, h: 50,
        speed: 2.5, accel: 0.12
        player: player

  _createStartBall: (timeout) ->
    @createBall
      x: @w / 2 - r
      y: @h / 2 - r
      r: 3
      speed: 3, accel: 0.1
      dir: 'random'
      timeout: timeout

  _bindPaddle: (paddle) ->

  _bindBall: (ball) ->
    ball.on 'score', (player) =>
      @emit 'score', player
    # Not used yet
    # ball.on 'wallBounce', =>
    # ball.on 'paddleBounce' =>

  _simulate: ->
    @simulator =>
      if not @paused
        @_simulationCycle()

      if not @simulator.stop
        setTimeout (=> @simulator()), @simulationData.interval

    @simulator.stop = no
    @simulator()

  _simulationCycle: ->
    for ball in @balls
      ball.simulate(this)

    for paddle in @paddles
      paddle.simulate(this)

    @emit "simulationCycle"
