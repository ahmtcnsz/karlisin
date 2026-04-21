import React from 'react';
import { Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-surface-container-low border-t border-surface-container mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-black text-primary mb-4 tracking-tighter">FinCalc</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Precision in every calculation. Our suite of professional tools empowers your financial future with data-driven insights.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Product</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Calculators</a>
              <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Mortgage</a>
              <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Investment</a>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Company</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">About Us</a>
              <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-white border border-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all shadow-sm">
                <Globe size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white border border-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all shadow-sm">
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant">
            © 2024 FinCalc Professional Tools. Precise. Reliable. Innovative.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
