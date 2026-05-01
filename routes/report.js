const express = require('express')
const auth = require('../middleware/auth')
const Report = require('../models/Report')
const User = require('../models/User')
const sendTelegram = require('../services/telegram')

const router = express.Router()

// Submit report
router.post('/', auth, async (req, res) => {
  try {
    // Handle both JSON and FormData
    const { category, description, location } = req.body
    const user = req.user
    const userData = await User.findById(req.user.id)

    const report = await Report.create({
      username: user.username,
      category,
      description,
      location,
      photoUrl: null  // Optional: for future photo storage
    })

    await sendTelegram(
      `📢 <b>LAPORAN BARU</b>\n\nKategori: ${category}\nDeskripsi: ${description}\nLokasi: ${location}\nDari: ${user.username}\nWaktu: ${new Date().toLocaleString('id-ID')}`,
      'admin'
    )

    res.json({ message: 'Report submitted successfully', report })
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit report' })
  }
})

// Get all reports (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find().sort({ time: -1 }).limit(100)
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

module.exports = router