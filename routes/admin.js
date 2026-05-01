const express = require('express')
const admin = require('../middleware/admin')
const User = require('../models/User')
const Panic = require('../models/Panic')
const Report = require('../models/Report')
const Guest = require('../models/Guest')
const Emergency = require('../models/Emergency')
const Info = require('../models/Info')
const Announcement = require('../models/Announcement')
const sendTelegram = require('../services/telegram')

const router = express.Router()

// ========== USERS ==========
// Get all users
router.get('/users', admin, async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get pending users (for approval)
router.get('/pending', admin, async (req, res) => {
  try {
    const pending = await User.find({ status: 'pending' }).select('-password')
    res.json(pending)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending users' })
  }
})

// Approve user
router.post('/approve', admin, async (req, res) => {
  try {
    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'Username required' })

    const user = await User.findOneAndUpdate(
      { username },
      { status: 'approved' },
      { returnDocument: 'after' }
    )

    if (!user) return res.status(404).json({ error: 'User not found' })

    await sendTelegram(`✅ User ${user.nama} (${user.no_hp}) telah disetujui`, 'admin')

    res.json({ message: 'User approved', user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve user' })
  }
})

// Delete user
router.delete('/user/:username', admin, async (req, res) => {
  try {
    const { username } = req.params
    const result = await User.deleteOne({ username })

    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' })

    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Suspend user
router.patch('/user/:username/suspend', admin, async (req, res) => {
  try {
    const { username } = req.params
    const user = await User.findOneAndUpdate(
      { username },
      { status: 'suspended' },
      { returnDocument: 'after' }
    )

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ message: 'User suspended', user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to suspend user' })
  }
})

// Unsuspend user
router.patch('/user/:username/unsuspend', admin, async (req, res) => {
  try {
    const { username } = req.params
    const user = await User.findOneAndUpdate(
      { username },
      { status: 'approved' },
      { returnDocument: 'after' }
    )

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ message: 'User unsuspended', user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsuspend user' })
  }
})

// ========== PANIC ==========
// Get panic logs
router.get('/panic', admin, async (req, res) => {
  try {
    const panics = await Panic.find().sort({ time: -1 }).limit(50)
    res.json(panics)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch panic logs' })
  }
})

// ========== REPORTS ==========
// Get all reports
router.get('/reports', admin, async (req, res) => {
  try {
    const reports = await Report.find().sort({ time: -1 }).limit(100)
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

// ========== GUESTS ==========
// Get all guests
router.get('/guests', admin, async (req, res) => {
  try {
    const guests = await Guest.find().sort({ time: -1 }).limit(100)
    res.json(guests)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guests' })
  }
})

// ========== EMERGENCIES ==========
// Get all emergencies
router.get('/emergencies', admin, async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ time: -1 }).limit(100)
    res.json(emergencies)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emergencies' })
  }
})

// ========== INFO ==========
// Get current info
router.get('/info', admin, async (req, res) => {
  try {
    const info = await Info.findOne().sort({ _id: -1 })
    res.json(info || { content: '' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch info' })
  }
})

// Update info
router.post('/info', admin, async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ error: 'Content required' })

    let info = await Info.findOne().sort({ _id: -1 })
    if (info) {
      info.content = content
      info.updatedAt = new Date()
      info = await info.save()
    } else {
      info = await Info.create({ content })
    }

    res.json({ message: 'Info updated', info })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update info' })
  }
})

// ========== ANNOUNCEMENTS ==========
// Get current announcement
router.get('/announcement', admin, async (req, res) => {
  try {
    const announcement = await Announcement.findOne().sort({ _id: -1 })
    res.json(announcement || { content: '' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcement' })
  }
})

// Update announcement
router.post('/announcement', admin, async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ error: 'Content required' })

    let announcement = await Announcement.findOne().sort({ _id: -1 })
    if (announcement) {
      announcement.content = content
      announcement.updatedAt = new Date()
      announcement = await announcement.save()
    } else {
      announcement = await Announcement.create({ content })
    }

    res.json({ message: 'Announcement updated', announcement })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update announcement' })
  }
})

module.exports = router