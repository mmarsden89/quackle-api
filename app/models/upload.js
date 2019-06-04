const mongoose = require('mongoose')

const uploadSchema = new mongoose.Schema({
  title: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  tag: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  virtuals: true,
  timestamps: true
})

uploadSchema.virtual('username', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id'
})

module.exports = mongoose.model('Upload', uploadSchema)
