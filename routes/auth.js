const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const sendTelegram = require('../services/telegram')

const router = express.Router()

// Check if dev mode is enabled
router.get('/dev-check', (req, res) => {
  const devMode = process.env.DEV_MODE === 'true' && process.env.NODE_ENV !== 'production';
  res.json({ devMode });
});

router.post('/register', async (req, res) => {
  try {
    let { username, password, nama, no_rumah, no_hp } = req.body

    if (!username || !password || !nama || !no_hp) {
      return res.json({ error: 'Semua field wajib diisi' })
    }

    if (password.length < 6) {
      return res.json({ error: 'Password minimal 6 karakter' })
    }

    if (no_hp.startsWith('0')) {
      no_hp = '+62' + no_hp.slice(1)
    }

    const existing = await User.findOne({ username })
    if (existing) return res.json({ error: 'Username sudah terdaftar' })

    const existingPhone = await User.findOne({ no_hp })
    if (existingPhone) return res.json({ error: 'No HP sudah terdaftar' })

    const existingHouse = await User.findOne({ no_rumah })
    if (existingHouse) return res.json({ error: 'No Rumah sudah terdaftar' })

    const hashed = await bcrypt.hash(password, 10)

    const newUser = await User.create({ username, password: hashed, nama, no_rumah, no_hp })

    // Send Telegram notification to admin
    await sendTelegram(
      `📝 <b>PENDAFTARAN WARGA BARU</b>\n\nUsername: ${username}\nNama: ${nama}\nNo Rumah: ${no_rumah}\nNo HP: ${no_hp}\nWaktu: ${new Date().toLocaleString('id-ID')}`,
      'admin'
    )

    res.json({ message: 'Register berhasil, tunggu verifikasi' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) return res.json({ error: 'User tidak ditemukan' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.json({ error: 'Password salah' })

    if (user.status === 'pending') {
      return res.json({ error: 'Akun belum aktif' })
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({ token, user: user.username, nama: user.nama, status: user.status })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router