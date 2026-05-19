'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, ChevronDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { eventService } from '@/lib/api';

export default function DashboardPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = React.use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await eventService.getDashboardMetrics(resolvedParams.shortCode);
        if (response.success) {
          setData(response.data);
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
    loadData();
  }, [resolvedParams.shortCode]);

  if (loading || !data) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const { metrics, recentVisitors, volunteerActivity } = data;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        
        <button className="flex items-center gap-3 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-zinc-50 transition-colors">
          <Calendar className="w-4 h-4 text-zinc-400" />
          Today, 24 May 2025
          <ChevronDown className="w-4 h-4 text-zinc-400 ml-2" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Visitors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-slate-600">Total Visitors</h3>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{metrics.totalVisitors.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mt-2">
            <ArrowUp className="w-3 h-3" strokeWidth={3} />
            <span>0% <span className="text-zinc-400 font-medium">vs yesterday</span></span>
          </div>
        </div>

        {/* Today's Visitors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-slate-600">Today's Visitors</h3>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{metrics.todaysVisitors.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mt-2">
            <ArrowUp className="w-3 h-3" strokeWidth={3} />
            <span>0% <span className="text-zinc-400 font-medium">vs yesterday</span></span>
          </div>
        </div>

        {/* Total Volunteers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-slate-600">Total Volunteers</h3>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{metrics.totalVolunteers.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-2">
            Active: <span className="font-bold text-slate-700">{metrics.activeVolunteers}</span>
          </div>
        </div>

        {/* Scans Today */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-slate-600">Scans Today</h3>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{metrics.scansToday.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mt-2">
            <ArrowUp className="w-3 h-3" strokeWidth={3} />
            <span>0% <span className="text-zinc-400 font-medium">vs yesterday</span></span>
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Visitors Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Recent Visitors</h2>
            <button className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">View All</button>
          </div>
          
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
                {recentVisitors.map((v, i) => (
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
        </div>

        {/* Volunteer Activity List */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Volunteer Activity</h2>
            <button className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">View All</button>
          </div>
          
          <div className="flex-1 p-2">
            {volunteerActivity.map((v, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors">
                <img src={v.avatar} alt={v.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">{v.name}</h4>
                  <p className="text-xs font-medium text-slate-500">Scanned <span className="font-bold text-slate-700">{v.scans}</span> cards</p>
                </div>
                <span className="text-xs font-bold text-slate-400">{v.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
