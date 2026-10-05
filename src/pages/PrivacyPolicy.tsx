import React from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, Lock, Database, Globe, UserCheck } from 'lucide-react';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Data Protection</span>
          <h1 className="text-6xl md:text-8xl font-sans text-slate-900 leading-none mb-8 font-semibold">Privacy <span className="text-slate-300">Policy</span></h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Effective Date: May 6, 2026</p>
        </motion.div>

        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-4 mb-6">
              <Eye className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>We collect information that you provide directly to us when you make a booking, purchase a product, or contact us via WhatsApp:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contact Information: Name, email address, phone number (WhatsApp).</li>
                <li>Event Details: Date, venue, type of event, and specific decor preferences.</li>
                <li>Financial Information: Payment details processed through secure third-party gateways.</li>
                <li>Delivery Information: Shipping address for physical product orders.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <Database className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">2. How We Use Your Data</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>Your data is used primarily to fulfill our commitments to you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process and manage your wedding service bookings.</li>
                <li>To fulfill and ship product orders (Gift boxes, Invites).</li>
                <li>To communicate regarding event logistics or order status.</li>
                <li>To improve our digital marketplace based on user behavior and feedback.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <Lock className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">3. Data Security</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information. Database access is restricted to authorized personnel only, and sensitive payment data is never stored on our local servers; it is handled by PCI-compliant payment processors.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <Globe className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">4. Third-Party Sharing</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              We do not sell your personal data. We may share information with trusted partners necessary for service delivery, such as:
            </p>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>• Logistics/Courier partners for product delivery.</p>
              <p>• Sub-contractors (Photographers, Florists) strictly for event execution purposes.</p>
              <p>• Legal authorities if required by law to comply with a judicial proceeding or court order.</p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <UserCheck className="text-primary w-6 h-6" />
              <h2 className="text-2xl font-semibold text-slate-900">5. Your Rights</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              You have the right to access, correct, or delete your personal information held by Hamza Decoration. If you wish to exercise these rights or have concerns about your data, please contact our privacy officer through the secure WhatsApp channel provided.
            </p>
          </section>
        </div>

      <div className="mt-20 p-10 bg-slate-50 rounded-[40px] border border-slate-100 text-center">
  <Shield className="text-primary mx-auto mb-6 w-12 h-12" />
  
  <h3 className="text-xl font-semibold text-slate-900 mb-4">
    Your Privacy is our Priority
  </h3>

  <p className="text-slate-500 text-sm mb-8">
    We update this policy periodically to reflect changes in our practices or for regulatory reasons.
  </p>

  <a 
    href="https://wa.me/923116869582" 
    target="_blank" 
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-black transition-all"
  >
    Review Data Usage
  </a>
</div>
      </div>
    </div>
  );
}
