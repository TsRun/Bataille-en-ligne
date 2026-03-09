import { io } from 'socket.io-client'

const serverUrl = import.meta.env.PROD ? '' : 'http://localhost:3001'

const socket = io(serverUrl, { autoConnect: false })

export default socket
