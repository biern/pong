events = require 'events'
Paddle = require __dirname + '/paddle'
Ball = require __dirname + '/ball'

module.exports =
class Board extends events.EventEmitter
  # Emits 'score' (player)
  _paused: no
  simulator: {}
  constructor: (data, @player1, @player2) ->
    { @w, @h, @fps } = data
    @_lastID = 0
    @balls = []
    @paddles = []
    @interval = 1000 / @fps

  start: ->
    @_simulate()

  stop: ->
    @simulator.stop = yes

  pause: ->
    @_paused = yes

  unpause: ->
    @_paused = no

  newRound: (timeout) ->
    @clear()
    @_createPlayersPaddles()
    @_createStartBall(timeout)
    @players (player) =>
      player.send 'gameNewRound'

  clear: ->
    @balls = []
    @paddles = []

  createBall: (data) ->
    data.id = @_newID()
    ball = new Ball data
    @_bindBall ball
    @balls.push ball
    ball

  createPaddle: (data) ->
    data.id = @_newID()
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

  toJSON: ->
    { @w, @h, @fps, @interval }

  _newID: ->
    (@_lastID += 1)

  _createPlayersPaddles: ->
    w = 12
    h = 50
    @players (player) =>
      paddle = @createPaddle
        x: if player == @player1 then 0 else @w - w
        y: (@h - h) / 2
        w: w, h: h,
        speed: 2.5, accel: 0.12
        player: player

      # Binding player movement commands
      player.on 'playerMove', (dir) =>
        paddle.move dir

  _createStartBall: (timeout) ->
    r = 3
    @createBall
      x: @w / 2 - r
      y: @h / 2 - r
      r: r
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
    @simulator = =>
      if not @paused
        @_simulationCycle()
        @emit "simulationCycle"

      if not @simulator.stop
        setTimeout (=> @simulator()), @interval
      else
        @simulator.running = no

    @simulator.stop = no
    @simulator.running = yes
    @simulator()

  _simulationCycle: ->
    for ball in @balls
      ball.simulate(this)

    for paddle in @paddles
      paddle.simulate(this)
