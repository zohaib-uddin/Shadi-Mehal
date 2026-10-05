import React, { useState } from 'react';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../lib/adminService';
import { PDFInvoice } from './PDFInvoice';
import { downloadPDF } from '../lib/pdfUtils';
import { toast } from 'react-hot-toast';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!order) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Extra delay to ensure modal entrance animation is fully finished
      await new Promise(resolve => setTimeout(resolve, 600));
      await downloadPDF('invoice-content-modal', `Invoice-${order.id?.slice(0, 8)}`);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-100 flex-shrink-0">
               <div>
                  <h3 className="text-xl font-serif text-slate-900 font-bold">Invoice Review</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Order #{order.id?.slice(0, 8)}</p>
               </div>
               <div className="flex items-center gap-4">
                  <button 
                    onClick={onClose}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:rotate-90"
                  >
                    <X size={20} />
                  </button>
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-8 custom-scrollbar">
              <PDFInvoice order={order} id="invoice-content-modal" />
            </div>
            
            {/* Footer Actions */}
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 flex-shrink-0">
                <button 
                  onClick={() => window.print()}
                  className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all"
                >
                   <Printer size={16} /> Print
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-black transition-all shadow-lg disabled:opacity-50"
                >
                   {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                   {isDownloading ? "Generating..." : "Download PDF"}
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
