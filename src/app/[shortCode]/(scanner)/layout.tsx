import React from 'react';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  // In a real scenario, fetch tenant color from backend using shortCode
  // For sample event, we use a specific color like purple or legrand red
  const isSample = shortCode.toUpperCase() === 'SAMPLE24';
  const primaryColor = isSample ? '#e52b36' : '#0f172a'; // Legrand Red for sample
  const primaryForeground = '#ffffff';

  return (
    <div
      style={{
        '--primary-color': primaryColor,
        '--primary-foreground': primaryForeground,
      } as React.CSSProperties}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black">
              {shortCode.charAt(0).toUpperCase()}
            </div>
            <h1 className="font-bold tracking-tight">
              {isSample ? 'Legrand Event' : shortCode.toUpperCase()}
            </h1>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
            Visitor Capture
          </div>
        </div>
      </header>

      {/* Main Content Area optimized for mobile */}
      <main className="max-w-md mx-auto min-h-[calc(100vh-64px)] relative">
        {children}
      </main>
    </div>
  );
}
