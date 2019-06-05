const mongoose = require('mongoose')

const uploadSchema = new mongoose.Schema({
  description: {
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
  },
  likes: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toObject: {virtuals: true}
})

uploadSchema.virtual('username', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id'
})

uploadSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'picture'
})

module.exports = mongoose.model('Upload', uploadSchema)
