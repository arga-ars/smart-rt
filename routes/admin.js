const express = require('express')
const admin = require('../middleware/admin')
const User = require('../models/User')
const sendTelegram = require('../services/telegram')

const router = express.Router()

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
      { new: true }
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
      { new: true }
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
      { new: true }
    )

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ message: 'User unsuspended', user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsuspend user' })
  }
})

module.exports = router