events = require 'events'

module.exports =
class Game extends events.EventEmitter
  constructor: (@player1, @player2) ->

  players: (func) ->
    func.call @, @player1, @player2
    func.call @, @player2, @player1

