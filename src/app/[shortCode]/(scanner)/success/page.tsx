'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, UserPlus, Clock, ArrowRight, Building2, Phone, Printer } from 'lucide-react';

export default function SuccessPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('visitor_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const latestVisitor = history[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-full flex flex-col bg-zinc-50 pb-24 relative">
      {/* Styles for clean badge printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-badge-area, #print-badge-area * {
            visibility: visible;
          }
          #print-badge-area {
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%) scale(1.6);
            border: 2px solid #222 !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 12px !important;
            width: 320px !important;
          }
        }
      `}</style>

      {/* Success Banner */}
      <div className="bg-white p-8 flex flex-col items-center justify-center text-center border-b border-zinc-100 shadow-sm relative overflow-hidden print:hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 via-[#e52b36] to-red-500/50" />
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
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center px-4">
          <button
            onClick={() => router.push(`/${resolvedParams.shortCode}/scan`)}
            className="px-8 py-3.5 bg-[#e52b36] hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform w-full sm:w-auto cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            Scan Next Visitor
          </button>
          
          <button
            onClick={() => router.push(`/${resolvedParams.shortCode}/dashboard`)}
            className="px-8 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform w-full sm:w-auto border border-zinc-200 cursor-pointer"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main section: Badge Preview & History */}
      <div className="p-6 flex flex-col lg:flex-row gap-8 items-start max-w-5xl mx-auto w-full">
        {/* Pass Preview / Print Badge */}
        {latestVisitor && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-5 items-center w-full lg:max-w-sm mx-auto print:absolute print:left-0 print:top-0 print:border-none print:shadow-none">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider print:hidden">Visitor Pass Badge</h3>
            
            {/* The Badge container */}
            <div 
              id="print-badge-area" 
              className="border border-zinc-200 rounded-2xl flex flex-col items-center bg-white w-full relative overflow-hidden shadow-sm"
            >
              {/* Lanyard punch hole simulation */}
              <div className="w-full flex justify-center pt-3.5 print:hidden">
                <div className="w-9 h-2.5 bg-zinc-200 rounded-full border border-zinc-300" />
              </div>

              {/* Header color block */}
              <div className="w-full bg-[#e52b36] text-white py-3.5 px-6 mt-3.5 flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-black tracking-widest uppercase">VISITOR PASS</span>
                <span className="text-[9px] font-bold tracking-wider uppercase opacity-75">
                  {resolvedParams.shortCode.toUpperCase() === 'SAMPLE24' ? 'Legrand Event' : 'Event Gatepass'}
                </span>
              </div>
              
              {/* QR Code */}
              <div className="p-6 pb-2">
                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-zinc-100 inline-block">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(latestVisitor.checkInUrl || latestVisitor.registrationId || latestVisitor.name)}`} 
                    alt="Visitor QR Code" 
                    className="w-28 h-28"
                  />
                </div>
              </div>

              {/* User details */}
              <div className="flex flex-col gap-1 w-full px-6 pb-4 text-center">
                <h4 className="font-extrabold text-slate-900 text-lg leading-tight truncate">{latestVisitor.name}</h4>
                {latestVisitor.designation && <span className="text-xs text-[#e52b36] font-bold">{latestVisitor.designation}</span>}
                {latestVisitor.company && <span className="text-xs text-slate-500 font-semibold truncate">{latestVisitor.company}</span>}
              </div>

              {/* Timestamp Footer */}
              <div className="w-full border-t border-zinc-100 bg-zinc-50/50 p-4 text-left flex flex-col gap-1.5 text-xs text-slate-500 font-semibold">
                <div className="flex justify-between px-1">
                  <span>Checked-In At:</span>
                  <span className="font-extrabold text-slate-800">
                    {new Date(latestVisitor.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between px-1">
                  <span>Entry Date:</span>
                  <span className="font-extrabold text-slate-800">
                    {new Date(latestVisitor.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-6 py-3.5 bg-zinc-900 hover:bg-black text-white rounded-xl font-bold shadow-md hover:scale-[1.01] transition-all w-full text-sm flex items-center justify-center gap-2 cursor-pointer print:hidden"
            >
              <Printer className="w-4.5 h-4.5" />
              Print Pass Badge
            </button>
          </div>
        )}

        {/* Recent Entries */}
        <div className="flex-1 w-full print:hidden">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Recent Captures (Local Device)</h3>
          </div>

          {history.length <= 1 ? (
            <div className="text-center py-10 bg-white border border-zinc-100 rounded-2xl p-6">
              <p className="text-sm font-medium text-zinc-400">No other recent captures on this device.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(1).map((entry, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground">{entry.name}</h4>
                      {entry.designation && <p className="text-[11px] font-bold text-[#e52b36] mt-0.5">{entry.designation}</p>}
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
    </div>
  );
}
