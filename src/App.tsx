/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Mortgage from './components/Mortgage';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Blog from './components/Blog';
import Contact from './components/Contact';
import SalaryCalculator from './components/SalaryCalculator';
import DividendTracker from './components/DividendTracker';
import { MarketPulse } from './components/PiyasaninNabzi';
import Policy from './components/Policy';
import Landing from './components/Landing';
import Sitemap from './components/Sitemap';
import Presentation from './components/Presentation';
import AIStory from './components/AIStory';
import NotFound from './components/NotFound';
import { motion, AnimatePresence } from 'motion/react';
import { initAnalytics } from './lib/firebase';
import { logEvent } from 'firebase/analytics';
import { SupportButton } from './components/SupportButton';

// Scroll to top and track page views on route change
function ScrollToTop() {
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Google Analytics Page View Tracking
    initAnalytics().then(analytics => {
      if (analytics) {
        logEvent(analytics, 'page_view', {
          page_path: pathname,
          page_location: window.location.href,
          page_title: document.title
        });
      }
    });
  }, [pathname, location]);

  return null;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <AppContent isLoggedIn={isLoggedIn} />
    </Router>
  );
}

function AppContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="fixed inset-0 z-0 opacity-40 frosted-bg pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Landing /></Layout>} />
            <Route path="/anasayfa" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Landing /></Layout>} />
            
            {/* Search Intent Redirects */}
            <Route path="/kar-hesapla" element={<Navigate to="/pazar-kar-hesaplama" replace />} />
            <Route path="/temettu-hesapla" element={<Navigate to="/temettu-takibi" replace />} />
            <Route path="/maas-hesapla" element={<Navigate to="/maas-vergi-hesaplama" replace />} />
            <Route path="/borsa-takip" element={<Navigate to="/borsa/nabiz" replace />} />

            <Route path="/pazar-kar-hesaplama" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Home /></Layout>} />
            <Route path="/pazar-kar" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Home /></Layout>} />
            <Route path="/maas-vergi-hesaplama" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><SalaryCalculator /></Layout>} />
            <Route path="/temettu-takibi" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><DividendTracker /></Layout>} />
            <Route path="/borsa/nabiz" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><MarketPulse /></Layout>} />
            <Route path="/dashboard" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Dashboard /></Layout>} />
            <Route path="/blog" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Blog /></Layout>} />
            <Route path="/blog/:id" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Blog /></Layout>} />
            <Route path="/hakkimizda" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><About /></Layout>} />
            <Route path="/iletisim" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Contact /></Layout>} />
            <Route path="/gizlilik-politikasi" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Policy type="privacy" /></Layout>} />
            <Route path="/kullanim-kosullari" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Policy type="terms" /></Layout>} />
            <Route path="/site-haritasi" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><Sitemap /></Layout>} />
            
            <Route path="/hikayemiz" element={<Layout isLoggedIn={isLoggedIn} hideNav={true}><AIStory /></Layout>} />
            <Route path="/sunum" element={<Layout isLoggedIn={isLoggedIn} hideNav={true}><Presentation /></Layout>} />

            {/* Final Catch-all for unknown routes */}
            <Route path="*" element={<Layout isLoggedIn={isLoggedIn} hideNav={false}><NotFound /></Layout>} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Layout({ children, isLoggedIn, hideNav }: { children: React.ReactNode, isLoggedIn: boolean, hideNav: boolean }) {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideNav && <Navbar isLoggedIn={isLoggedIn} />}
      <main className="flex-grow">
        <PageWrapper>{children}</PageWrapper>
      </main>
      {!hideNav && <Footer />}
      <SupportButton />
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
