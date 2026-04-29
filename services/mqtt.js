const mqtt = require('mqtt')

const client = mqtt.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  reconnectPeriod: 5000,
  connectTimeout: 10000,
  will: { topic: 'rt/status', payload: 'offline' }
})

client.on('connect', () => {
  console.log('✅ MQTT connected')
  client.subscribe('rt/panic', (err) => {
    if (err) console.error('MQTT subscribe error:', err)
    else console.log('Subscribed to rt/panic')
  })
})

client.on('reconnect', () => {
  console.log('🔄 MQTT reconnecting...')
})

client.on('error', (err) => {
  console.warn('⚠️ MQTT error:', err.message, '- Server running without MQTT')
})

client.on('disconnect', () => {
  console.log('⚠️ MQTT disconnected')
})

module.exports = client