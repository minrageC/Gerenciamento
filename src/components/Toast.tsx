import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#11171f] border border-amber-500/40 text-amber-300 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-top-4">
      <div className="w-4 h-4 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400">
        <Check className="w-3 h-3" />
      </div>
      <span>{message}</span>
    </div>
  );
};
