const express = require('express')
const multer = require('multer')
const auth = require('../middleware/auth')
const Emergency = require('../models/Emergency')
const User = require('../models/User')
const sendTelegram = require('../services/telegram')
const upload = multer()
const router = express.Router()

// Emergency contacts
router.get('/contacts', auth, (req, res) => {
  const contacts = [
    { name: 'Satpam RT', phone: '081234567890', icon: '👮' },
    { name: 'Ambulans', phone: '118', icon: '🚑' },
    { name: 'Pemadam Kebakaran', phone: '113', icon: '🚒' },
    { name: 'Polisi', phone: '110', icon: '🚔' }
  ]
  res.json({ contacts })
})

// Send emergency alert
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { type, message } = req.body
    const user = req.user

    const emergency = await Emergency.create({
      username: user.username,
      type,
      message
    })

    await sendTelegram(
      `🚨 <b>DARURAT ${type.toUpperCase()}</b>\n\nDari: ${user.username}\nPesan: ${message}\nWaktu: ${new Date().toLocaleString('id-ID')}`,
      'both'
    )

    res.json({ message: 'Emergency alert sent', emergency })
  } catch (err) {
    console.error('Emergency error:', err)
    res.status(500).json({ error: err.message }) // ubah ini sementara
    // res.status(500).json({ error: 'Failed to send emergency alert' })
  }
})

// Get all emergencies (admin only)
router.get('/list', auth, async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ time: -1 }).limit(100)
    res.json(emergencies)
  } catch (err) {
    console.error('Emergency fetch error:', err)
    res.status(500).json({ error: err.message }) // ubah ini sementara
    // res.status(500).json({ error: 'Failed to fetch emergencies' })
  }
})

module.exports = router