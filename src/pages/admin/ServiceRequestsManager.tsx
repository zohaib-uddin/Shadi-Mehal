import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Search, 
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function ServiceRequestsManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      toast.error("Failed to fetch requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Update Request Status',
      message: `Are you sure you want to mark this request as "${status}"?`,
      type: status === 'rejected' ? 'danger' : 'info',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('service_requests')
            .update({ status })
            .eq('id', id);
          
          if (error) throw error;
          setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
          toast.success(`Request marked as ${status}`);
        } catch (err: any) {
          toast.error("Failed to update status: " + err.message);
        }
      }
    });
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && r.status === filterStatus;
  });

  if (loading) {
    return <div className="p-20 text-center font-serif italic text-slate-400">Retrieving dossiers...</div>;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-slate-900 leading-tight">Service Orchestrations</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Manage bespoke event inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[30px] border border-slate-50 shadow-xl shadow-slate-100/50">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
           <input 
              type="text"
              placeholder="Search by client, service or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
           />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-14 pl-14 pr-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-xs font-black uppercase tracking-widest appearance-none"
              >
                <option value="all">All States</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Engaged</option>
                <option value="rejected">Archived</option>
              </select>
           </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border border-slate-50">
             <Clock className="w-12 h-12 text-slate-100 mx-auto mb-6" />
             <p className="text-slate-400 font-serif italic">No orchestration requests found matching your query.</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div 
              layout
              key={request.id}
              className={cn(
                "bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden transition-all duration-500",
                expandedId === request.id ? "ring-2 ring-primary/20" : ""
              )}
            >
              <div 
                className="p-8 cursor-pointer group"
                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[22px] bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-black transition-all">
                       <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif italic text-slate-900 mb-1">{request.service_name}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {request.user_name}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {request.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                     <div className="text-right hidden sm:block">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Estimated Budget</div>
                        <div className="text-lg font-serif italic text-slate-900">Rs. {Number(request.estimated_price).toLocaleString()}</div>
                     </div>

                     <div className={cn(
                       "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                       request.status === 'pending' ? "bg-amber-50 text-amber-500 border-amber-100" :
                       request.status === 'approved' ? "bg-green-50 text-green-500 border-green-100" :
                       "bg-slate-50 text-slate-400 border-slate-100"
                     )}>
                       {request.status}
                     </div>

                     <div className="text-slate-300 transition-transform duration-500">
                        {expandedId === request.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                     </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === request.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-50"
                  >
                    <div className="p-10 bg-slate-50/50 grid grid-cols-1 lg:grid-cols-3 gap-12">
                       <div className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-slate-200 pb-4">Client Dossier</h4>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 group/item">
                              <User className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />
                              <span className="text-sm font-medium">{request.user_name}</span>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                              <Phone className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />
                              <span className="text-sm font-medium">{request.user_phone}</span>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                              <MessageCircle className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />
                              <button 
                                onClick={() => {
                                  let cleanPhone = request.user_phone.replace(/\D/g, '');
                                  if (cleanPhone.startsWith('0')) {
                                    cleanPhone = '92' + cleanPhone.substring(1);
                                  } else if (!cleanPhone.startsWith('92')) {
                                    cleanPhone = '92' + cleanPhone;
                                  }
                                  window.open(`https://wa.me/${cleanPhone}`, '_blank');
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                              >
                                Reach via WhatsApp
                              </button>
                            </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-slate-200 pb-4">Event Blueprint</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white">
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</span>
                               <span className="text-sm font-bold text-slate-900">{request.event_type}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white">
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Venue</span>
                               <span className="text-sm font-bold text-slate-900">{request.location}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white">
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scale</span>
                               <span className="text-sm font-bold text-slate-900">{request.guests_count} Guests</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white">
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline</span>
                               <span className="text-sm font-bold text-slate-900">{new Date(request.event_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-slate-200 pb-4">Artistic Notes</h4>
                          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-600 italic leading-relaxed min-h-[100px]">
                            {request.notes || "No special instructions captured."}
                          </div>
                          
                          <div className="flex gap-4 pt-4">
                             <button 
                                onClick={() => updateStatus(request.id, 'approved')}
                                className="flex-1 h-14 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                             >
                                <CheckCircle className="w-4 h-4" /> Approve
                             </button>
                             <button 
                                onClick={() => updateStatus(request.id, 'rejected')}
                                className="flex-1 h-14 border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                             >
                                <XCircle className="w-4 h-4" /> Decline
                             </button>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

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
