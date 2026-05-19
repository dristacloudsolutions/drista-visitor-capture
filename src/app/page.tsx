'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    // Simulate API delay for verifying the code
    setTimeout(() => {
      // Navigate to the scanning portal for this shortCode
      router.push(`/${code.toLowerCase()}/scan`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-100"
      >
        <div className="bg-primary px-6 py-10 flex flex-col items-center text-center text-primary-foreground">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Visitor Capture</h1>
          <p className="text-sm font-medium text-white/80 mt-2">Enter your event code to start scanning business cards.</p>
        </div>

        <form onSubmit={handleJoin} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Event Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. EVENT24"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center font-bold text-lg uppercase tracking-wider text-foreground placeholder:text-zinc-300 placeholder:font-medium placeholder:tracking-normal"
                autoComplete="off"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <div className="pt-2 text-center">
              <button 
                type="button" 
                onClick={() => setCode('SAMPLE24')}
                className="text-xs font-bold text-zinc-400 hover:text-primary transition-colors underline underline-offset-4"
              >
                Use Demo Event (SAMPLE24)
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
