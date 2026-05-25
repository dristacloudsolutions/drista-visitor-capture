'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventService } from '@/lib/api';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await eventService.adminLogin({ email, password });
      if (response.success && response.data?.access_token) {
        // Save the JWT token
        localStorage.setItem('drista_admin_token', response.data.access_token);
        
        // Redirect to Dashboard
        router.push(`/${resolvedParams.shortCode}/dashboard`);
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] w-full">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Login</h1>
          <p className="text-sm font-medium text-slate-500 mt-2 text-center">
            Sign in with your platform credentials to access the visitor dashboard for {resolvedParams.shortCode.toUpperCase()}.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="admin@legrand.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 mt-4 disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
            ) : (
              <>Sign In <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
