const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  nama: { type: String, required: true, trim: true },
  no_rumah: { type: String, unique: true, required: true },
  no_hp: { type: String, unique: true, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'suspended'] }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);