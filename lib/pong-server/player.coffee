events = require 'events'
sys = require 'sys'


module.exports =
class Player extends events.EventEmitter
  #  - Configurable attrs -
  # Attributes that are sent to client as player info
  sendAttrs = ['id', 'name', 'ingame', 'quickgame']
  # Events that are handled and emited when recieved from client
  # This can be augumented to reduce / extend client functions
  clientEvents = ['pingRequest', 'gameRequested']
  # - Private attrs -
  # Other events. Defined here to skip binding them to handlers one by one
  _events = ['disconnect', 'quickgame']
  _lastID = 0
  constructor: (@connection) ->
    # connection has to define following interface:
    # .on( ('message|disconnect'), callback)
    # .send(data)
    @id = (@_lastID += 1)
    @name = "anonymous player #" + @id
    @ingame = no
    @quickGame = no
    @_bindEvents()
    @_bindConnection connection

  send: (type, data) ->
    @connection.send JSON.stringify({ type: type, data: data })

  sendMessage: (msg) ->
    @connection.send JSON.stringify({ type: 'serverMessage', data: msg })

  toJSON: ->
    result = {}
    for attr in @sendAttrs
      result[attr] = @[attr]

    result

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
    for array in [@clientEvents, @_events]
      for name in array
        handler = @['_on' + name[0].toUpperCase() + name[1..]]
        @on(name, handler) if handler?

  _onPingRequest: (data) ->
    @send 'pingResponse', data

  _onQuickGame: ->
    @quickGame = yes
