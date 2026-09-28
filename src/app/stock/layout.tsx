import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { StockSidebar } from '@/components/stock/StockSidebar';
import { StockHeader } from '@/components/stock/StockHeader';
import { EmployeeAuthService } from '@/server/services/employee-auth.service';

export const metadata = {
  title: 'Stock Monitor Panel | Patel Networks Warehouse',
  description:
    'Warehouse employee panel for inventory monitoring, low-stock alerts, stock movements, and physical count reconciliation.',
};

/**
 * StockLayout — server wrapper for the warehouse stock panel.
 *
 * - If the route is /stock/login, render the children bare (no sidebar).
 * - Otherwise verify an active employee session (pn_stock_session cookie).
 *   If missing or lacking STOCK_VIEW, redirect to /stock/login.
 *
 * Clean Trust theme (light by default). Sidebar + header + main content.
 */
export default async function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const isLoginPage = pathname.endsWith('/stock/login') || pathname.includes('/stock/login');

  if (isLoginPage) {
    return <>{children}</>;
  }

  const session = await EmployeeAuthService.getEmployeeSession();

  if (!session) {
    redirect('/stock/login');
  }

  if (!EmployeeAuthService.hasPermission(session, 'STOCK_VIEW')) {
    redirect('/stock/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased">
      <StockSidebar session={session} />

      <div className="flex-1 flex flex-col min-w-0">
        <StockHeader session={session} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
