const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Worker is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'rejected'],
      message: 'Status must be pending, accepted, or rejected'
    },
    default: 'pending'
  },
  message: {
    type: String,
    maxLength: [500, 'Message cannot exceed 500 characters'],
    default: ''
  },
  roleAppliedFor: {
    type: String,
    required: [true, 'Role applied for is required']
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  // Assignment fields
  assignedRole: {
    type: String,
    default: ''
  },
  shiftNotes: {
    type: String,
    default: ''
  },
  assigned: {
    type: Boolean,
    default: false
  },
  assignedAt: {
    type: Date
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate applications
applicationSchema.index({ worker: 1, event: 1 }, { unique: true });

// Index for worker queries
applicationSchema.index({ worker: 1, status: 1 });

// Index for event queries
applicationSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);