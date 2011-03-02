events = require 'events'
sys = require 'sys'

module.exports =
class Player extends events.EventEmitter
  # connection has to define following interface:
  # .on( ('message|disconnect'), callback)
  # .send(data)

  # Player emits events on valid connection messages
  # and 'disconnect'
  # Player emited events:
  # - all valid connection messages (type is emitted)
  #   see Player::clientEvents for more details. This can also be augumented to
  #   reduce or extend client functionality
  # - disconnect
  # - quickgame
  constructor: (@connection) ->
    @name = "anonymous player"
    @ingame = no
    @quickGame = no
    @_bindEvents()
    @_bindConnection connection

  send: (type, data) ->
    @connection.send JSON.stringify({ type: type, data: data })

  sendMessage: (msg) ->
    @connection.send JSON.stringify({ type: 'serverMessage', data: msg })

  _bindConnection: (connection) ->
    connection.on "message", (rawData) =>
      try
        { type, data } = JSON.parse rawData
      catch error
        return

      if type in @clientEvents
        @emit type, data
      else
        @send "notSupported", type

    connection.on "disconnect", =>
      @emit "disconnect"

  _bindEvents: ->
    for array in [@clientEvents, @events]
      for name in array
        handler = @['_on' + name[0].toUpperCase() + name[1..]]
        @on(name, handler) if handler?

  _onPingRequest: (data) ->
    @send 'pingResponse', data

  _onQuickGame: ->
    @quickGame = yes

Player::clientEvents = ['pingRequest', 'gameRequested']
Player::events = ['quickgame']
