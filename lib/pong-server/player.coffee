events = require 'events'

module.exports =
class Player extends events.EventEmitter
  # - Configurable static attrs -
  # Attributes that are sent to client as player info
  sendAttrs: ['id', 'name', 'ingame', 'quickGame']
  # Events that are handled and emited when recieved from client
  # This can be augumented to reduce / extend client functions
  clientEvents: ['pingRequest', 'gameRequest', 'gameQuick', 'playerMove',
                 'lobbyJoin']
  # All other events (not including clientEvents)
  # This attribute is used mostely for automatic binding methods to events
  emittedEvents: ['disconnect']
  # - Private static attrs -
  _lastID = 0
  # Warning: Never add _events attr like that. Silently breaks whole
  # EventEmitter functionality
  # _events = ['disconnect']
  constructor: (@connection) ->
    # # connection has to define following interface:
    # # .on( ('message|disconnect'), callback)
    # # .send(data)
    @id = (_lastID += 1)
    @name = "anonymous player #" + @id
    console.log "Player: " + @name + " created"
    @ingame = no
    @quickGame = no
    @_bindEvents()
    @_bindConnection connection
    @sendPlayerData()

  getAllEvents: ->
    @emittedEvents.concat @clientEvents

  send: (type, data) ->
    @connection.send @makeResponse(type, data)

  sendMessage: (msg) ->
    @connection.send JSON.stringify({ type: 'serverMessage', data: msg })

  sendRaw: (str) ->
    @connection.send str

  makeResponse: (type, data) ->
    JSON.stringify({ type: type, data: data })

  toJSON: ->
    result = {}
    for attr in @sendAttrs
      result[attr] = @[attr]

    result

  sendPlayerData: ->
    @send 'playerData', this

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
    for name in @getAllEvents
      handler = @['_on' + name[0].toUpperCase() + name[1..]]
      @on(name, handler) if handler?

  _onPingRequest: (data) ->
    @send 'pingResponse', data

  _onGameQuick: (value=true) ->
    @quickGame = value
