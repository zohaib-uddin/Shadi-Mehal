import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Receipt, Clock, CreditCard, HelpCircle } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-5xl mx-auto">
      {/* <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">Policies</span>
        <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter text-slate-900 mb-8 lowercase">
          Refund<span className="text-primary font-bold">Policy</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-3xl">
          At Shadi Mehal, we strive to make your wedding events perfect. This policy outlines our procedures for refunds and cancellations to ensure transparency and trust.
        </p>
      </motion.div> */}

         <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-20"
              >
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Return</span>
                <h1 className="text-6xl md:text-8xl font-sans text-slate-900 leading-none mb-8 font-semibold">Refund <span className="text-slate-300">Policy</span></h1>
                <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Last Updated: May 6, 2026</p>
              </motion.div>
              <div className="grid grid-cols-1 mb-20 text-slate-60">
  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-3xl">
          At Shadi Mehal, we strive to make your wedding events perfect. This policy outlines our procedures for refunds and cancellations to ensure transparency and trust.
        </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 text-slate-600">
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Event Cancellations</h2>
            </div>
            <p className="font-medium leading-relaxed">
              If an event is cancelled by the client more than 30 days before the scheduled date, 50% of the deposit will be refunded. Cancellations made less than 30 days before the event are non-refundable as resources and vendors are already secured.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Product Returns</h2>
            </div>
            <p className="font-medium leading-relaxed">
              Physical wedding products (decoration items, accessories) can be returned within 7 days of delivery if they are damaged or incorrect. Items must be in original packaging. Custom-made products are non-refundable.
            </p>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Processing Time</h2>
            </div>
            <p className="font-medium leading-relaxed">
              Approved refunds will be processed within 10-15 business days and will be returned to the original payment method or as store credit, depending on the client's preference.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Questions?</h2>
            </div>
            <p className="font-medium leading-relaxed">
              If you have any questions regarding our refund policy or need assistance with a specific case, please contact our support team at hello@shadimehal.com.
            </p>
          </section>
        </div>
      </div>

      <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-semibold text-slate-900">Our Commitment</h3>
        </div>
        <p className="text-lg font-medium text-slate-500 leading-relaxed font-bold">
          "We understand that wedding planning can be unpredictable. Our goal is to work with our clients to find fair solutions while maintaining the high standards of service Shadi Mehal is known for."
        </p>
      </div>
    </div>
  );
}
