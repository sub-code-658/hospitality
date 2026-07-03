const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Worker ID is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer ID is required']
  },
  message: {
    type: String,
    maxLength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'declined'],
      message: 'Status must be pending, accepted, or declined'
    },
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
invitationSchema.index({ event: 1, worker: 1 }, { unique: true }); // Prevent duplicate invitations
invitationSchema.index({ worker: 1, status: 1 });
invitationSchema.index({ organizer: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
