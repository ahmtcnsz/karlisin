import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface VerifiedBadgeProps {
  count?: number;
  source?: string;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ count = 1, source = "KAP / Yahoo", className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 mt-3 ${className}`}
    >
      <ShieldCheck className="text-emerald-500/60 w-3.5 h-3.5" />
      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
        <span className="text-emerald-500/80 font-black">{count} KAYNAK</span> DOĞRULANMIŞ <span className="opacity-40 px-1">•</span> <span className="text-slate-400">{source}</span>
      </span>
    </motion.div>
  );
};
