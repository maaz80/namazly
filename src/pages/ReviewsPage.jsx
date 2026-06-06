import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { HiOutlineArrowLeft, HiStar, HiOutlineChatAlt2, HiCheckCircle } from 'react-icons/hi';
import { getOptimizedAvatar } from '../utils/avatar';
import usePageMeta from '../hooks/usePageMeta';
import Footer from '../components/Footer';

/* Decorative background orbs */
const Background = () => (
  <>
    <div className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle at 20% 20%, #93c0a9 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle at 80% 80%, #3d8265 0%, transparent 65%)' }} />
    <div className="pointer-events-none fixed inset-0 opacity-[0.02]"
      style={{ backgroundImage: 'radial-gradient(#255342 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
  </>
);

export default function ReviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Page States
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');

  usePageMeta(
    'User Reviews & Feedback — Namazly',
    'Read what users say about Namazly Qaza Tracker, submit your star ratings, and help us improve with your feedback.',
    '/reviews'
  );

  // Fetch reviews on mount
  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/reviews');
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a review comment.');
      return;
    }
    if (!user && !guestName.trim()) {
      setError('Please provide your name.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        rating,
        comment: comment.trim(),
        guestName: !user ? guestName.trim() : undefined
      };
      
      const { data } = await api.post('/reviews', payload);
      if (data.success) {
        setReviews(prev => [data.review, ...prev]);
        setSuccess(true);
        setComment('');
        setGuestName('');
        setRating(0);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to calculate statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const starCounts = [0, 0, 0, 0, 0]; // index 0 = 1 star, 4 = 5 stars
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating - 1]++;
    }
  });

  return (
    <div className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(135deg, #e8f5ee 0%, #f5f0e8 60%, #eef2ee 100%)' }}>
      <Background />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors poppins-regular text-sm font-semibold cursor-pointer bg-transparent border-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <span className="poppins-regular text-lg font-bold gradient-text">User Reviews &amp; Feedback</span>
          
          <div className="w-10" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 flex-1 w-full flex flex-col space-y-8">
        
        {/* Header Block */}
        <section className="text-center space-y-2 animate-fade-in">
          {/* <span className="text-4xl">⭐</span> */}
          {/* <h1 className="poppins-regular text-3xl md:text-4xl font-bold text-sage-900 leading-tight">
            Share Your Experience
          </h1> */}
          <h1 className="poppins-regular text-4xl font-bold mt-2">
            Share Your <span className="gradient-text">Experience</span>
          </h1>
          <p className="poppins-regular text-sage-500 text-sm max-w-md mx-auto">
            Your feedback helps us make Namazly better for Muslims around the world. Rate us and share your suggestions!
          </p>
        </section>

        {/* Top Summary & Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Visual Rating Statistics (Left Column) */}
          <section className="lg:col-span-1 glass-card rounded-3xl p-6 shadow-md border border-white/80 h-full flex flex-col justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-center py-4 space-y-1">
              <h2 className="poppins-regular text-4xl font-black text-sage-950">
                {averageRating} <span className="text-xl text-sage-400 font-semibold">/ 5</span>
              </h2>
              
              {/* Average Stars */}
              <div className="flex items-center justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => {
                  const filled = star <= Math.round(Number(averageRating));
                  return (
                    <HiStar 
                      key={star} 
                      className={`w-5 h-5 ${filled ? 'text-amber-400' : 'text-sage-200'}`} 
                    />
                  );
                })}
              </div>
              
              <p className="poppins-regular text-xs text-sage-400 font-semibold pt-1">
                Based on {totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'}
              </p>
            </div>

            {/* Star Breakdown bars */}
            <div className="space-y-2.5 border-t border-sage-100/50 pt-4 mt-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = starCounts[star - 1];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="poppins-regular font-bold text-sage-700 w-3 text-right">{star}</span>
                    <HiStar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    
                    {/* Fill Bar */}
                    <div className="flex-1 h-2 rounded-full bg-white/40 overflow-hidden border border-white/60">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="poppins-regular font-semibold text-sage-400 w-6 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Review Submission Form (Right Column) */}
          <section className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 shadow-md border border-white/80 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <h2 className="poppins-regular text-lg font-bold text-sage-900 flex items-center gap-2 mb-4">
              <HiOutlineChatAlt2 className="text-xl text-sage-500" />
              Write a Review
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star selector */}
              <div className="space-y-1">
                <label className="poppins-regular text-xs font-semibold text-sage-500 block">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => {
                    const active = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none cursor-pointer bg-transparent border-0"
                        aria-label={`Rate ${star} out of 5 stars`}
                      >
                        <HiStar 
                          className={`w-8 h-8 transition-colors duration-150
                            ${active ? 'text-amber-400' : 'text-sage-200'}
                          `} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest Name input */}
              {!user && (
                <div className="space-y-1">
                  <label htmlFor="guest-name" className="poppins-regular text-xs font-semibold text-sage-500 block">Your Name</label>
                  <input
                    id="guest-name"
                    type="text"
                    placeholder="Enter your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-card-deep border border-white/70 text-xs focus:bg-white/80 focus:outline-none placeholder-sage-400"
                    maxLength={50}
                    required
                  />
                </div>
              )}

              {/* Logged in indicator */}
              {user && (
                <div className="flex items-center gap-3 bg-sage-50/40 border border-sage-100 rounded-xl p-3">
                  <img
                    src={getOptimizedAvatar(user.avatar, 64)}
                    onError={(e) => { e.currentTarget.src = '/icon-192.png'; }}
                    alt={user.name}
                    width="32"
                    height="32"
                    className="w-8 h-8 rounded-full border border-white"
                  />
                  <div>
                    <p className="poppins-regular text-xs font-bold text-sage-800 leading-none">{user.name}</p>
                    <p className="poppins-regular text-[10px] text-sage-400 mt-0.5">Posting from your Google Account</p>
                  </div>
                </div>
              )}

              {/* Comment text */}
              <div className="space-y-1">
                <label htmlFor="comment" className="poppins-regular text-xs font-semibold text-sage-500 block">Review</label>
                <textarea
                  id="comment"
                  rows={3}
                  placeholder="Tell us what you like about Namazly, or share suggestions for improvement..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card-deep border border-white/70 text-xs focus:bg-white/80 focus:outline-none placeholder-sage-400 leading-relaxed"
                  maxLength={500}
                  required
                />
              </div>

              {/* Status alerts */}
              {error && (
                <div className="text-xs text-rose-500 poppins-regular bg-rose-50/60 border border-rose-100 rounded-xl px-4 py-2.5">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="text-xs text-emerald-700 poppins-regular bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center gap-2 animate-fade-in">
                  <HiCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                  <span>JazakAllah! Your review has been submitted successfully.</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl poppins-regular text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 disabled:bg-sage-400 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>

            </form>
          </section>

        </div>

        {/* Reviews List Section (Bottom section) */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="poppins-regular text-lg font-bold text-sage-900 border-b border-sage-100/50 pb-2 flex items-center gap-2">
             Recent Reviews
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-sage-300 border-t-sage-600 animate-spin" />
              <p className="poppins-regular text-sage-500 text-xs">Loading reviews…</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center text-sage-500 poppins-regular text-sm border border-white/70">
              <p className="text-2xl mb-1">✍️</p>
              <p className="font-semibold">No reviews yet.</p>
              <p className="text-xs text-sage-400 mt-1">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(rev => {
                const dateStr = new Date(rev.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                
                // Details of reviewer
                const isGuest = !rev.user;
                const name = isGuest ? rev.guestName : rev.user.name;
                const avatar = isGuest ? null : rev.user.avatar;
                const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'G';

                return (
                  <div key={rev._id} className="glass-card rounded-2xl p-5 shadow-sm border border-white/70 flex flex-col justify-between gap-3 h-full animate-fade-in">
                    <div className="space-y-2">
                      
                      {/* Header (Stars & Date) */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <HiStar 
                              key={s} 
                              className={`w-4 h-4 ${s <= rev.rating ? 'text-amber-400' : 'text-sage-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="poppins-regular text-[10px] text-sage-400 font-semibold">{dateStr}</span>
                      </div>

                      {/* Comment text */}
                      <p className="poppins-regular text-xs text-sage-700 leading-relaxed italic select-text">
                        "{rev.comment}"
                      </p>

                    </div>

                    {/* Footer (User Avatar & Name) */}
                    <div className="flex items-center gap-2.5 border-t border-sage-100/30 pt-3">
                      {avatar ? (
                        <img 
                          src={getOptimizedAvatar(avatar, 64)} 
                          onError={(e) => { e.currentTarget.src = '/icon-192.png'; }}
                          alt={name}
                          width="28"
                          height="28"
                          className="w-7 h-7 rounded-full border border-white object-cover shadow-sm bg-sage-50"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sage-500 to-sage-600 text-white flex items-center justify-center font-bold text-[9px] poppins-regular shadow-sm border border-white/80">
                          {initials}
                        </div>
                      )}
                      <div>
                        <p className="poppins-regular text-xs font-bold text-sage-800 leading-tight">{name}</p>
                        <p className="poppins-regular text-[9px] text-sage-400">{isGuest ? 'Guest user' : 'Verified user'}</p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
