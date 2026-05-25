'use client';

import React, { useEffect, useState, use } from 'react';
import { Loader2, ArrowLeft, RefreshCw, BarChart2, Users, FileSpreadsheet, PieChart, Landmark, Briefcase } from 'lucide-react';
import { eventService } from '@/lib/api';
import Link from 'next/link';

export default function AnalyticsPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await eventService.getAnalytics(resolvedParams.shortCode);
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
  };

  useEffect(() => {
    fetchAnalytics();
  }, [resolvedParams.shortCode]);

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#e52b36]" />
      </div>
    );
  }

  const { hourlyData, sourceData, companyData, designationData } = data;

  // Calculate totals
  const totalVisitors = sourceData.reduce((acc: number, curr: any) => acc + curr.count, 0);
  const maxHourlyCount = Math.max(...hourlyData.map((h: any) => h.count), 1);
  const maxCompanyCount = Math.max(...companyData.map((c: any) => c.count), 1);
  const maxDesignationCount = Math.max(...designationData.map((d: any) => d.count), 1);

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-[#e52b36]" />
            Event Analytics
          </h1>
        </div>

        <button 
          onClick={fetchAnalytics} 
          disabled={loading}
          className="p-2.5 bg-white border border-zinc-200 rounded-xl shadow-sm text-slate-600 hover:bg-zinc-50 hover:text-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-[#e52b36] rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Visitors</span>
            <span className="text-3xl font-black text-slate-900 mt-1">{totalVisitors}</span>
          </div>
        </div>

        {sourceData.map((source: any, i: number) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
            <div className="p-3 bg-zinc-50 text-slate-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{source.source}</span>
              <span className="text-3xl font-black text-slate-900 mt-1">
                {source.count} <span className="text-xs font-semibold text-slate-400">({totalVisitors > 0 ? Math.round((source.count / totalVisitors) * 100) : 0}%)</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Check-In Flow */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-6">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Hourly Entry Flow (Today)
          </h3>
          <div className="flex flex-col gap-4">
            {hourlyData.map((h: any, i: number) => {
              const pct = Math.round((h.count / maxHourlyCount) * 100);
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-16 text-xs font-bold text-slate-500 whitespace-nowrap">{h.hour}</span>
                  <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs font-extrabold text-slate-800 text-right">{h.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-6">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#e52b36]" />
            Onboarding Source Breakdown
          </h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            {sourceData.map((s: any, i: number) => {
              const pct = totalVisitors > 0 ? Math.round((s.count / totalVisitors) * 100) : 0;
              return (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>{s.source}</span>
                    <span>{s.count} scans ({pct}%)</span>
                  </div>
                  <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-[#e52b36]' : 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-6">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-500" />
            Top Organizations Represented
          </h3>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {companyData.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 text-center py-6">No organization metrics available.</p>
            ) : (
              companyData.map((c: any, i: number) => {
                const pct = Math.round((c.count / maxCompanyCount) * 100);
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span className="truncate max-w-[250px]">{c.name}</span>
                      <span>{c.count} visitors</span>
                    </div>
                    <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Designations */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-6">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" />
            Top Visitor Designations
          </h3>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {designationData.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 text-center py-6">No designation metrics available.</p>
            ) : (
              designationData.map((d: any, i: number) => {
                const pct = Math.round((d.count / maxDesignationCount) * 100);
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span className="truncate max-w-[250px]">{d.name}</span>
                      <span>{d.count} visitors</span>
                    </div>
                    <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
