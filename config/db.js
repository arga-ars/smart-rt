const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI not set - MongoDB disabled')
      return
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected successfully')
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed:', err.message)
    console.warn('Server starting without MongoDB')
    // Don't exit process
  }
}

module.exports = connectDB