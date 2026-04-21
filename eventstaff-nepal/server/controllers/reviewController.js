const Review = require('../models/Review');
const Application = require('../models/Application');
const Event = require('../models/Event');

// Create a review
exports.createReview = async (req, res, next) => {
  try {
    const { revieweeId, eventId, rating, comment } = req.body;

    // Validate rating
    if (![1, 2, 3, 4, 5].includes(rating)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user had an accepted application for this event
    const application = await Application.findOne({
      worker: req.user.id,
      event: eventId,
      status: 'accepted'
    });

    // If reviewer is a worker, they need to have worked at the event
    // If reviewer is an organizer, they need to have hired the worker
    if (req.user.role === 'worker' && !application) {
      return res.status(400).json({
        message: 'You can only review events you have worked at'
      });
    }

    // Check if organizer reviewed this worker for this event
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      reviewee: revieweeId,
      event: eventId
    });
    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this user for this event'
      });
    }

    const review = new Review({
      reviewer: req.user.id,
      reviewee: revieweeId,
      event: eventId,
      rating,
      comment: comment || ''
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .populate('event', 'title');

    res.status(201).json(populatedReview);
  } catch (error) {
    next(error);
  }
};

// Get reviews for a user
exports.getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount] = await Promise.all([
      Review.find({ reviewee: userId })
        .populate('reviewer', 'name avatar')
        .populate('event', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ reviewee: userId })
    ]);

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: totalCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews by event
exports.getEventReviews = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const reviews = await Review.find({ event: eventId })
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};