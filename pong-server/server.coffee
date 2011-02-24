server = require('http').createServer (request, response) ->
  response.writeHead 200, {'Content-Type': 'text/plain'}
  response.end 'Hello World'

server.listen 8080
console.log 'Server running at http://127.0.0.1:8080/'
