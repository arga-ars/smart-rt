const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema)
