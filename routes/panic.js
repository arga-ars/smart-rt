const express = require('express')
const auth = require('../middleware/auth')
const Panic = require('../models/Panic')
const User = require('../models/User')
const mqttClient = require('../services/mqtt')
const sendTelegram = require('../services/telegram')

const router = express.Router()

router.post('/', auth, async (req, res) => {
  try {
    const { username } = req.user

    // Get user data to fetch nama
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Akun Anda telah di-suspend dan tidak dapat mengirim panic alert.' })
    }

    const payload = {
      user: username,
      nama: user.nama,
      no_rumah: user.no_rumah,
      no_hp: user.no_hp,
      time: new Date()
    }

    await Panic.create(payload)

    mqttClient.publish('rt/panic', JSON.stringify(payload))

    // Send Telegram alert
    await sendTelegram(
      `🚨 <b>PANIC ALERT</b>\n\nNama: ${user.nama}\nNo Rumah: ${user.no_rumah}\nNo HP: ${user.no_hp}\nWaktu: ${new Date().toLocaleString('id-ID')}`,
      'both'
    )

    res.json({ message: 'Panic sent' })
  } catch (err) {
    console.error('Panic error:', err.message)
    res.status(500).json({ error: 'Failed to send panic' })
  }
})

module.exports = router