const mongoose = require('mongoose')

const panicSchema = new mongoose.Schema({
  user: { type: String, required: true },
  nama: { type: String, required: true },
  no_rumah: String,
  no_hp: String,
  time: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Panic', panicSchema)