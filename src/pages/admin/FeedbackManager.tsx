import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Star, Trash2, CheckCircle, Search, Filter, Edit2, X, Save } from 'lucide-react';
import { adminService, Feedback, STATIC_FEEDBACK } from '../../lib/adminService';
import { cn } from '../../lib/utils';

export default function FeedbackManager() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editFormData, setEditFormData] = useState({
    user_name: '',
    comment: '',
    rating: 5,
    location: ''
  });

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFeedback();
      setFeedback(data);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: Feedback) => {
    setEditingFeedback(item);
    setEditFormData({
      user_name: item.user_name || '',
      comment: item.comment || '',
      rating: item.rating || 5,
      location: item.location || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateFeedback = async () => {
    if (!editingFeedback?.id) return;
    try {
      await adminService.updateFeedback(editingFeedback.id, editFormData);
      setFeedback(prev => prev.map(f => f.id === editingFeedback.id ? { ...f, ...editFormData } : f));
      setIsEditModalOpen(false);
    } catch (err) {
       console.error("Failed to update feedback", err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.updateFeedbackStatus(id, 'approved');
      loadFeedback();
    } catch (e) {
      console.error("Approval failed", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await adminService.deleteFeedback(id); 
      loadFeedback();
    } catch (e) {
      console.error("Deletion failed", e);
    }
  };

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between">
         <div>
            <h3 className="text-3xl font-serif italic text-slate-900">Feedback & Reviews</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Manage customer voices and featured testimonials</p>
         </div>
         <div className="flex gap-4">
             <div className="flex items-center gap-1 text-primary pr-6 border-r border-slate-200">
                <Star className="w-5 h-5 fill-primary" />
                <span className="text-xl font-serif italic text-slate-900">4.9</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Avg Rating</span>
             </div>
             <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                <Filter className="w-5 h-5" />
             </button>
         </div>
      </div>

      {/* Static Reviews Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
            <div className="h-px flex-grow bg-slate-100" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Featured (Static) Reviews</span>
            <div className="h-px flex-grow bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATIC_FEEDBACK.map((r, i) => (
            <motion.div 
              key={r.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-white border border-slate-100 rounded-[30px] shadow-sm relative group hover:border-primary/50 transition-all flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.user_name}`} alt="" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-wider mb-0.5 truncate">{r.user_name}</h4>
                  <p className="text-primary text-[8px] font-black uppercase tracking-widest">{r.location}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className={cn("w-2.5 h-2.5", idx < r.rating ? "fill-primary text-primary" : "text-slate-100")} />
                ))}
              </div>
              <p className="text-slate-500 text-xs font-medium leading-relaxed italic flex-grow">"{r.comment}"</p>
              {/* <div className="absolute top-4 right-4 bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Static</div> */}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Feedback Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
            <div className="h-px flex-grow bg-slate-100" />
            {/* <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Customer Submissions (Live)</span> */}
            <div className="h-px flex-grow bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
               [1,2].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-[40px]"></div>)
          ) : feedback.map((item, idx) => (
            <motion.div 
              key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 group"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold uppercase">
                    {item.user_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.user_name || 'Anonymous Client'}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{item.location || 'Attock, Pakistan'}</p>
                  </div>
               </div>
               <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={cn("w-3 h-3", s <= (item.rating || 5) ? "fill-primary text-primary" : "text-slate-200")} />
                  ))}
               </div>
            </div>
            
            <p className="text-slate-500 text-lg font-serif italic leading-relaxed mb-8">
                "{item.comment || 'The decoration exceeded our expectations.'}"
            </p>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest leading-none">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                </span>
                <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition-all"
                      title="Edit Feedback"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleApprove(item.id!)}
                      disabled={item.status === 'approved'}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        item.status === 'approved' ? "bg-green-500 text-white" : "bg-slate-50 text-slate-400 hover:text-green-500"
                      )} 
                      title={item.status === 'approved' ? "Approved" : "Approve to Public"}
                    >
                        <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all font-bold"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

        {/* {feedback.length === 0 && !loading && (
          <div className="py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
              <MessageSquare className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-serif italic text-slate-300">No client feedback recorded yet</h3>
          </div>
      )} */}

      <FeedbackEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleUpdateFeedback}
      />
    </div>
  );
}

const FeedbackEditModal = ({ isOpen, onClose, formData, setFormData, onSave }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-2xl font-serif italic text-slate-900">Edit Feedback</h3>
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-10 space-y-8">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Client Name</label>
              <input 
                type="text"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl py-5 px-8 outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Client Location</label>
              <input 
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl py-5 px-8 outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Rating</label>
              <div className="flex items-center gap-4">
                 {[1,2,3,4,5].map(star => (
                   <button 
                     key={star}
                     onClick={() => setFormData({ ...formData, rating: star })}
                     className="transition-all hover:scale-110"
                   >
                     <Star className={cn("w-8 h-8", star <= formData.rating ? "fill-primary text-primary" : "text-slate-100 hover:text-primary/30")} />
                   </button>
                 ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Comment</label>
              <textarea 
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                className="w-full bg-slate-50 border-none rounded-2xl py-5 px-8 outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
               <button 
                 onClick={onClose}
                 className="flex-1 py-5 border-2 border-slate-100 text-slate-400 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
               >
                 Cancel
               </button>
               <button 
                 onClick={onSave}
                 className="flex-1 py-5 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
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
);
