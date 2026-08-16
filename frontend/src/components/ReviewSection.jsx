import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config/api';

const ReviewSection = ({ productId }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to leave a review');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId, rating, comment })
      });
      const data = await res.json();

      if (res.ok) {
        setComment('');
        setRating(5);
        fetchReviews(); // refresh list to show the new review
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{ color: '#f97316', marginBottom: '15px' }}>Customer Reviews</h3>

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: '#a1a1aa' }}>No reviews yet. Be the first to review this product!</p>
      ) : (
        <div style={{ marginBottom: '30px' }}>
          {reviews.map((review) => (
            <div key={review._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '15px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{review.name}</strong>
                <span style={{ color: '#f97316' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <p style={{ color: '#d4d4d8', marginTop: '5px' }}>{review.comment}</p>
              <small style={{ color: '#71717a' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <h4>Write a Review</h4>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '4px' }}
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Average</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Terrible</option>
          </select>
          <textarea
            placeholder="Share your thoughts about this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={3}
            style={{ width: '100%', padding: '10px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '4px', marginBottom: '10px' }}
          />
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewSection;