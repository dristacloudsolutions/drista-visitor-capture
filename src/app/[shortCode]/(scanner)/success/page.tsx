'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, UserPlus, Clock, ArrowRight, Building2, Phone } from 'lucide-react';

export default function SuccessPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('visitor_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-full flex flex-col bg-zinc-50 pb-24">
      {/* Success Banner */}
      <div className="bg-white p-8 flex flex-col items-center justify-center text-center border-b border-zinc-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Captured Successfully!</h2>
        <p className="text-sm font-medium text-zinc-500 mt-2">The visitor details have been saved to the database.</p>
        
        <button
          onClick={() => router.push(`/${resolvedParams.shortCode}/scan`)}
          className="mt-6 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform w-full sm:w-auto"
        >
          <UserPlus className="w-5 h-5" />
          Scan Next Visitor
        </button>
      </div>

      {/* Recent Entries */}
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-4 px-1">
          <Clock className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Recent Captures (Local)</h3>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-medium text-zinc-400">No recent captures on this device.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-foreground">{entry.name}</h4>
                    {entry.designation && <p className="text-[11px] font-bold text-primary mt-0.5">{entry.designation}</p>}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="mt-3 flex flex-col gap-1.5">
                  {entry.company && (
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{entry.company}</span>
                    </div>
                  )}
                  {entry.phone && (
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{entry.phone}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
