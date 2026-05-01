const mongoose = require('mongoose')

const infoSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.models.Info || mongoose.model('Info', infoSchema)
