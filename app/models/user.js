const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true
  },
  profile: {
    type: String,
    default: 'https://unclogwarrior.s3.amazonaws.com/blank-profile-picture.png'
  },
  following: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  }],
  hashedPassword: {
    type: String,
    required: true
  },
  token: String
}, {
  timestamps: true,
  toObject: {
    // remove `hashedPassword` field when we call `.toObject`
    transform: (_doc, user) => {
      delete user.hashedPassword
      return user
    }
  }
})

module.exports = mongoose.model('User', userSchema)
