'use client';

import React, { useEffect } from 'react';
import { LayoutDashboard, Users, UserSquare2, BarChart2, Download, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = React.use(params);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('drista_admin_token');
    if (!token) {
      router.push(`/${shortCode}/login`);
    }
  }, [shortCode, router]);

  // Navigation Items
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: `/${shortCode}/dashboard`, active: true },
    { name: 'Visitors', icon: Users, href: `/${shortCode}/visitors` },
    { name: 'Volunteers', icon: UserSquare2, href: `/${shortCode}/volunteers` },
    { name: 'Analytics', icon: BarChart2, href: `/${shortCode}/analytics` },
    { name: 'Export Data', icon: Download, href: `/${shortCode}/export` },
    { name: 'Settings', icon: Settings, href: `/${shortCode}/settings` },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2a2c32] text-white flex flex-col fixed h-full left-0 top-0">
        {/* Logo Area */}
        <div className="p-6 pb-8 flex items-center gap-3">
           <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center font-black">
             {shortCode.charAt(0).toUpperCase()}
           </div>
           <span className="text-xl font-bold tracking-tight">
             {shortCode.toUpperCase() === 'SAMPLE24' ? 'legrand' : shortCode.toUpperCase()}
           </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors ${
                  item.active 
                    ? 'bg-[#e52b36] text-white shadow-lg shadow-red-500/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div className="p-4 mt-auto mb-4 mx-4 rounded-xl bg-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Admin</p>
            <p className="text-xs font-medium text-zinc-400">
              {shortCode.toUpperCase() === 'SAMPLE24' ? 'Legrand Team' : 'Event Admin'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
