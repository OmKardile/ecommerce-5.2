'use client';

import React, { useMemo, useState, useTransition } from 'react';
import {
  Search,
  X,
  Pencil,
  Power,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import {
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
  DEFAULT_PERMISSIONS,
  getPermissionLabel,
  getPermissionModule,
} from '@/lib/permissions';
import {
  updateEmployeeAction,
  toggleEmployeeActiveAction,
  resetEmployeePasswordAction,
  type EmployeeSummary,
} from '@/app/actions/employee.actions';
import { StaffCreationWizard } from '@/components/admin/StaffCreationWizard';

/* ------------------------------------------------------------------ */
/*  Form state                                                        */
/* ------------------------------------------------------------------ */

interface EmployeeFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  employeeCode: string;
  permissions: string[];
  isActive: boolean;
}

const EMPTY_EDIT_FORM: EmployeeFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  employeeCode: '',
  permissions: DEFAULT_PERMISSIONS,
  isActive: true,
};

/* ------------------------------------------------------------------ */
/*  Component                                                        */
/* ------------------------------------------------------------------ */

interface Props {
  initialEmployees: EmployeeSummary[];
}

export function EmployeeManagementConsole({ initialEmployees }: Props) {
  const [employees, setEmployees] = useState<EmployeeSummary[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeSummary | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(EMPTY_EDIT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<EmployeeSummary | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isTogglePending, startToggleTransition] = useTransition();
  const [isResetPending, startResetTransition] = useTransition();

  /* ---------------- derived metrics ---------------- */
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.isActive).length;
    const inactive = total - active;
    const permsGranted = employees.reduce(
      (sum, e) => sum + (e.isActive ? e.permissions.length : 0),
      0
    );
    return { total, active, inactive, permsGranted };
  }, [employees]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.phone && e.phone.includes(q)) ||
        (e.employeeCode && e.employeeCode.toLowerCase().includes(q))
    );
  }, [employees, searchQuery]);

  /* ---------------- modal openers ---------------- */
  const openCreate = () => {
    setWizardOpen(true);
  };

  const openEdit = (emp: EmployeeSummary) => {
    setEditing(emp);
    setForm({
      fullName: emp.fullName,
      email: emp.email || '',
      phone: emp.phone || emp.loginPhone,
      password: '',
      employeeCode: emp.employeeCode || '',
      permissions: emp.permissions.length
        ? emp.permissions
        : DEFAULT_PERMISSIONS,
      isActive: emp.isActive,
    });
    setFormError(null);
  };

  const closeModal = () => {
    setEditing(null);
    setFormError(null);
  };

  const openReset = (emp: EmployeeSummary) => {
    setResetTarget(emp);
    setResetPassword('');
    setResetError(null);
  };

  const closeReset = () => {
    setResetTarget(null);
    setResetPassword('');
    setResetError(null);
  };

  /* ---------------- handlers ---------------- */
  const togglePermission = (perm: string) => {
    setForm((prev) => {
      const has = prev.permissions.includes(perm);
      // DASHBOARD_VIEW is the base permission — cannot be removed.
      if (perm === 'DASHBOARD_VIEW' && has) return prev;
      const next = has
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm];
      return {
        ...prev,
        permissions: next.length ? next : DEFAULT_PERMISSIONS,
      };
    });
  };

  const toggleGroup = (group: (typeof PERMISSION_GROUPS)[number]) => {
    setForm((prev) => {
      const groupPerms = group.permissions.map((p) => p.value);
      const allOn = groupPerms.every((p) => prev.permissions.includes(p));
      let next: string[];
      if (allOn) {
        next = prev.permissions.filter(
          (p) => !groupPerms.includes(p) || p === 'DASHBOARD_VIEW'
        );
      } else {
        next = Array.from(new Set([...prev.permissions, ...groupPerms]));
      }
      return {
        ...prev,
        permissions: next.length ? next : DEFAULT_PERMISSIONS,
      };
    });
  };

  const handleCreated = (emp: EmployeeSummary) => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === emp.id);
      if (idx === -1) return [...prev, emp];
      const copy = prev.slice();
      copy[idx] = emp;
      return copy;
    });
    setFeedback(
      `Created ${emp.fullName}${emp.employeeCode ? ` · ${emp.employeeCode}` : ''}`
    );
    setWizardOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setFormError(null);

    const fd = new FormData();
    fd.set('fullName', form.fullName.trim());
    fd.set('phone', form.phone.trim());
    fd.set('employeeCode', form.employeeCode.trim());
    fd.set('isActive', String(form.isActive));
    for (const p of form.permissions) {
      fd.append('permissions', p);
    }

    startTransition(async () => {
      const res = await updateEmployeeAction(editing.id, fd);
      if (res.success) {
        const next = res.data;
        setEmployees((prev) =>
          prev.map((e) => (e.id === next.id ? next : e))
        );
        setFeedback(`Saved ${next.fullName}`);
        closeModal();
      } else {
        setFormError(res.error || 'Something went wrong.');
      }
    });
  };

  const handleToggleActive = (emp: EmployeeSummary) => {
    startToggleTransition(async () => {
      const res = await toggleEmployeeActiveAction(emp.id);
      if (res.success) {
        const next = res.data;
        setEmployees((prev) =>
          prev.map((e) => (e.id === next.id ? next : e))
        );
        setFeedback(
          `${next.fullName} ${next.isActive ? 'activated' : 'deactivated'}`
        );
      } else {
        setFeedback(res.error || 'Failed to toggle status');
      }
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError(null);
    startResetTransition(async () => {
      const res = await resetEmployeePasswordAction(
        resetTarget.id,
        resetPassword
      );
      if (res.success) {
        setFeedback(`Password reset for ${resetTarget.fullName}`);
        closeReset();
      } else {
        setResetError(res.error || 'Failed to reset password');
      }
    });
  };

  /* ---------------- render ---------------- */
  return (
    <div className="bg-background text-foreground space-y-6">
      {/* KPI strip — hairline editorial cells */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border-strong rounded-sm overflow-hidden">
        <KpiCell
          label="Total Employees"
          value={String(stats.total)}
          icon={<UserCheck className="w-3 h-3 text-stone-500" />}
        />
        <KpiCell
          label="Active"
          value={String(stats.active)}
          tone="ok"
          icon={<CheckCircle2 className="w-3 h-3 text-emerald-500" />}
        />
        <KpiCell
          label="Deactivated"
          value={String(stats.inactive)}
          tone={stats.inactive > 0 ? 'warn' : undefined}
          icon={<Power className="w-3 h-3 text-stone-500" />}
        />
        <KpiCell
          label="Permissions Granted"
          value={String(stats.permsGranted)}
          icon={<ShieldCheck className="w-3 h-3 text-[var(--brand)]" />}
        />
      </div>

      {/* Console meta + toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-strong pb-5">
        <div className="flex items-baseline gap-4 flex-wrap">
          <div className="eyebrow text-stone-500 flex items-center gap-2">
            <span className="dot-rec" /> Staff Roster
          </div>
          <div className="text-xs font-mono text-stone-400">
            {filtered.length} of {employees.length} shown
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone, code"
              className="w-full pl-9 pr-3 h-9 bg-card border border-border text-xs text-foreground placeholder:text-stone-500 focus:outline-none focus:border-border-strong rounded-sm transition-colors font-sans"
            />
          </div>

          {feedback && (
            <div className="px-3 py-1.5 border border-border bg-card text-[11px] text-foreground flex items-center gap-2 rounded-sm">
              <span className="dot-rec" />
              <span className="font-mono truncate max-w-[200px]">{feedback}</span>
            </div>
          )}

          <button
            type="button"
            onClick={openCreate}
            className="btn-ink text-xs"
            style={{ padding: '0.5rem 1rem' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Staff</span>
          </button>
        </div>
      </div>

      {/* Employee roster table — solid header + denser rows */}
      <div className="border border-border-strong bg-card overflow-hidden rounded-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead className="bg-foreground/5 border-b-2 border-border-strong">
              <tr>
                <th className="eyebrow py-3.5 px-4 font-semibold">Code</th>
                <th className="eyebrow py-3.5 px-4 font-semibold">Employee</th>
                <th className="eyebrow py-3.5 px-4 font-semibold">Contact</th>
                <th className="eyebrow py-3.5 px-4 font-semibold">Permissions</th>
                <th className="eyebrow py-3.5 px-4 font-semibold">Status</th>
                <th className="eyebrow py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-stone-500">
                    {employees.length === 0
                      ? 'No staff yet — click “Create Staff” to launch the wizard and add your first team member.'
                      : 'No staff match the current search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className={`hover:bg-background/40 transition-colors ${
                      !emp.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-[var(--brand)]">
                        {emp.employeeCode || '—'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-sm text-foreground font-medium">
                        {emp.fullName}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Joined{' '}
                        {new Date(emp.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-foreground font-mono">
                        {emp.email || '—'}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {emp.phone || emp.loginPhone}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.permissions.length === 0 ? (
                          <span className="text-[10px] text-stone-500 italic">
                            None
                          </span>
                        ) : (
                          emp.permissions.map((p) => (
                            <span
                              key={p}
                              title={`${getPermissionModule(p)} · ${getPermissionLabel(p)}`}
                              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-border-subtle text-stone-600 dark:text-stone-300 bg-background/60 rounded-sm"
                            >
                              {p}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {emp.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(emp)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-foreground border border-border hover:border-border-strong hover:bg-background/40 rounded-sm transition-colors"
                          title="Edit staff member"
                        >
                          <Pencil className="w-3 h-3" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openReset(emp)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-stone-500 hover:text-foreground border border-border-subtle hover:border-border rounded-sm transition-colors"
                          title="Reset password"
                        >
                          <KeyRound className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(emp)}
                          disabled={isTogglePending}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium border rounded-sm transition-colors disabled:opacity-50 ${
                            emp.isActive
                              ? 'text-amber-600 dark:text-amber-400 border-amber-500/40 hover:border-amber-500'
                              : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:border-emerald-500'
                          }`}
                          title={emp.isActive ? 'Deactivate staff' : 'Activate staff'}
                        >
                          <Power className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {emp.isActive ? 'Disable' : 'Enable'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Creation Wizard (modal) */}
      {wizardOpen && (
        <StaffCreationWizard
          onClose={() => setWizardOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Edit modal — full permission matrix */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border-strong max-w-3xl w-full rounded-sm my-8 shadow-xl">
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-border-strong">
              <div>
                <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                  <span className="dot-rec" />
                  Edit Staff Member
                </div>
                <h3 className="text-base font-sans font-bold tracking-tight text-foreground">
                  {editing.fullName}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed max-w-md">
                  Update profile, contact, and the full permission set across every
                  module. Leave password blank to keep the existing one.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-stone-400 hover:text-foreground transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs">
              {/* Identity row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *">
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, fullName: e.target.value }))
                    }
                    placeholder="e.g. Rajesh Kumar"
                    className={inputClass}
                  />
                </Field>
                <Field label="Employee Code">
                  <input
                    type="text"
                    value={form.employeeCode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, employeeCode: e.target.value }))
                    }
                    placeholder="EMP-001"
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              </div>

              {/* Contact row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Email"
                  hint="Email changes are not permitted from this form."
                >
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="rajesh@patelnetworks.in"
                    disabled
                    className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                </Field>
                <Field label="Phone *">
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+91 98XXXXXXXX"
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              </div>

              {/* Password + active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="New Password"
                  hint="Leave blank to keep existing password."
                >
                  <input
                    type="password"
                    minLength={form.password ? 6 : undefined}
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </Field>
                <Field label="Active State">
                  <label className="flex items-center gap-2.5 h-9 px-3 border border-border bg-background rounded-sm cursor-pointer hover:border-border-strong transition-colors">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, isActive: e.target.checked }))
                      }
                      className="w-3.5 h-3.5 accent-[var(--brand)] cursor-pointer"
                    />
                    <span className="text-[12px] text-foreground">
                      {form.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </label>
                </Field>
              </div>

              {/* Full permission matrix */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-border-subtle pb-2">
                  <div className="eyebrow text-stone-500 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Permission Matrix
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">
                    {form.permissions.length} of {ALL_PERMISSIONS.length} granted
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {PERMISSION_GROUPS.map((group) => {
                    const groupPerms = group.permissions.map((p) => p.value);
                    const allOn = groupPerms.every((p) =>
                      form.permissions.includes(p)
                    );
                    const someOn =
                      !allOn &&
                      groupPerms.some((p) => form.permissions.includes(p));

                    return (
                      <div
                        key={group.module}
                        className={`border bg-card rounded-sm overflow-hidden transition-colors ${
                          allOn || someOn
                            ? 'border-border-strong'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-background/30">
                          <div className="min-w-0">
                            <div className="text-[12px] font-sans font-bold tracking-tight text-foreground">
                              {group.module}
                            </div>
                            <div className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                              {group.description}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleGroup(group)}
                            className="text-[10px] font-mono uppercase tracking-wider text-[var(--brand)] hover:underline px-2 py-1 border border-border-subtle hover:border-border rounded-sm transition-colors shrink-0"
                          >
                            {allOn ? 'Clear' : 'All'}
                          </button>
                        </div>
                        <div className="divide-y divide-border-subtle">
                          {group.permissions.map((perm) => {
                            const checked = form.permissions.includes(perm.value);
                            const locked = perm.value === 'DASHBOARD_VIEW';
                            return (
                              <label
                                key={perm.value}
                                className={`flex items-start gap-3 px-3 py-2 cursor-pointer transition-colors ${
                                  checked
                                    ? 'bg-background/60'
                                    : 'hover:bg-background/30'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={locked}
                                  onChange={() => togglePermission(perm.value)}
                                  className="mt-0.5 w-3.5 h-3.5 accent-[var(--brand)] cursor-pointer disabled:cursor-not-allowed shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11.5px] font-medium text-foreground">
                                      {perm.label}
                                    </span>
                                    <span className="font-mono text-[10px] text-[var(--brand)] uppercase tracking-wider">
                                      {perm.value}
                                    </span>
                                    {locked && (
                                      <span className="text-[9px] uppercase tracking-wider text-stone-500 border border-border-subtle px-1 py-0.5 leading-none">
                                        base
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10.5px] text-stone-500 mt-0.5 leading-relaxed">
                                    {perm.description}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-start gap-2 px-3 py-2 border border-amber-500/40 bg-amber-500/5 rounded-sm text-[11px] text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
              )}

              {/* Submit row */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-ghost text-xs"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-ink disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border-strong max-w-md w-full rounded-sm">
            <div className="flex items-start justify-between p-5 border-b border-border-subtle">
              <div>
                <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                  <KeyRound className="w-3 h-3" />
                  Reset Password
                </div>
                <h3 className="text-base font-sans font-bold tracking-tight text-foreground">
                  {resetTarget.fullName}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Sets a new password hash on the staff member&apos;s user account.
                  The previous password is overwritten immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={closeReset}
                className="text-stone-400 hover:text-foreground transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-5 space-y-4 text-xs">
              <Field label="New Password *">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className={inputClass}
                />
              </Field>

              {resetError && (
                <div className="flex items-start gap-2 px-3 py-2 border border-amber-500/40 bg-amber-500/5 rounded-sm text-[11px] text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{resetError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={closeReset}
                  className="btn-ghost text-xs"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetPending}
                  className="btn-ink disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {isResetPending ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                      */
/* ------------------------------------------------------------------ */

const inputClass =
  'w-full h-9 px-3 bg-background border border-border text-foreground text-xs placeholder:text-stone-500 focus:outline-none focus:border-border-strong rounded-sm transition-colors font-sans';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="eyebrow text-stone-500 flex items-center justify-between">
        <span>{label}</span>
        {hint && (
          <span className="text-[9px] normal-case tracking-normal text-stone-500 font-normal">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function KpiCell({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: 'ok' | 'warn';
}) {
  return (
    <div className="bg-card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow text-stone-500">{label}</span>
        {icon && <span aria-hidden>{icon}</span>}
      </div>
      <div
        className={`font-sans text-2xl font-bold tracking-tight leading-none ${
          tone === 'ok'
            ? 'text-emerald-600 dark:text-emerald-400'
            : tone === 'warn'
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
