const mongoose = require('mongoose')

const emergencySchema = new mongoose.Schema({
  username: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  photoUrl: String,
  time: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.models.Emergency || mongoose.model('Emergency', emergencySchema)
