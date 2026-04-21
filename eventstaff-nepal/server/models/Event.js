const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 1
  },
  payPerHour: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  rolesNeeded: {
    type: [roleSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one role is required'
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'closed', 'cancelled'],
      message: 'Status must be active, closed, or cancelled'
    },
    default: 'active'
  },
  coordinates: {
    lat: {
      type: Number,
      default: 27.7172 // Kathmandu latitude
    },
    lng: {
      type: Number,
      default: 85.3240 // Kathmandu longitude
    }
  },
  totalPositions: {
    type: Number,
    default: 0
  },
  filledPositions: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for geographic queries
eventSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

// Index for status and date queries
eventSchema.index({ status: 1, eventDate: 1 });

// Index for organizer queries
eventSchema.index({ organizer: 1 });

// Virtual for checking if event is filled
eventSchema.virtual('isFilled').get(function() {
  return this.filledPositions >= this.totalPositions;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);