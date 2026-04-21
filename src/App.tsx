/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Mortgage from './components/Mortgage';
import Dashboard from './components/Dashboard';
import About from './components/About';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState('calculators');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simple scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentView === 'dashboard') {
      setIsLoggedIn(true);
    }
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'calculators':
        return <Home />;
      case 'mortgage':
        return <Mortgage />;
      case 'dashboard':
        return <Dashboard />;
      case 'about':
        return <About />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="fixed inset-0 z-0 opacity-40 frosted-bg pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          isLoggedIn={isLoggedIn}
        />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
}
