events = require 'events'
sys = require 'sys'


module.exports =
class Player extends events.EventEmitter
  constructor: (@connection) ->
    # connection has to define following interface:
    # .on( ('message|disconnect'), callback)
    # .send(data)
    @id = (Player::_lastID += 1)
    @name = "anonymous player #" + @id
    console.log "Player: " + @name + " created"
    @ingame = no
    @quickGame = no
    @_bindEvents()
    @_bindConnection connection
    @sendPlayerInfo()

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

  sendPlayerInfo: ->
    @send 'playerInfo', this

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

  _onGameQuick: (value=true) ->
    @quickGame = value


#- Configurable static attrs -
# Attributes that are sent to client as player info
Player::sendAttrs = ['id', 'name', 'ingame', 'quickGame']
# Events that are handled and emited when recieved from client
# This can be augumented to reduce / extend client functions
Player::clientEvents = ['pingRequest', 'gameRequest', 'gameQuick']
# - Private static attrs -
# Other events. Defined here to skip binding them to handlers one by one
Player::_events = ['disconnect']
Player::_lastID = 0
