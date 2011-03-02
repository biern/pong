events = require 'events'

#TODO: simulationData -> gameBoard, gameSimulationData

module.exports =
class Game extends events.EventEmitter
  constructor: (@player1, @player2) ->

  players: (func) ->
    func.call this, @player1, @player2
    func.call this, @player2, @player1

