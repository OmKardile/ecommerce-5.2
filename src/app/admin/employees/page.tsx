import React from 'react';
import { prisma } from '@/server/db';
import { UserRole } from '@prisma/client';
import { EmployeeManagementConsole } from '@/components/admin/EmployeeManagementConsole';
import type { EmployeeSummary } from '@/app/actions/employee.actions';

export const revalidate = 0; // Dynamic server component

/**
 * AdminEmployeesPage — server component.
 *
 * Fetches every user with the STAFF role and the matching EmployeeProfile
 * row, then hands them to the client console for CRUD.
 *
 * Layout chrome (sidebar + header) is provided by /admin/layout.tsx.
 */
export default async function AdminEmployeesPage() {
  const profiles = await prisma.employeeProfile.findMany({
    where: {
      user: { role: UserRole.STAFF },
    },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  const employees: EmployeeSummary[] = profiles.map((p) => ({
    id: p.id,
    userId: p.userId,
    fullName: p.fullName,
    email: p.user.email,
    phone: p.phone,
    loginPhone: p.user.phone,
    employeeCode: p.employeeCode,
    permissions: p.permissions,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
          <span className="dot-rec" aria-hidden />
          <span>Stock Panel · Access Control</span>
        </div>
        <h1 className="font-sans text-[26px] sm:text-[30px] leading-none font-bold tracking-tight text-foreground">
          Employee Management
        </h1>
        <p className="text-[13px] text-stone-500 mt-2 max-w-2xl">
          Create warehouse &amp; inventory employee accounts, assign granular stock-panel
          permissions, and activate or deactivate access. Every change is audited under the
          signed-in SUPER_ADMIN.
        </p>
      </div>

      <EmployeeManagementConsole initialEmployees={employees} />
    </div>
  );
}
