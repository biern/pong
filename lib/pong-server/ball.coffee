events = require 'events'

class Ball extends events.EventEmitter
  constructor: (data) ->
    { @x, @y, @r, @dir, @speed, @accel, @timeout, @minAngle } = data
    @timeout ?= 0
    @minAngle ?= Math.PI / 6
    if @dir == 'random'
      @dir = @randomDir()

    @on 'paddleBounce', @_onPaddleBounce

  randomDir: ->
    (@minAngle * 2 + Math.random() * (Math.PI - 2 * @minAngle * 2)) +
            Math.PI * (if Math.random() <= 0.5 then 0 else 1)

  simulate: (board) ->
    if @timeout > 0
      @timeout -= board.interval
      return

    @x += @speed * Math.sin @dir
    @y -= @speed * Math.cos @dir
    # Hitting paddles
    for paddle in board.paddles
    	if @lastBounced is paddle or
      	@x + @r*2 < paddle.x or
    	  @x > paddle.x + paddle.w or
      	@y + @r*2 < paddle.y or
      	@y > paddle.y + paddle.h
        continue
      else
        @lastBounced = paddle
        @emit 'paddleBounce', paddle


    # Hitting vertical walls - scores
    if @x + 2*@r >= board.w
      @emit 'score', board.player1
    else if  @x <= 0
      @emit 'score', board.player2
    else if @y + 2 * @r >= board.h or @y <= 0
    	# Changing direction
    	if @dir > Math.PI
    	  @dir = 3 * Math.PI - @dir
    	else
    	  @dir = Math.PI - @dir
      @emit 'wallBounce'

  toJSON: ->
    { @x, @y, @r, @dir, @speed, @timeout }

  _onPaddleBounce: (paddle) ->
    # Calculating new direction
    bouncePoint = ((@y + @r) - (paddle.y - @r)) / (paddle.h + 2*@r)
    if @dir > Math.PI
    	@dir = @minAngle + bouncePoint * (Math.PI - 2 * @minAngle)
    else
      @dir = Math.PI + @minAngle +
         (1 - bouncePoint) * (Math.PI - 2 * @minAngle)
    @speed += @accel
