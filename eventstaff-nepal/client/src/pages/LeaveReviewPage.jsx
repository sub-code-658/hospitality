import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';

export default function LeaveReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const revieweeId = searchParams.get('revieweeId');
  const eventId = searchParams.get('eventId');
  const revieweeName = searchParams.get('revieweeName') || 'Unknown';

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!revieweeId || !eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <p className="font-serif text-xl" style={{ color: 'var(--crimson)' }}>Invalid review link</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Missing required parameters. Please use the link from your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      addToast('Please select a star rating', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reviews', { revieweeId, eventId, rating, comment });
      addToast('Review submitted!', 'success');
      navigate(-1);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hovered || rating;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="card p-8 max-w-lg w-full animate-slide-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <span style={{ color: 'var(--flame)', fontSize: '1.2rem' }}>◆</span>
          <h1 className="font-serif text-3xl text-white mt-3">Leave a Review</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            for <span style={{ color: 'var(--gold)' }}>{decodeURIComponent(revieweeName)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Rating
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    fontSize: '2rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: star <= displayRating ? 'var(--gold)' : 'var(--text-dim, rgba(237,232,224,0.2))',
                    transition: 'color 0.15s, transform 0.1s',
                    transform: star <= displayRating ? 'scale(1.15)' : 'scale(1)',
                    padding: '0 0.1rem',
                  }}
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Comment <span style={{ color: 'var(--text-dim, rgba(237,232,224,0.2))' }}>(optional)</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Share your experience..."
              className="input-field w-full resize-none"
              style={{ fontFamily: 'inherit' }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
              {comment.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
