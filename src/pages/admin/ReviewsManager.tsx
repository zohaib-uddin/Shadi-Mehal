import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Star, Trash2, CheckCircle, XCircle, Search, Filter, Edit2, X, Save, AlertCircle } from 'lucide-react';
import { adminService, Review, Product, Service } from '../../lib/adminService';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editFormData, setEditFormData] = useState({
    user_name: '',
    comment: '',
    rating: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resReviews, resProducts, resServices] = await Promise.all([
        adminService.getReviews(),
        adminService.getProducts(),
        adminService.getServices()
      ]);
      setReviews(resReviews);
      setProducts(resProducts);
      setServices(resServices);
    } catch (err) {
      toast.error("Failed to load reviews data");
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (itemId: string, itemType: string) => {
    if (itemType === 'product') {
      return products.find(p => p.id === itemId)?.title || itemId;
    }
    return services.find(s => s.id === itemId)?.title || itemId;
  };

  const handleDelete = async (id: string) => {
    const review = reviews.find(r => r.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Review',
      message: `Are you sure you want to delete this review from "${review?.user_name || 'customer'}"?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteReview(id);
          setReviews(prev => prev.filter(r => r.id !== id));
          toast.success("Review deleted successfully");
        } catch (err) {
          toast.error("Failed to delete review");
        }
      }
    });
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    // ... rest of the function remains same, just fixing target content
    const loadingToast = toast.loading(`Updating review to ${status}...`);
    try {
      console.log(`ReviewsManager: Initiating status change for ID ${id} to ${status}`);
      const updatedRecord = await adminService.updateReviewStatus(id, status);
      
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: updatedRecord.status } : r));
      toast.success(`Review ${status} successfully`, { id: loadingToast });
    } catch (err: any) {
      console.error(`ReviewsManager Error:`, err);
      toast.error(err.message || `Failed to ${status} review`, { id: loadingToast });
    }
  };

  const handleEditClick = (review: Review) => {
    setConfirmModal({
      isOpen: true,
      title: 'Edit Review',
      message: `Are you sure you want to edit the review from "${review.user_name}"?`,
      type: 'info',
      onConfirm: () => {
        setEditingReview(review);
        setEditFormData({
          user_name: review.user_name,
          comment: review.comment,
          rating: review.rating
        });
        setIsEditModalOpen(true);
      }
    });
  };

  const handleUpdateReview = async () => {
    if (!editingReview?.id) return;
    const loadingToast = toast.loading("Updating review...");
    try {
      await adminService.updateReview(editingReview.id, editFormData);
      setReviews(prev => prev.map(r => r.id === editingReview.id ? { ...r, ...editFormData } : r));
      setIsEditModalOpen(false);
      toast.success("Review updated successfully", { id: loadingToast });
    } catch (err) {
       toast.error("Failed to update review", { id: loadingToast });
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const itemName = getItemName(review.item_id, review.item_type).toLowerCase();
    const user = review.user_name?.toLowerCase() || '';
    const matchesSearch = itemName.includes(searchQuery.toLowerCase()) || user.includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-serif italic text-slate-900">Client Reviews</h3>
          <p className="text-slate-400 text-sm mt-1">Moderate and manage customer feedback across products and services</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user or item..." 
              className="bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 w-64 md:w-80" 
            />
          </div>
          <div className="flex items-center gap-2 bg-white px-6 py-4 rounded-2xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-300" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm font-bold bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left min-w-[1000px] lg:min-w-0">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Reviewer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Item</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">feedback</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-10"><div className="h-6 bg-slate-100 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <MessageSquare className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-400 font-serif italic text-lg">No reviews found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReviews.map((review) => (
                <tr key={review.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-serif italic text-lg leading-none shrink-0">
                        {review.user_name?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{review.user_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{new Date(review.created_at || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{getItemName(review.item_id, review.item_type)}</p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary px-2 py-0.5 bg-primary/5 rounded-md mt-1 inline-block">
                        {review.item_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-primary fill-primary' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 max-w-xs">{review.comment}</p>
                  </td>
                  <td className="px-8 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      review.status === 'approved' ? 'bg-green-50 text-green-600' :
                      review.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {review.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(review)}
                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                        title="Edit Review"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {review.status !== 'approved' && (
                        <button 
                          onClick={() => handleStatusChange(review.id!, 'approved')}
                          className="p-2 text-slate-400 hover:text-green-500 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button 
                          onClick={() => handleStatusChange(review.id!, 'rejected')}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(review.id!)}
                        className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif italic text-slate-900">Edit Review</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Review ID: {editingReview?.id?.slice(0, 8)}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Reviewer Name</label>
                  <input 
                    type="text"
                    value={editFormData.user_name}
                    onChange={(e) => setEditFormData({ ...editFormData, user_name: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 px-8 outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Rating</label>
                  <div className="flex items-center gap-4">
                     {[1,2,3,4,5].map(star => (
                       <button 
                         key={star}
                         onClick={() => setEditFormData({ ...editFormData, rating: star })}
                         className="transition-all hover:scale-110"
                       >
                         <Star className={cn("w-8 h-8", star <= editFormData.rating ? "fill-primary text-primary" : "text-slate-100 hover:text-primary/30")} />
                       </button>
                     ))}
                     <span className="ml-4 text-xl font-serif italic text-slate-900">{editFormData.rating}/5</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Comment</label>
                  <textarea 
                    value={editFormData.comment}
                    onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 px-8 outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     onClick={() => setIsEditModalOpen(false)}
                     className="flex-1 py-5 border-2 border-slate-100 text-slate-400 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleUpdateReview}
                     className="flex-1 py-5 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
                   >
                     <Save className="w-4 h-4" />
                     Save Changes
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({...confirmModal, isOpen: false})}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
