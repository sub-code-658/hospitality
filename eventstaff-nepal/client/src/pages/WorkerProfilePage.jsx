import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/ui/Badge';

export default function WorkerProfilePage() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorker();
    fetchReviews();
  }, [id]);

  const fetchWorker = async () => {
    try {
      const res = await api.get(`/auth/user/${id}`);
      setWorker(res.data);
    } catch (error) {
      console.error('Failed to fetch worker');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/user/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error('Failed to fetch reviews');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-white/60 text-lg">Worker not found</p>
      </div>
    );
  }

  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.reviews?.filter(r => r.rating === stars).length || 0;
    const percentage = reviews.totalReviews > 0 ? (count / reviews.totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="glass-card overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700/80 to-primary-600/80 p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary-500/30 flex items-center justify-center">
              <span className="text-4xl text-primary-200 font-bold">
                {worker.name?.charAt(0) || 'W'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{worker.name}</h1>
                {worker.isVerified && (
                  <span className="text-primary-300 text-xl" title="Verified">✓</span>
                )}
              </div>
              <p className="text-white/70 mb-3">
                {worker.role === 'organizer' ? 'Event Organizer' : 'Hospitality Worker'}
              </p>
              {worker.bio && (
                <p className="text-white/80 text-sm max-w-2xl">{worker.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-white mb-1">{reviews.averageRating || 0}</div>
              <StarRating rating={Math.round(reviews.averageRating)} />
              <div className="text-white/50 text-sm mt-1">{reviews.totalReviews} reviews</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-white mb-1">{worker.skills?.length || 0}</div>
              <div className="text-white/50 text-sm">Skills</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-white mb-1">{worker.experience || 'N/A'}</div>
              <div className="text-white/50 text-sm">Experience</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {worker.totalReviews || 0}
              </div>
              <div className="text-white/50 text-sm">Jobs Done</div>
            </div>
          </div>

          {/* Skills */}
          {worker.skills && worker.skills.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill, idx) => (
                  <span key={idx} className="bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm border border-primary-400/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rating Breakdown */}
          {reviews.totalReviews > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-white mb-4">Rating Breakdown</h3>
              <div className="glass p-6 rounded-xl">
                {ratingBreakdown.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-3 mb-2">
                    <span className="text-white/70 w-12">{stars} ★</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-white/50 text-sm w-12">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
            {reviews.reviews?.length === 0 ? (
              <p className="text-white/50 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.reviews?.map(review => (
                  <div key={review._id} className="glass p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center">
                          <span className="text-primary-200 font-semibold">
                            {review.reviewer?.name?.charAt(0) || 'R'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{review.reviewer?.name}</p>
                          <p className="text-white/40 text-sm">{review.event?.title}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-white/70 text-sm mt-2">{review.comment}</p>
                    )}
                    <p className="text-white/30 text-xs mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}