import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, MoreVertical, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { adminService } from '../../lib/adminService';
import { Link } from 'react-router-dom';

export default function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
         <h3 className="text-2xl md:text-3xl font-serif italic text-slate-900">Client Directory</h3>
         <div className="flex items-center gap-4">
             <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input placeholder="Search users..." className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5" />
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
             [1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-[40px]"></div>)
        ) : users.map((user, idx) => (
          <motion.div 
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 group hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-900 font-serif italic text-2xl group-hover:bg-primary group-hover:text-black transition-all">
                    {user.name?.[0] || 'U'}
                </div>
                <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">{user.role}</span>
            </div>
            
            <h4 className="text-2xl font-serif italic text-slate-900 mb-4">{user.name || 'Anonymous User'}</h4>
            
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-bold truncate">{user.email}</span>
                </div>
                {user.phone && (
                    <div className="flex items-center gap-3 text-slate-400">
                        <Phone className="w-4 h-4" />
                        <span className="text-xs font-bold">{user.phone}</span>
                    </div>
                )}
                 {user.address && (
                    <div className="flex items-center gap-3 text-slate-400 line-clamp-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-bold">{user.address}</span>
                    </div>
                )}
            </div>

            <Link 
              to={`/admin/customers/${user.userid || user.userId || user.user_id || user.id}/engagement`}
              className="w-full mt-10 py-4 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
            >
                View Engagement History
                <ExternalLink className="w-3 h-3" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
