const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  username: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: String,
  photoUrl: String,
  time: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema)
