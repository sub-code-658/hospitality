const mongoose = require('mongoose');
const User = require('./User');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxLength: [500, 'Comment cannot exceed 500 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate reviews
reviewSchema.index({ reviewer: 1, reviewee: 1, event: 1 }, { unique: true });

// Index for user reviews queries
reviewSchema.index({ reviewee: 1, createdAt: -1 });

// Index for event reviews queries
reviewSchema.index({ event: 1 });

// Post-save hook to update reviewee's average rating
reviewSchema.post('save', async function(doc) {
  try {
    const reviews = await mongoose.model('Review').find({ reviewee: doc.reviewee });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await mongoose.model('User').findByIdAndUpdate(doc.reviewee, {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
});

// Post-remove hook to recalculate rating
reviewSchema.post('remove', async function(doc) {
  try {
    const reviews = await mongoose.model('Review').find({ reviewee: doc.reviewee });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await mongoose.model('User').findByIdAndUpdate(doc.reviewee, {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error updating user rating after remove:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);