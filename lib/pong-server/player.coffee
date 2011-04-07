events = require 'events'

module.exports =
class Player extends events.EventEmitter
  # - Configurable static attrs -
  # Attributes that are sent to client as player info
  sendAttrs: ['id', 'name', 'inGame', 'quickGame']
  # Events that are handled and emited when recieved from client
  # This can be augumented to reduce / extend client functions
  clientEvents: ['pingRequest', 'gameRequest', 'gameQuick', 'playerMove',
                 'lobbyJoin', 'lobbyLeave', 'lobbyChatMessage']
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
    @name = "player #" + @id
    console.log "Player: " + @name + " created"
    @inGame = no
    @quickGame = no
    @_bindEvents()
    @_bindConnection connection
    @sendPlayerInfo()

  getAllEvents: ->
    @emittedEvents.concat @clientEvents

  send: (type, data) ->
    # console.log @id + ' sending ' + type
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

  sendPlayerInfo: ->
    @send 'playerInfo', this

  _bindConnection: (connection) ->
    connection.on "message", (rawData) =>
      try
        { type, data } = JSON.parse rawData
      catch error
        return

      # if type != 'pingRequest'
      #     console.log @id + ' recieving ' + type

      if type in @clientEvents
        @emit type, data
      else
        @send "notSupported", type

    connection.on "disconnect", =>
      @emit "disconnect"

  _bindEvents: ->
    for name in @getAllEvents()
      handler = @['_on' + name[0].toUpperCase() + name[1..]]
      @on(name, handler) if handler?

  _onPingRequest: (data) ->
    @send 'pingResponse', data

  _onGameQuick: (data={value: true}) ->
    @quickGame = data.value
