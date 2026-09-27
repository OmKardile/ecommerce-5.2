import React from 'react';
import { headers } from 'next/headers';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminAuthService } from '@/server/services/admin-auth.service';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Operations & Logistics Command Center | Patel Networks Admin',
  description: 'Enterprise CCTV and Networking fulfillment, inventory, and order dispatch console.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const isLoginPage = pathname.includes('/admin/login');

  // If navigating to the login page, render without the sidebar/header dashboard chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  const session = await AdminAuthService.getAdminSession();

  // Belt + suspenders — proxy.ts already redirects unauthenticated / non-
  // SUPER_ADMIN-or-STAFF users to /admin/login, but redirect defensively if
  // the cookie is missing or invalid here too.
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased">
      {/* Operations sidebar — fixed left, hairline right border.
          Filters nav items by the staff member's permissions. */}
      <AdminSidebar
        userRole={session.role}
        userPermissions={session.permissions}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader session={session} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
