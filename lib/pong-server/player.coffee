events = require 'events'

module.exports =
class Player extends events.EventEmitter
  # connection has to define following interface:
  # .on( ('message|disconnect'), callback)
  # .send(data)

  # Player emits events on valid connection messages
  # and 'disconnect'
  constructor: (@connection) ->
    @name = "player"
    @_bindConnection(connection)

  onPingRequest: (data) ->
    @send 'pingResponse', data

  send: (type, data) ->
    @connection.send(JSON.stringify({ type: type, data: data }))

  _bindConnection: (connection) ->
    connection.on "message", (rawData) =>
      try
        { type, data } = JSON.parse rawData
      catch error
        return

      @emit type, data
      # Calling 'onType' method if defined
      handler = @['on' + type[0].toUpperCase() + type[1..]]
      (handler.call(@, data)) if handler?

    connection.on "disconnect", =>
      @emit "disconnect"
