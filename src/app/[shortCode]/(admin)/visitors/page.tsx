'use client';

import React, { useEffect, useState, use } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { eventService } from '@/lib/api';
import Link from 'next/link';

export default function VisitorsPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = use(params);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch visitors from backend
  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const response = await eventService.getVisitors(resolvedParams.shortCode, debouncedSearch, currentPage, 15);
      if (response.success) {
        setVisitors(response.data.visitors);
        setTotalPages(response.data.pages);
        setTotalCount(response.data.total);
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
    fetchVisitors();
  }, [resolvedParams.shortCode, debouncedSearch, currentPage]);

  const handleToggleCheckIn = async (registrationId: string) => {
    setTogglingId(registrationId);
    try {
      const response = await eventService.toggleCheckIn(registrationId);
      if (response.success) {
        setVisitors(prev => prev.map(v => {
          if (v.id === registrationId) {
            return {
              ...v,
              checked_in_at: response.data.checked_in_at
            };
          }
          return v;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle check-in status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href={`/${resolvedParams.shortCode}/dashboard`} className="hover:text-slate-700 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registered Visitors</h1>
        </div>

        <button 
          onClick={fetchVisitors} 
          disabled={loading}
          className="p-2.5 bg-white border border-zinc-200 rounded-xl shadow-sm text-slate-600 hover:bg-zinc-50 hover:text-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-[#e52b36] focus:ring-1 focus:ring-[#e52b36] rounded-xl outline-none text-sm text-slate-800 placeholder-zinc-400 font-medium transition-all"
          />
        </div>

        <div className="text-sm font-bold text-slate-500 whitespace-nowrap">
          Total Visitors: <span className="text-slate-800 font-extrabold">{totalCount}</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#e52b36]" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No visitors found</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              {search ? "No registrations matched your search criteria. Try a different query." : "No visitors have registered for this event yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/5">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/4">Contact details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/5">Company</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/6">Designation</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/8 text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 w-1/8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {visitors.map((v, i) => (
                    <tr key={v.id || i} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#e52b36] whitespace-nowrap">{v.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-700">{v.email}</div>
                        <div className="text-xs text-slate-400 font-medium">{v.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 truncate max-w-[200px]">{v.company}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 truncate max-w-[150px]">{v.designation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {v.checked_in_at ? (
                          <span className="inline-flex flex-col items-center">
                            <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Checked In
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold mt-1">
                              {new Date(v.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        ) : (
                          <span className="bg-zinc-100 text-zinc-600 text-xs font-extrabold px-2.5 py-1 rounded-full border border-zinc-200">
                            Registered
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleToggleCheckIn(v.id)}
                          disabled={togglingId === v.id}
                          className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                            v.checked_in_at
                              ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800'
                              : 'bg-[#e52b36] border-[#e52b36] text-white hover:bg-red-600'
                          } disabled:opacity-55`}
                        >
                          {togglingId === v.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : v.checked_in_at ? (
                            'Undo Check-In'
                          ) : (
                            'Check In'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Page <span className="text-slate-800">{currentPage}</span> of <span className="text-slate-800">{totalPages}</span>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-zinc-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors shadow-sm bg-zinc-50"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-zinc-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors shadow-sm bg-zinc-50"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
