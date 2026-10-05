/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BundleProvider } from './context/BundleContext';
import { DataProvider } from './context/DataContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { BundleBuilder } from './components/BundleBuilder';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Products from './pages/Products';
import Deals from './pages/Deals';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Invoice from './pages/Invoice';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Search from './pages/Search';
import { WhatsAppButton } from './components/WhatsAppButton';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsManager from './pages/admin/ProductsManager';
import ServicesManager from './pages/admin/ServicesManager';
import OrdersManager from './pages/admin/OrdersManager';
import UsersManager from './pages/admin/UsersManager';
import Invoices from './pages/admin/Invoices';
import GalleryManager from './pages/admin/GalleryManager';
import FeedbackManager from './pages/admin/FeedbackManager';
import DealsManager from './pages/admin/DealsManager';
import ReviewsManager from './pages/admin/ReviewsManager';
import ServiceRequestsManager from './pages/admin/ServiceRequestsManager';
import EngagementPage from './pages/admin/EngagementPage';
import CouponsManager from './pages/admin/CouponsManager';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import OrderDetail from './pages/OrderDetail';
import MessagesManager from './pages/admin/MessagesManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import AdminSearch from './pages/admin/AdminSearch';
import AdminLogin from './pages/admin/AdminLogin';
import ProductDetail from './pages/ProductDetail';
import ServiceDetail from './pages/ServiceDetail';
import CategoryView from './pages/CategoryView';
import DealDetail from './pages/DealDetail';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import Footer from './components/Footer';

// Dashboards (Placeholder for now)
function VendorDashboard() {
  const { userData } = useAuth();
  if (userData?.role !== 'vendor') return <Navigate to="/" />;
  return <div className="pt-28 px-4 max-w-7xl mx-auto"><h1 className="text-4xl font-serif">Vendor Dashboard</h1><p className="mt-4 text-gray-400">Manage your services and track earnings here.</p></div>;
}

function AdminRoutes() {
  const { userData, loading } = useAuth();
  
  if (loading) return null;
  if (!userData || userData.role !== 'admin') return <Navigate to="/" />;

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<CategoriesManager />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="services" element={<ServicesManager />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="customers" element={<UsersManager />} />
        <Route path="customers/:userId/engagement" element={<EngagementPage />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="coupons" element={<CouponsManager />} />
        <Route path="gallery" element={<GalleryManager />} />
        <Route path="reviews" element={<ReviewsManager />} />
        <Route path="service-requests" element={<ServiceRequestsManager />} />
        <Route path="feedback" element={<FeedbackManager />} />
        <Route path="deals" element={<DealsManager />} />
        <Route path="messages" element={<MessagesManager />} />
        <Route path="search" element={<AdminSearch />} />
      </Routes>
    </AdminLayout>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const location = useLocation();
  
  if (!loading && userData?.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-bg-dark text-slate-900 selection:bg-primary/30">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BundleBuilder />
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

function MainApp() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Admin Auth - No Layout */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Routes - AdminLayout */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Home & Public Routes - PublicLayout */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/marketplace" element={<PublicLayout><Marketplace /></PublicLayout>} />
        <Route path="/deals" element={<PublicLayout><Deals /></PublicLayout>} />
        <Route path="/deals/:id" element={<PublicLayout><DealDetail /></PublicLayout>} />
        <Route path="/search" element={<PublicLayout><Search /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/service/:id" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
        <Route path="/category/:categoryId" element={<PublicLayout><CategoryView /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/order-success" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
        <Route path="/orders" element={<PublicLayout><Orders /></PublicLayout>} />
        <Route path="/orders/:orderId" element={<PublicLayout><OrderDetail /></PublicLayout>} />
        <Route path="/orders/:id/invoice" element={<PublicLayout><Invoice /></PublicLayout>} />
        <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
        <Route path="/auth" element={<PublicLayout><Auth /></PublicLayout>} />
        <Route path="/vendor/dashboard" element={<PublicLayout><VendorDashboard /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><TermsOfService /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
        <Route path="/refund-policy" element={<PublicLayout><RefundPolicy /></PublicLayout>} />
        
        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <BundleProvider>
            <Toaster 
              position="top-right" 
              containerStyle={{
                top: 80,
                right: 20,
              }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#0f172a',
                  fontSize: '9px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  width: 'fit-content',
                  maxWidth: '240px',
                  margin: '0',
                },
              }}
            />
            <MainApp />
          </BundleProvider>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  );
}
