const express = require('express')
const auth = require('../middleware/auth')
const Guest = require('../models/Guest')
const User = require('../models/User')
const sendTelegram = require('../services/telegram')

const router = express.Router()

// Submit guest entry
router.post('/', auth, async (req, res) => {
  try {
    const { guestName, guestPhone, purpose, houseNumber } = req.body
    const user = req.user

    const guest = await Guest.create({
      username: user.username,
      guestName,
      guestPhone,
      purpose,
      houseNumber
    })

    await sendTelegram(
      `🏠 <b>TAMU BARU</b>\n\nNama Tamu: ${guestName}\nNo HP: ${guestPhone}\nTujuan: ${purpose}\nKunjungi: ${houseNumber}\nDilaporkan oleh: ${user.username}\nWaktu: ${new Date().toLocaleString('id-ID')}`,
      'admin'
    )

    res.json({ message: 'Guest entry recorded', guest })
  } catch (err) {
    res.status(500).json({ error: 'Failed to record guest entry' })
  }
})

// Get all guests (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const guests = await Guest.find().sort({ time: -1 }).limit(100)
    res.json(guests)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guests' })
  }
})

module.exports = router