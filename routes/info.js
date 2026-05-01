const express = require('express')
const auth = require('../middleware/auth')
const Info = require('../models/Info')

const router = express.Router()

// Get RT information
router.get('/', auth, async (req, res) => {
  try {
    const info = await Info.findOne().sort({ _id: -1 })
    
    // Fallback to default if no info in database
    if (!info) {
      return res.json({
        content: 'Selamat datang di Smart RT. Belum ada informasi yang ditampilkan.'
      })
    }
    
    res.json(info)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch info' })
  }
})

module.exports = router