events = require 'events'
Player = require __dirname + '/player'

# Provides clean and simple interface for common operations of
# player containing classes. PlayerContainer automagicaly binds
# event handlers to players when they are added and unbinds them
# when they are removed (via add/removePlayer methods). Handlers
# can be found automatically (autoFindPlayerHandlers method) and / or
# added manually (_addPlayerEventHandler(s) method). Handlers are
# searched for based on event names returned by Player::getAllEvents()

module.exports =
class PlayerContainer extends events.EventEmitter
  constructor: ->
    @_allPlayerEventsHandlers = []
    @players = []
    @autoFindPlayerHandlers()

  autoFindPlayerHandlers: () ->
    for name in Player::getAllEvents()
      handler = @['_onPlayer' + name[0].toUpperCase() + name[1..]]
      @_addPlayerEventHandler(name, handler) if handler?

  addPlayer: (player) ->
    @_bindPlayerEvents player
    @players.push player

  removePlayer: (player) ->
    @_unbindPlayerEvents player
    @players.remove player

  _addPlayerEventHandlers: (pairs) ->
    for pair in pairs
      @_addPlayerEventHandlers pair[0], pair[1]

  _addPlayerEventHandler: (eventName, handler) ->
    container = this
    # Switching context and argument (player <-> container)
    # for clearer handlers methods definitions
    @_allPlayerEventsHandlers.push [
      # 'this' == player
      eventName, (args...) ->
        handler.call container, this, args...]

  _bindPlayerEvents: (player) ->
    for pair in @_allPlayerEventsHandlers
      player.on pair[0], pair[1]

  _unbindPlayerEvents: (player) ->
    for pair in @_allPlayerEventsHandlers
      player.removeListener pair[0], pair[1]

  _onPlayerDisconnect: (player) ->
    @removePlayer player
