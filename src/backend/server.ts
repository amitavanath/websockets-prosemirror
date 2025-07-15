import { WebSocketServer } from 'ws'
import * as http from 'http'
import { setupWSConnection } from '@y/websocket-server/utils'

const server = http.createServer()
const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})

server.listen(4321, () => {
  console.log('Custom Yjs WebSocket server running on ws://localhost:4321')
})
