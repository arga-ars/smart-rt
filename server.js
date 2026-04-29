require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const connectDB = require('./config/db')
const mqttClient = require('./services/mqtt')
const sendTelegram = require('./services/telegram')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { 
  cors: { origin: process.env.ALLOWED_ORIGINS || '*' }
})

connectDB()

app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }))
app.use(express.json())
app.use(express.static('public'))

// Routes
app.use('/auth', require('./routes/auth'))
app.use('/panic', require('./routes/panic'))
app.use('/admin', require('./routes/admin'))

// realtime
mqttClient.on('message', (topic, message) => {
  if (mqttClient.connected) {
    try {
      const data = JSON.parse(message.toString())
      io.emit('panic', data)
    } catch (err) {
      console.error('Failed to parse MQTT message:', err.message)
    }
  }
})

server.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`)
})
