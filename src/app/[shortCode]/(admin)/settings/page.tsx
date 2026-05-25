'use client';

import React, { useEffect, useState, use } from 'react';
import { Loader2, ArrowLeft, Settings, ShieldAlert, Sparkles, MapPin, Calendar, QrCode } from 'lucide-react';
import { eventService } from '@/lib/api';
import Link from 'next/link';

export default function SettingsPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = use(params);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await eventService.verifyEventCode(resolvedParams.shortCode);
        if (response.success) {
          setEventInfo(response.data);
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
    }
    loadSettings();
  }, [resolvedParams.shortCode]);

  if (loading || !eventInfo) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#e52b36]" />
      </div>
    );
  }

  const qr = eventInfo;
  const limitReached = eventInfo.limit_reached;
  const project = eventInfo.project || {};

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href={`/${resolvedParams.shortCode}/dashboard`} className="hover:text-slate-700 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-[#e52b36]" />
          Event Configurations
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Read-only system configurations and limits managed via the core Drista platform dashboard.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* QR Code details */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-5">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 pb-3 border-b border-zinc-100">
            <QrCode className="w-5 h-5 text-[#e52b36]" />
            Scanner Settings
          </h3>

          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Short Code</span>
              <span className="font-bold text-slate-900 bg-zinc-100 px-2 py-0.5 rounded text-xs">{resolvedParams.shortCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Activity Type</span>
              <span className="font-bold text-slate-900">{qr.activity_type || 'Main Check-In'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Verification Link Title</span>
              <span className="font-bold text-slate-900">{qr.title || 'Main Entrance Scanner'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Status</span>
              <span className="font-bold px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Total Scans Performed</span>
              <span className="font-bold text-slate-900">{qr.scan_count || 0} scans</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Scan Soft Limit</span>
              <span className="font-bold text-slate-900">{qr.scan_limit || 'Unlimited'} scans</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Exceeded Limit Status</span>
              <span className={`font-bold text-xs ${limitReached ? 'text-red-600 font-extrabold' : 'text-slate-500'}`}>
                {limitReached ? 'LIMIT REACHED (Blocked)' : 'Within limits'}
              </span>
            </div>
          </div>
        </div>

        {/* Project Event Info */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-5">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Project Details
          </h3>

          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Event Name</span>
              <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{project.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                Venue
              </span>
              <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{project.venue || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">City / Country</span>
              <span className="font-bold text-slate-900">{project.city || 'N/A'}, {project.country || 'India'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Start Date
              </span>
              <span className="font-bold text-slate-900">{project.event_start_date || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                End Date
              </span>
              <span className="font-bold text-slate-900">{project.event_end_date || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Link Expiration Date</span>
              <span className="font-bold text-slate-900">
                {qr.expires_at ? new Date(qr.expires_at).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Safety Alert Panel */}
      <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 flex items-start gap-4 shadow-sm">
        <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-sm text-amber-800">
          <span className="font-extrabold text-amber-900">Configuration Changes Restrictions</span>
          <span className="font-medium text-xs leading-relaxed">
            These parameters are controlled under administrative keys. To change the QR code title, reset the scan counts, or modify scanner expiration times, please log into your account portal at <a href="https://drista.in" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-amber-900 transition-colors">drista.in</a>.
          </span>
        </div>
      </div>

    </div>
  );
}
