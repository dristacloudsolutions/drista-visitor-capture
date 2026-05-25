'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowUp, Loader2, Camera, Users, ScanLine, UserCheck, CalendarDays } from 'lucide-react';
import { eventService } from '@/lib/api';
import Link from 'next/link';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatDateLabel(iso: string) {
  const today = todayISO();
  if (iso === today) return 'Today';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = React.use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [dateLoading, setDateLoading] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.click();
    }
  };

  const loadData = useCallback(async (date: string) => {
    try {
      const response = await eventService.getDashboardMetrics(resolvedParams.shortCode, date);
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('drista_admin_token');
        window.location.href = `/${resolvedParams.shortCode}/login`;
      }
    }
  }, [resolvedParams.shortCode]);

  // Initial load
  useEffect(() => {
    loadData(selectedDate).finally(() => setLoading(false));
  }, []);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (!newDate) return;
    setSelectedDate(newDate);
    setDateLoading(true);
    await loadData(newDate);
    setDateLoading(false);
  };

  if (loading || !data) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const { metrics, recentVisitors, volunteerActivity } = data;
  const isToday = selectedDate === todayISO();
  const dateLabel = formatDateLabel(selectedDate);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/${resolvedParams.shortCode}/scan`}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#e52b36] hover:bg-red-600 text-white rounded-xl shadow-md font-bold text-sm transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Launch Scanner
          </Link>

          {/* Functional Date Picker — input is position:absolute inside the button wrapper
              so the browser anchors the calendar popup below the button */}
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              max={todayISO()}
              onChange={handleDateChange}
              aria-label="Select date to view dashboard metrics"
              tabIndex={-1}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                pointerEvents: 'none',
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
            />
            <button
              type="button"
              onClick={openDatePicker}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-zinc-50 active:scale-[0.98] transition-all cursor-pointer select-none"
            >
              <CalendarDays className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="whitespace-nowrap">
                {dateLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  dateLabel
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Visitors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-500">Total Visitors</h3>
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-blue-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{metrics.totalVisitors.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span>All time registrations</span>
          </div>
        </div>

        {/* Day's Visitors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-500">
              {isToday ? "Today's Visitors" : `${dateLabel}'s Visitors`}
            </h3>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5 text-emerald-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">
            {dateLoading ? <Loader2 className="w-7 h-7 animate-spin text-slate-300" /> : metrics.todaysVisitors.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <ArrowUp className="w-3 h-3" strokeWidth={3} />
            <span>Registered on {isToday ? 'today' : dateLabel}</span>
          </div>
        </div>

        {/* Total Volunteers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-500">Total Volunteers</h3>
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-violet-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{metrics.totalVolunteers.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            Active: <span className="font-bold text-slate-600">{metrics.activeVolunteers}</span>
          </div>
        </div>

        {/* Scans */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-500">
              {isToday ? 'Scans Today' : `Scans on ${dateLabel}`}
            </h3>
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <ScanLine className="w-4.5 h-4.5 text-orange-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">
            {dateLoading ? <Loader2 className="w-7 h-7 animate-spin text-slate-300" /> : metrics.scansToday.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500">
            <ArrowUp className="w-3 h-3" strokeWidth={3} />
            <span>Business cards scanned</span>
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Visitors Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Visitors</h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{isToday ? 'Today' : dateLabel}</p>
            </div>
            <Link
              href={`/${resolvedParams.shortCode}/visitors`}
              className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              View All
            </Link>
          </div>
          
          {dateLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
          ) : recentVisitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Users className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm font-medium">No visitors on {isToday ? 'today' : dateLabel}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/4">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/3">Company</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/4">Designation</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/6 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recentVisitors.map((v: any, i: number) => (
                    <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#e52b36] whitespace-nowrap">{v.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 truncate max-w-[200px]">{v.company}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 truncate max-w-[150px]">{v.designation}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-500 text-right whitespace-nowrap">{v.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Volunteer Activity List */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Volunteer Activity</h2>
            <Link
              href={`/${resolvedParams.shortCode}/volunteers`}
              className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              View All
            </Link>
          </div>
          
          <div className="flex-1 p-2">
            {volunteerActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <p className="text-sm font-medium">No volunteers assigned</p>
              </div>
            ) : (
              volunteerActivity.map((v: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors">
                  <img src={v.avatar} alt={v.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{v.name}</h4>
                    <p className="text-xs font-medium text-slate-500">Scanned <span className="font-bold text-slate-700">{v.scans}</span> cards</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 shrink-0">{v.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
