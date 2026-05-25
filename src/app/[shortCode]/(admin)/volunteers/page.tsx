'use client';

import React, { useEffect, useState, use } from 'react';
import { Loader2, ArrowLeft, RefreshCw, Mail, Phone, ShieldCheck, UserCheck } from 'lucide-react';
import { eventService } from '@/lib/api';
import Link from 'next/link';

export default function VolunteersPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = use(params);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch volunteers from backend
  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await eventService.getVolunteers(resolvedParams.shortCode);
      if (response.success) {
        setVolunteers(response.data);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('drista_admin_token');
        window.location.href = `/${resolvedParams.shortCode}/login`;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [resolvedParams.shortCode]);

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href={`/${resolvedParams.shortCode}/dashboard`} className="hover:text-slate-700 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Event Volunteers</h1>
        </div>

        <button 
          onClick={fetchVolunteers} 
          disabled={loading}
          className="p-2.5 bg-white border border-zinc-200 rounded-xl shadow-sm text-slate-600 hover:bg-zinc-50 hover:text-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center p-12 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#e52b36]" />
        </div>
      ) : volunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-zinc-100 shadow-sm text-center min-h-[300px]">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No volunteers assigned</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            Assign team members or volunteers to this project in the main portal to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteers.map((v) => (
            <div 
              key={v.id} 
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
            >
              {/* Member Profile Banner Card */}
              <div className="p-6 flex flex-col items-center text-center gap-4 relative">
                {/* Active Tag */}
                <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>

                <img 
                  src={v.avatar} 
                  alt={v.name} 
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover bg-zinc-50 group-hover:scale-105 transition-transform duration-300"
                />

                <div className="flex flex-col gap-1">
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-[#e52b36] transition-colors">{v.name}</h3>
                  <span className="bg-slate-100 text-slate-600 text-xs font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider self-center">
                    {v.role}
                  </span>
                </div>
              </div>

              {/* Contact Info Footer */}
              <div className="border-t border-zinc-50 bg-zinc-50/50 p-4 flex flex-col gap-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="truncate font-semibold text-xs">{v.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Phone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="font-semibold text-xs">{v.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 mt-1.5 pt-2.5 border-t border-zinc-100 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Authorized Member</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
