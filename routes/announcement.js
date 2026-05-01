const express = require('express')
const auth = require('../middleware/auth')
const Announcement = require('../models/Announcement')
const router = express.Router()

// Get current announcement
router.get('/', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findOne().sort({ _id: -1 })
    res.json(announcement || { content: '' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcement' })
  }
})

module.exports = router
