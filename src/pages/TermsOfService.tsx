import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Scale, FileText, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Legal Agreement</span>
          <h1 className="text-6xl md:text-8xl font-sans text-slate-900 leading-none mb-8 font-semibold">Terms of <span className="text-slate-300">Service</span></h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Last Updated: May 6, 2026</p>
        </motion.div>

        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-4 mb-6">
              <Scale className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">1. Agreement to Terms</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              By accessing or using Hamza Decoration's website and services, you agree to be bound by these Terms of Service. These terms apply to all visitors, users, and others who access or use our wedding products and event services.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <Clock className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">2. Booking & Cancellations</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>• A non-refundable deposit of 30% is required to confirm any service booking (Stage Decor, Photography, etc.).</p>
              <p>• Final payment must be cleared at least 48 hours before the scheduled event date.</p>
              <p>• Cancellations made within 7 days of the event will be charged 100% of the total service value.</p>
              <p>• Date transfers are subject to availability and may incur an administrative fee of Rs. 5,000.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <ShoppingBag className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">3. Product Sales & Delivery</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>• All handmade items (Gift Boxes, Invites) are crafted to order. Standard processing time is 3-5 working days.</p>
              <p>• Delivery charges are calculated based on the shipping address and item weight.</p>
              <p>• We are not responsible for delays caused by third-party courier services or incorrect shipping information provided by the customer.</p>
              <p>• Variations in color or texture are inherent to handcrafted products and are not considered defects.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <ShieldCheck className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">4. Quality & Service Standards</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Hamza Decoration commits to providing premium quality services. However, specific floral varieties or decor materials may be substituted with items of equal or greater value based on seasonal availability or quality concerns. We will always strive to maintain the overall aesthetic and theme agreed upon.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <AlertCircle className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">5. Limitation of Liability</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              In no event shall Hamza Decoration, nor its directors or employees, be liable for any indirect, incidental, or consequential damages resulting from the use of our products or the execution of our services, except where prohibited by law. Our maximum liability for any claim shall not exceed the amount paid for the specific service or product in question.
            </p>
          </section>
        </div>

        <div className="mt-20 p-10 bg-slate-50 rounded-[40px] border border-slate-100 text-center">
          <FileText className="text-primary mx-auto mb-6 w-12 h-12" />
          <p className="text-slate-500 text-sm mb-6">If you have any questions about these Terms, please contact us.</p>
          <a 
            href="https://wa.me/923116869582" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-black transition-all"
          >
            Contact Legal Dept
          </a>
        </div>
      </div>
    </div>
  );
}
