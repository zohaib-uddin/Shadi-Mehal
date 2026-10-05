import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Search, Trash2, Mail, Phone, Calendar, Inbox, AlertCircle } from 'lucide-react';
import { adminService, ContactMessage } from '../../lib/adminService';
import { cn } from '../../lib/utils';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

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
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await adminService.getMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Message',
      message: `Are you sure you want to delete the message from "${msg?.name || 'customer'}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteMessage(id);
          await loadMessages();
        } catch (error) {
          console.error("Failed to delete message", error);
        }
      }
    });
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
             [1,2].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-[40px]"></div>)
        ) : messages.map((msg, idx) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 group"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold uppercase text-lg">
                    {msg.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-serif italic text-slate-900 mb-1">{msg.name}</h4>
                    <div className="flex flex-wrap items-center gap-4">
                       <span className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest"><Mail className="w-3 h-3" /> {msg.email}</span>
                       <span className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest"><Phone className="w-3 h-3" /> {msg.phone || 'N/A'}</span>
                    </div>
                  </div>
               </div>
               <div className="flex flex-col items-end">
                   <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1">Received On</p>
                   <p className="text-sm font-bold text-slate-900">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'N/A'}</p>
               </div>
            </div>
            
            <div className="bg-slate-50/50 p-8 rounded-3xl mb-8">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-3">{msg.subject || 'Direct Inquiry'}</p>
                <p className="text-slate-600 font-medium leading-relaxed italic">
                    "{msg.message}"
                </p>
            </div>

            <div className="flex justify-end gap-2">
                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                    Reply via Email
                </button>
                <button onClick={() => handleDelete(msg.id!)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
          </motion.div>
        ))}
      </div>

       {messages.length === 0 && !loading && (
          <div className="py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
              <Inbox className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-serif italic text-slate-300">Your inbox is currently clear</h3>
          </div>
      )}
      
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
