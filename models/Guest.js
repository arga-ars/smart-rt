const mongoose = require('mongoose')

const guestSchema = new mongoose.Schema({
  username: { type: String, required: true },
  guestName: { type: String, required: true },
  guestPhone: String,
  purpose: { type: String, required: true },
  houseNumber: { type: String, required: true },
  photoUrl: String,
  time: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.models.Guest || mongoose.model('Guest', guestSchema)
