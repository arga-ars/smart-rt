const express = require('express')
const auth = require('../middleware/auth')
const Report = require('../models/Report')
const User = require('../models/User')
const sendTelegram = require('../services/telegram')

const router = express.Router()

const multer = require('multer')
const upload = multer() // pakai memory storage, tanpa simpan file// Submit report

router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    console.log('req.body:', req.body)      // cek data masuk
    
    // Handle both JSON and FormData
    const { category, description, location } = req.body
    const userData = await User.findById(req.user.id)

    const report = await Report.create({
      username: userData.username,
      category,
      description,
      location,
      photoUrl: null  // Optional: for future photo storage
    })

    await sendTelegram(
      `📢 <b>LAPORAN BARU</b>\n\nKategori: ${category}\nDeskripsi: ${description}\nLokasi: ${location}\nDari: ${userData.username}\nWaktu: ${new Date().toLocaleString('id-ID')}`,
      'admin'
    )

    res.json({ message: 'Report submitted successfully', report })
  } catch (err) {
    console.error('Report error:', err)     // <-- ini yang paling penting!
    res.status(500).json({ error: err.message })  // ubah ini sementara
    // res.status(500).json({ error: 'Failed to submit report' })
  }
})

// Get all reports (admin only) - pakai admin key
router.get('/admin', async (req, res) => {
  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const reports = await Report.find().sort({ time: -1 }).limit(100)
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

module.exports = router