import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, CheckCircle2, User, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService, Review } from '../lib/adminService';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ReviewSectionProps {
  itemId: string;
  itemType: 'product' | 'service';
}

export default function ReviewSection({ itemId, itemType }: ReviewSectionProps) {
  const { user, userData } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkEligibility();
    }
  }, [itemId, user]);

  const fetchReviews = async () => {
    try {
      const data = await adminService.getApprovedReviews(itemId);
      // Filter for this specific item if table doesn't already filter
      setReviews(data.filter((r: any) => r.item_id === itemId) as any);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) return;
    try {
      const purchased = await adminService.checkPurchaseStatus(user.id, itemId);
      setCanReview(purchased);
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await adminService.submitReview({
        item_id: itemId,
        item_type: itemType,
        user_id: user.id,
        user_name: userData?.name || user.email?.split('@')[0] || 'Anonymous',
        rating: formData.rating,
        comment: formData.comment,
        status: 'pending'
      });
      
      toast.success("Thank you for your review!");
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-12 py-16 border-t border-slate-50">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            <span className="w-8 h-[1px] bg-primary"></span>
            Guest Experiences
          </div>
          <h2 className="text-4xl font-semibold text-slate-900">Client Reviews</h2>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-center border-r border-slate-100 pr-6">
              <div className="text-3xl font-semibold text-slate-900">{averageRating}</div>
              <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Average</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.round(Number(averageRating)) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                Based on {reviews.length} reviews
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form Trigger */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-8 rounded-[40px] border-2 border-dashed transition-all ${
            canReview 
            ? "border-primary/20 bg-primary/5 shadow-inner" 
            : "border-slate-100 bg-slate-50/50"
          }`}>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {canReview ? "Bought this?" : "Verified Purchase Only"}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-8">
              {canReview 
                ? "Your feedback helps other clients choose the best decorations for their special day. Share your thoughts!"
                : "To maintain the integrity of our community, only verified customers who have purchased this item can leave a review."
              }
            </p>

            {canReview && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
              >
                Write a Review
                <Star className="w-4 h-4 fill-current" />
              </button>
            )}
            
            {!user && (
              <Link
                to="/auth"
                className="inline-block text-[10px] font-black uppercase tracking-widest text-primary underline"
              >
                Log in to review
              </Link>
            )}
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-primary/5 space-y-6"
              >
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Rating</label>
                  <div className="flex gap-2 ml-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          formData.rating >= star 
                          ? "bg-primary text-black" 
                          : "bg-slate-50 text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <Star className={`w-5 h-5 ${formData.rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Your Experience</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 shadow-sm resize-none"
                    placeholder="Tell us what you liked..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Review"}
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-red-500 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-slate-50 rounded-[40px] animate-pulse"></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-slate-50/50 rounded-[40px] p-20 text-center border-2 border-dashed border-slate-100">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Be the first to share your experience
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={review.id}
                  className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{review.user_name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Verified Client</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-primary fill-current' : 'text-slate-100'}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-300 tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(review.created_at || '').toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 font-medium leading-relaxed font-bold">
                    "{review.comment}"
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
