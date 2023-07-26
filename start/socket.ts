import Ws from 'App/Services/Ws'
import authSocket from 'App/Services/AuthSocket'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.use(authSocket)


// Ws.io.on('connection', (socket) => {
//   socket.emit('news', { hello: 'world' })

//   socket.on('my other event', (data) => {
//     console.log(data)
//   })
// })
