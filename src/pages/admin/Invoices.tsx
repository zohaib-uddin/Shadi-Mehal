import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Printer, Search, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { adminService, Order } from '../../lib/adminService';
import { Link } from 'react-router-dom';
import { InvoiceModal } from '../../components/InvoiceModal';
import { PDFInvoice } from '../../components/PDFInvoice';
import { exportAllInvoices, downloadPDF } from '../../lib/pdfUtils';
import { toast } from 'react-hot-toast';

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invData, orderData] = await Promise.all([
        adminService.getInvoices(),
        adminService.getOrders()
      ]);
      setInvoices(invData || []);
      setOrders(orderData || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to synchronize records");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (invoices.length === 0) {
      toast.error("No invoices found to export");
      return;
    }
    setIsExporting(true);
    try {
      const reportData = invoices.map(inv => {
        const order = orders.find(o => o.id === inv.order_id);
        return {
          ...inv,
          customer_name: order?.userName || 'Anonymous',
          payment_method: order?.paymentMethod || 'N/A'
        };
      });
      console.log("Exporting Report Data:", reportData);
      await exportAllInvoices(reportData, `Financial-Report-${new Date().toISOString().split('T')[0]}`);
      toast.success("Financial report exported successfully");
    } catch (err) {
      console.error("Export Error:", err);
      toast.error("Failed to export report. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const openInvoiceModal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsInvoiceModalOpen(true);
    } else {
      toast.error("Order details not found");
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      toast.error("Order details not found for this invoice");
      return;
    }

    const toastId = toast.loading("Generating PDF...");
    try {
      setSelectedOrder(order);
      // We use a small timeout to let the background-hidden component render
      await new Promise(resolve => setTimeout(resolve, 300));
      await downloadPDF('direct-invoice-download', `Invoice-${order.id?.slice(0, 8)}`);
      toast.success("Invoice downloaded", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Opening in new tab as fallback...", { id: toastId });
      window.open(`/orders/${orderId}/invoice`, '_blank');
    }
  };

  return (
    <div className="space-y-10">
      {/* Hidden container for background PDF generation - improved for canvas capture */}
      <div 
        style={{ position: 'fixed', left: '-5000px', top: '0', zIndex: -100, pointerEvents: 'none' }}
        aria-hidden="true"
      >
         {selectedOrder && (
           <PDFInvoice order={selectedOrder} id="direct-invoice-download" />
         )}
      </div>

      <InvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={selectedOrder}
      />
      <div className="flex items-center justify-between">
         <h3 className="text-3xl font-serif italic text-slate-900">Financial Documents</h3>
         <div className="flex items-center gap-4">
             <button 
                onClick={handleExportReport}
                disabled={isExporting}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-black transition-all shadow-lg disabled:opacity-50"
             >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export Report
             </button>
         </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar pb-2">
            <table className="w-full text-left min-w-[1200px] lg:min-w-0">
               <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-10 py-6">Invoice ID</th>
                  <th className="px-10 py-6">Order ID</th>
                  <th className="px-10 py-6">Client</th>
                  <th className="px-10 py-6">Date</th>
                  <th className="px-10 py-6">Total</th>
                  <th className="px-10 py-6">Payment Method</th>
                  <th className="px-10 py-6">Payment Status</th>
                  <th className="px-10 py-6">Order Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => {
                  const order = orders.find(o => o.id === inv.order_id);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-8">
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest group-hover:text-primary transition-colors">#{String(inv.id).slice(0, 8)}</span>
                      </td>
                      <td className="px-10 py-8">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">#{String(inv.order_id || '').slice(0, 8)}</span>
                      </td>
                      <td className="px-10 py-8">
                         <p className="text-sm font-bold text-slate-900">{order?.userName || 'N/A'}</p>
                         <p className="text-[9px] text-slate-400 font-medium">{order?.userEmail || 'N/A'}</p>
                      </td>
                      <td className="px-10 py-8 text-slate-400 text-xs font-medium">
                         {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-10 py-8">
                         <p className="text-sm font-serif italic text-slate-900">Rs. {Number(inv.amount || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-10 py-8">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{order?.paymentMethod || 'N/A'}</span>
                      </td>
                      <td className="px-10 py-8">
                         <span className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                            (order?.paymentStatus || 'unpaid').toLowerCase() === 'paid' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                         )}>
                            {order?.paymentStatus || 'unpaid'}
                         </span>
                      </td>
                      <td className="px-10 py-8">
                         <span className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                            (order?.status || 'pending').toLowerCase() === 'completed' ? "bg-green-50 text-green-500" : "bg-amber-50 text-amber-500"
                         )}>
                            {order?.status || 'pending'}
                         </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => handleDownloadInvoice(inv.order_id)}
                              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-sm flex items-center gap-2"
                              title="Direct Download PDF"
                            >
                                <Download className="w-3 h-3" />
                                Download
                            </button>
                            <button 
                              onClick={() => openInvoiceModal(inv.order_id)}
                              className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                              title="View Invoice PDF"
                            >
                                <FileText className="w-3 h-3" />
                                View
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Preview Template (Mock) */}
      <div className="bg-white p-20 rounded-[60px] border border-slate-100 shadow-2xl max-w-4xl mx-auto hidden lg:block opacity-50 select-none grayscale cursor-not-allowed">
          <div className="flex justify-between items-start mb-20">
              <div>
                  <h1 className="text-4xl font-serif italic text-slate-900">Hamza Decorations</h1>
                  <p className="text-xs text-slate-400 font-medium mt-2">Main Bazar, Attock City, Punjab</p>
              </div>
              <div className="text-right">
                  <h2 className="text-6xl font-serif text-slate-200 uppercase">INVOICE</h2>
              </div>
          </div>
          
          <div className="grid grid-cols-2 gap-20 mb-20">
              <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Bill To:</p>
                  <h3 className="text-2xl font-serif italic text-slate-900">Sample Client</h3>
                  <p className="text-xs text-slate-400 font-medium">customer@example.com</p>
              </div>
              <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Details:</p>
                  <p className="text-[11px] font-bold text-slate-900 uppercase">INV-XXXX-XXXX</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">April 25, 2026</p>
              </div>
          </div>

          <div className="border-t-2 border-slate-900 pt-10 mb-20">
              <div className="flex justify-between mb-8 pb-4 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-500">Description</span>
                  <span className="text-[10px] font-black uppercase text-slate-500">Amount</span>
              </div>
              <div className="space-y-6">
                  <div className="flex justify-between">
                      <span className="text-sm font-bold text-slate-900">Royal Stage Orchestration</span>
                      <span className="text-sm font-serif italic">Rs. 120,000</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                      <span className="text-sm">Floral Arrangements (Bespoke)</span>
                      <span className="text-sm font-serif italic">Rs. 35,000</span>
                  </div>
              </div>
          </div>

          <div className="flex justify-end pt-10 border-t border-slate-100">
              <div className="w-64 space-y-4">
                  <div className="flex justify-between text-slate-400 text-sm">
                      <span>Subtotal</span>
                      <span>Rs. 155,000</span>
                  </div>
                  <div className="flex justify-between text-slate-900 text-xl font-bold border-t border-slate-900 pt-4">
                      <span>Total</span>
                      <span className="font-serif italic">Rs. 155,000</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
