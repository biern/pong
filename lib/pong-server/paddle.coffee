events = require 'events'

module.exports =
class Paddle extends events.EventEmitter
  constructor: (data) ->
    { @id, @x, @y, @w, @h, @speed, @accel, @player } = data
    @moving = "false"

  move: (dir) ->
    @moving = dir

  stop: ->
    @moving = "false"

  simulate: (board) ->
    # Paddle movement
    switch @moving
      when "up"
        @y -= @speed
        @y = 0 if @y < 0
      when "down"
        @y += @speed
        @y = board.h - @h if @y + @h > board.h

  toJSON: ->
    { @id, @x, @y, @w, @h, @speed, @accel, playerID: @player.id }
