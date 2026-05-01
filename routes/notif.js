const express = require('express')
const auth = require('../middleware/auth')
const Panic = require('../models/Panic')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const panics = await Panic.find().sort({ createdAt: -1 }).limit(10)

    const notifications = panics.map((panic) => ({
      message: `🚨 Panic alert dari ${panic.nama} (${panic.no_rumah}) pada ${new Date(panic.time).toLocaleString('id-ID')}`,
      action: 'Tandai Dibaca'
    }))

    res.json({ notifications })
  } catch (err) {
    console.error('Notif error:', err.message)
    res.status(500).json({ error: 'Gagal memuat notifikasi' })
  }
})

module.exports = router
