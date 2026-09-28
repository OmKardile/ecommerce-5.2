'use client';

import React, { useMemo, useState, useTransition } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  ShieldCheck,
  UserRound,
  Lock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
  DEFAULT_PERMISSIONS,
  getPermissionLabel,
  getPermissionModule,
} from '@/lib/permissions';
import { createEmployeeAction } from '@/app/actions/employee.actions';
import type { EmployeeSummary } from '@/app/actions/employee.actions';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface StaffFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  employeeCode: string;
  permissions: string[];
}

const EMPTY_FORM: StaffFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  employeeCode: '',
  permissions: [...DEFAULT_PERMISSIONS], // ['DASHBOARD_VIEW']
};

const STEPS = ['Staff details', 'Permissions', 'Review & create'] as const;

interface Props {
  onClose: () => void;
  onCreated: (employee: EmployeeSummary) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

/**
 * StaffCreationWizard — a 3-step modal for creating a new staff member.
 *
 * Step 1: identity (fullName, email, phone, password, employeeCode)
 * Step 2: permission matrix — every group in PERMISSION_GROUPS rendered as
 *         a solid card with a checkbox per permission. DASHBOARD_VIEW is
 *         pre-checked (locked-base) by default.
 * Step 3: review summary + create button → calls createEmployeeAction.
 *
 * Clean Trust design system: bg-card surfaces, border-border-strong for
 * structural borders, .eyebrow section headers, .btn-ink primary actions,
 * blue accent ([var(--brand)]).
 */
export function StaffCreationWizard({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /* ---------------- step validation ---------------- */
  const step1Valid = useMemo(() => {
    return (
      form.fullName.trim().length > 0 &&
      /\S+@\S+\.\S+/.test(form.email.trim()) &&
      form.phone.trim().length >= 8 &&
      form.password.length >= 6
    );
  }, [form.fullName, form.email, form.phone, form.password]);

  const step2Valid = form.permissions.length > 0;

  const canAdvance = step === 0 ? step1Valid : step === 1 ? step2Valid : true;

  /* ---------------- permission toggles ---------------- */
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
        permissions: next.length ? next : [...DEFAULT_PERMISSIONS],
      };
    });
  };

  const toggleGroup = (group: (typeof PERMISSION_GROUPS)[number]) => {
    setForm((prev) => {
      const groupPerms = group.permissions.map((p) => p.value);
      const allOn = groupPerms.every((p) => prev.permissions.includes(p));
      let next: string[];
      if (allOn) {
        // Turn off all in group — but never remove DASHBOARD_VIEW.
        next = prev.permissions.filter(
          (p) => !groupPerms.includes(p) || p === 'DASHBOARD_VIEW'
        );
      } else {
        // Turn on all in group.
        next = Array.from(new Set([...prev.permissions, ...groupPerms]));
      }
      return {
        ...prev,
        permissions: next.length ? next : [...DEFAULT_PERMISSIONS],
      };
    });
  };

  /* ---------------- navigation ---------------- */
  const next = () => {
    setError(null);
    if (step === 0 && !step1Valid) {
      setError(
        'Please fill in full name, a valid email, phone (8+ digits), and a password of at least 6 characters.'
      );
      return;
    }
    if (step === 1 && !step2Valid) {
      setError('Select at least one permission for this staff member.');
      return;
    }
    if (step < 2) setStep((s) => (s + 1) as 0 | 1 | 2);
  };

  const back = () => {
    setError(null);
    if (step > 0) setStep((s) => (s - 1) as 0 | 1 | 2);
  };

  /* ---------------- submit ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!step1Valid || !step2Valid) {
      setError('Form is incomplete. Please review the previous steps.');
      return;
    }

    const fd = new FormData();
    fd.set('fullName', form.fullName.trim());
    fd.set('email', form.email.trim().toLowerCase());
    fd.set('phone', form.phone.trim());
    fd.set('password', form.password);
    fd.set('employeeCode', form.employeeCode.trim());
    fd.set('isActive', 'true');
    for (const p of form.permissions) {
      fd.append('permissions', p);
    }

    startTransition(async () => {
      const res = await createEmployeeAction(fd);
      if (res.success) {
        onCreated(res.data);
      } else {
        setError(res.error || 'Failed to create staff member.');
      }
    });
  };

  /* ---------------- render ---------------- */
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border-strong max-w-3xl w-full rounded-sm my-8 shadow-xl">
        {/* ---------------- Modal header ---------------- */}
        <div className="flex items-start justify-between p-6 border-b border-border-strong">
          <div className="min-w-0">
            <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
              <span className="dot-rec" />
              New Staff Member
            </div>
            <h3 className="text-lg font-sans font-bold tracking-tight text-foreground">
              Create Staff Account
            </h3>
            <p className="text-[12px] text-stone-500 mt-1 leading-relaxed max-w-xl">
              Walk through identity, then assign granular permissions across the
              entire operations console. The staff member will be created with
              the <span className="font-mono text-[var(--brand)]">STAFF</span>{' '}
              role.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-foreground transition-colors p-1 shrink-0"
            aria-label="Close wizard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ---------------- Stepper ---------------- */}
        <div className="px-6 py-4 border-b border-border-subtle bg-background/40">
          <ol className="flex items-center gap-2">
            {STEPS.map((label, idx) => {
              const isActive = step === idx;
              const isComplete = step > idx;
              return (
                <li key={label} className="flex items-center gap-2 min-w-0">
                  <div
                    className={`flex items-center gap-2.5 px-3 py-1.5 border transition-colors ${
                      isActive
                        ? 'border-border-strong bg-card text-foreground'
                        : isComplete
                        ? 'border-border bg-card text-foreground'
                        : 'border-border-subtle bg-background text-stone-500'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono font-medium border ${
                        isActive
                          ? 'border-[var(--brand)] text-[var(--brand)] bg-background'
                          : isComplete
                          ? 'border-foreground text-foreground bg-foreground text-background'
                          : 'border-border-subtle text-stone-500'
                      }`}
                    >
                      {isComplete ? <Check className="w-3 h-3" /> : idx + 1}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em]">
                      {label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* ---------------- Step body ---------------- */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {step === 0 && (
            <StepDetails form={form} setForm={setForm} />
          )}

          {step === 1 && (
            <StepPermissions
              form={form}
              togglePermission={togglePermission}
              toggleGroup={toggleGroup}
            />
          )}

          {step === 2 && <StepReview form={form} />}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 border border-amber-500/40 bg-amber-500/5 text-[11px] text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Navigation row */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-border-subtle">
            <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
              Step {step + 1} of {STEPS.length}
            </div>
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  disabled={isPending}
                  className="btn-ghost text-xs disabled:opacity-50"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="btn-ghost text-xs disabled:opacity-50"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Cancel
                </button>
              )}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canAdvance || isPending}
                  className="btn-ink text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-ink text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create Staff Member</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Staff details                                            */
/* ------------------------------------------------------------------ */

interface StepDetailsProps {
  form: StaffFormState;
  setForm: React.Dispatch<React.SetStateAction<StaffFormState>>;
}

function StepDetails({ form, setForm }: StepDetailsProps) {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Identity"
        icon={<UserRound className="w-3.5 h-3.5" />}
        title="Staff member details"
        subtitle="These credentials will let the staff member sign in to the operations console."
      />

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email *" hint="Used as the login identifier.">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="rajesh@patelnetworks.in"
            className={inputClass}
          />
        </Field>
        <Field label="Phone *" hint="Mobile number with country code.">
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+91 98XXXXXXXX"
            className={`${inputClass} font-mono`}
          />
        </Field>
      </div>

      <Field
        label="Password *"
        hint="Minimum 6 characters. Staff can change this later via a superadmin reset."
      >
        <div className="relative">
          <Lock className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="••••••••"
            className={`${inputClass} pl-9`}
          />
        </div>
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Permission matrix                                        */
/* ------------------------------------------------------------------ */

interface StepPermissionsProps {
  form: StaffFormState;
  togglePermission: (perm: string) => void;
  toggleGroup: (group: (typeof PERMISSION_GROUPS)[number]) => void;
}

function StepPermissions({
  form,
  togglePermission,
  toggleGroup,
}: StepPermissionsProps) {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Access Matrix"
        icon={<ShieldCheck className="w-3.5 h-3.5" />}
        title="Assign staff permissions"
        subtitle="Toggle individual permissions per module. SUPER_ADMIN always has full access — staff are limited to what you select here."
      />

      <div className="flex items-center justify-between text-[11px] text-stone-500">
        <span className="font-mono uppercase tracking-wider">
          {form.permissions.length} of {ALL_PERMISSIONS.length} permissions granted
        </span>
        <span className="text-[10px]">
          DASHBOARD_VIEW is the base permission and cannot be removed.
        </span>
      </div>

      {/* Permission matrix — one solid card per group */}
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
              {/* Group header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/30">
                <div className="min-w-0">
                  <div className="text-[13px] font-sans font-bold tracking-tight text-foreground">
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

              {/* Permission rows */}
              <div className="divide-y divide-border-subtle">
                {group.permissions.map((perm) => {
                  const checked = form.permissions.includes(perm.value);
                  const locked = perm.value === 'DASHBOARD_VIEW';
                  return (
                    <label
                      key={perm.value}
                      className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        checked ? 'bg-background/60' : 'hover:bg-background/30'
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
                          <span className="text-[12px] font-medium text-foreground">
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
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Review                                                   */
/* ------------------------------------------------------------------ */

function StepReview({ form }: { form: StaffFormState }) {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Confirmation"
        icon={<Check className="w-3.5 h-3.5" />}
        title="Review & create"
        subtitle="Please verify the details below before creating this staff member."
      />

      {/* Identity card */}
      <div className="border border-border-strong bg-card p-5">
        <div className="eyebrow text-stone-500 mb-3 flex items-center gap-2">
          <UserRound className="w-3 h-3" />
          Identity
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
          <ReviewRow label="Full Name" value={form.fullName} />
          <ReviewRow label="Employee Code" value={form.employeeCode || '—'} />
          <ReviewRow label="Email" value={form.email} mono />
          <ReviewRow label="Phone" value={form.phone} mono />
          <ReviewRow
            label="Role"
            value={
              <span className="font-mono text-[var(--brand)]">STAFF</span>
            }
          />
          <ReviewRow
            label="Password"
            value={
              <span className="font-mono text-stone-500">
                {'•'.repeat(Math.min(form.password.length, 12))}
              </span>
            }
          />
        </dl>
      </div>

      {/* Permissions summary */}
      <div className="border border-border-strong bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="eyebrow text-stone-500 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            Permissions Granted
          </div>
          <span className="text-[10px] font-mono text-stone-500">
            {form.permissions.length} of {ALL_PERMISSIONS.length}
          </span>
        </div>
        {form.permissions.length === 0 ? (
          <p className="text-[11px] text-stone-500 italic">
            No permissions selected.
          </p>
        ) : (
          <div className="space-y-2">
            {form.permissions.map((perm) => (
              <div
                key={perm}
                className="flex items-start justify-between gap-3 py-1.5 border-b border-border-subtle last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-foreground">
                    {getPermissionLabel(perm)}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    Module: {getPermissionModule(perm)}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[var(--brand)] uppercase tracking-wider shrink-0">
                  {perm}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 px-3 py-2.5 border border-border bg-background/40 text-[11px] text-stone-600 dark:text-stone-300">
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-500" />
        <span className="leading-relaxed">
          The staff member will be created immediately and can sign in using the
          email and password above. You can adjust permissions or deactivate the
          account at any time from the staff roster.
        </span>
      </div>
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

function SectionHeader({
  eyebrow,
  icon,
  title,
  subtitle,
}: {
  eyebrow: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-border-subtle pb-3">
      <div className="eyebrow text-stone-500 mb-1.5 flex items-center gap-1.5">
        {icon && <span aria-hidden>{icon}</span>}
        <span>{eyebrow}</span>
      </div>
      <h4 className="text-[15px] font-sans font-bold tracking-tight text-foreground">
        {title}
      </h4>
      {subtitle && (
        <p className="text-[11px] text-stone-500 mt-1 leading-relaxed max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border-subtle pb-2 last:border-b-0">
      <dt className="eyebrow text-stone-500 text-[10px]">{label}</dt>
      <dd
        className={`text-foreground text-right truncate max-w-[60%] ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
