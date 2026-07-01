const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Worker is required']
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Application is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['esewa', 'khalti'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    sparse: true,
    unique: true
  },
  refId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for rapid query on dashboards
paymentSchema.index({ organizer: 1 });
paymentSchema.index({ worker: 1 });
paymentSchema.index({ event: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
