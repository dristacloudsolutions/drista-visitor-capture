'use client';

import React, { useState, use } from 'react';
import { Loader2, ArrowLeft, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { eventService } from '@/lib/api';
import Link from 'next/link';

export default function ExportPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = use(params);
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCsvExport = async () => {
    setExporting(true);
    setSuccess(false);
    setError(null);

    try {
      // Fetch up to 5000 visitors for the export
      const response = await eventService.getVisitors(resolvedParams.shortCode, '', 1, 5000);
      
      if (!response.success || !response.data.visitors || response.data.visitors.length === 0) {
        setError('No visitor records found to export.');
        setExporting(false);
        return;
      }

      const visitorsList = response.data.visitors;

      // Define CSV Headers
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Designation', 'Check-In Status', 'Check-In Time', 'Registration Date'];
      
      // Map rows
      const rows = visitorsList.map((v: any) => [
        v.id || '',
        v.name ? `"${v.name.replace(/"/g, '""')}"` : '""',
        v.email ? `"${v.email.replace(/"/g, '""')}"` : '""',
        v.phone ? `"${v.phone.replace(/"/g, '""')}"` : '""',
        v.company ? `"${v.company.replace(/"/g, '""')}"` : '""',
        v.designation ? `"${v.designation.replace(/"/g, '""')}"` : '""',
        v.checked_in_at ? 'Checked In' : 'Registered Only',
        v.checked_in_at ? `"${new Date(v.checked_in_at).toLocaleString()}"` : '""',
        v.created_at ? `"${new Date(v.created_at).toLocaleString()}"` : '""'
      ]);

      // Combine into CSV Content
      const csvContent = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
      
      // Create and download blob file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `visitors_export_${resolvedParams.shortCode}_${new Date().toISOString().slice(0, 10)}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to export visitor records. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href={`/${resolvedParams.shortCode}/dashboard`} className="hover:text-slate-700 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Download className="w-8 h-8 text-[#e52b36]" />
          Export Visitor Data
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Generate and download a spreadsheet containing all visitor registrations, contact details, parsed organization names, and live check-in timestamps.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-4 bg-zinc-50 p-6 rounded-xl border border-zinc-100">
          <div className="p-3.5 bg-red-50 text-[#e52b36] rounded-xl flex-shrink-0">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Comma-Separated Values (.csv)</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Standard spreadsheet format compatible with Microsoft Excel, Google Sheets, and CRM software.
            </p>
          </div>
        </div>

        {/* Success / Error Messages */}
        {success && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm">Export completed successfully!</span>
              <span className="text-xs text-emerald-700 mt-0.5">Your download should start momentarily. Check your downloads directory.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm">Export failed</span>
              <span className="text-xs text-red-700 mt-0.5">{error}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleCsvExport}
          disabled={exporting}
          className="w-full py-4 bg-[#e52b36] hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Compiling visitor spreadsheet...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export & Download CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
}
