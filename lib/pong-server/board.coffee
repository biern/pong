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

  newRound: (counter) ->


  players: (func) ->
    func.call this, @player1, @player2
    func.call this, @player2, @player1

  getSnapshot: ->
    { balls: @balls
      paddles: @paddles
      timestamp: (new Date).getTime() }

  _createPlayersPaddles: ->
  w = 12
  h = 50
  speed = 2.5
  accel = 0.12
  @players (player) =>
    @paddles.push new Paddle(
      x: 0 if player == @player1 else @w - w,
      y: (@h - h) / 2,
      w: w, h: h, speed: speed, accel: accel,
      player: player)

  _simulate: ->
    @simulator: =>
      if not @paused
        @_simulationCycle()

      if not @simulator.stop
        setTimeout @simulator, @simulationData.interval

    @simulator.stop = no
    @simulator()

  _simulationCycle: ->
    for ball in @balls
      ball.simulate(this)

    for paddle in @paddles
      paddle.simulate(this)

    @emit "simulationCycle"
