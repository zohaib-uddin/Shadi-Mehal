import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Printer, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { adminService, Order } from '../lib/adminService';
import { useAuth } from '../context/AuthContext';
import { PDFInvoice } from '../components/PDFInvoice';
import { downloadPDF } from '../lib/pdfUtils';
import { toast } from 'react-hot-toast';
import TopLoadingBar from '../components/TopLoadingBar';

export default function Invoice() {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const [order, setOrder] = useState<Order | null>(() => {
    if (!id) return null;
    return adminService.getOrdersCache()[id] || null;
  });
  const [loading, setLoading] = useState(() => !order);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      const cached = adminService.getOrdersCache()[id];
      setOrder(cached || null);
      setLoading(!cached);
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await adminService.getOrderById(id!);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!order) return;
    setIsDownloading(true);
    try {
      await downloadPDF('invoice-content', `Invoice-${order.id?.slice(0, 8)}`);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 md:pt-32 pb-20 px-4 md:px-6 min-h-screen bg-bg-dark animate-pulse">
        <TopLoadingBar />
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="h-4 bg-slate-100 w-32 rounded"></div>
            <div className="flex gap-4">
              <div className="w-24 h-10 bg-slate-100 rounded-xl"></div>
              <div className="w-32 h-10 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
          <div className="bg-white p-12 rounded-[40px] border border-slate-50 space-y-6 shadow-sm min-h-[500px]">
            <div className="flex justify-between pb-8 border-b border-slate-50">
              <div className="h-10 bg-slate-100 w-40 rounded"></div>
              <div className="h-10 bg-slate-100 w-40 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <Navigate to="/orders" />;
  }

  // Security check: User can only see their own invoice unless they are admin
  if (user?.id !== order.userId && userData?.role !== 'admin') {
     return <Navigate to="/orders" />;
  }

  return (
    <div className="pt-24 md:pt-32 pb-20 px-4 md:px-6 min-h-screen bg-bg-dark print:bg-white print:pt-0">
      <div className="max-w-4xl mx-auto">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4 print:hidden">
          <Link to="/orders" className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
            <ArrowLeft size={12} />
            Back to Orders
          </Link>
          <div className="flex gap-2 md:gap-4 w-full md:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-white border border-slate-100 rounded-xl flex items-center justify-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
            >
              <Printer size={14} />
              Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Download size={14} />}
              Download PDF
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PDFInvoice order={order} />
        </motion.div>
        
        <div className="mt-12 text-center text-[10px] font-medium text-slate-300 uppercase tracking-[0.3em] print:hidden">
          Shadi Mehal • Elite Floral & Event Orchestration Bureau
        </div>
      </div>
    </div>
  );
}
