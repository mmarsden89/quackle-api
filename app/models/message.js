const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toObject: {virtuals: true}
})

module.exports = mongoose.model('Message', messageSchema)
