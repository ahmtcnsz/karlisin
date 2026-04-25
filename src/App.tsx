/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Mortgage from './components/Mortgage';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Blog from './components/Blog';
import SalaryCalculator from './components/SalaryCalculator';
import Policy from './components/Policy';
import FeedbackOverlay from './components/FeedbackOverlay';
import Landing from './components/Landing';
import Sitemap from './components/Sitemap';
import { motion, AnimatePresence } from 'motion/react';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="fixed inset-0 z-0 opacity-40 frosted-bg pointer-events-none" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar isLoggedIn={isLoggedIn} />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
              <Route path="/anasayfa" element={<PageWrapper><Landing /></PageWrapper>} />
              <Route path="/pazar-kar-hesaplama" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/pazar-kar" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/maas-vergi-hesaplama" element={<PageWrapper><SalaryCalculator /></PageWrapper>} />
              <Route path="/temettu-takibi" element={<PageWrapper><Mortgage /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
              <Route path="/blog/:id" element={<PageWrapper><Blog /></PageWrapper>} />
              <Route path="/hakkimizda" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/gizlilik-politikasi" element={<PageWrapper><Policy type="privacy" /></PageWrapper>} />
              <Route path="/kullanim-kosullari" element={<PageWrapper><Policy type="terms" /></PageWrapper>} />
              <Route path="/site-haritasi" element={<PageWrapper><Sitemap /></PageWrapper>} />
              {/* Fallback to landing */}
              <Route path="*" element={<PageWrapper><Landing /></PageWrapper>} />
            </Routes>
          </main>

          <Footer />
          <FeedbackOverlay />
        </div>
      </div>
    </Router>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
