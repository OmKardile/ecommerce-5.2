'use client';

import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import { simulateTrackingProgressAction } from '@/app/actions/shipping.actions';

export interface TrackingEvent {
  id: string;
  status: string;
  location?: string | null;
  timestamp: string | Date;
  activity: string;
}

export interface OrderTrackingTimelineProps {
  orderNumber: string;
  currentStatus: string;
  carrier?: string | null;
  awbNumber?: string | null;
  trackingUrl?: string | null;
  events?: TrackingEvent[];
  isTestMode?: boolean;
}

const STAGES = [
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Payment verified & order queued for dispatch' },
  { key: 'PACKED', label: 'Packed & Manifested', desc: 'AWB generated, packed at Surat Central Hub' },
  { key: 'SHIPPED', label: 'In Transit', desc: 'Moving through the Delhivery surface network' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'With local courier agent — OTP active' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Delivered to consignee · POD confirmed' },
];

/**
 * Extract a string field from a JSON-shaped payload, with full type narrowing
 * on `unknown` so we never need an `as any` cast on Prisma's `Prisma.JsonValue`.
 */
function readStringField(payload: unknown, key: string): string | undefined {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    const value = record[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

export function OrderTrackingTimeline({
  orderNumber,
  currentStatus,
  carrier,
  awbNumber,
  trackingUrl,
  events = [],
  isTestMode = true,
}: OrderTrackingTimelineProps) {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [localEvents, setLocalEvents] = useState(events);

  // Determine active stage index (0 to 4)
  const getStageIndex = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING_PAYMENT':
      case 'COD_PENDING':
        return 0;
      case 'PAID':
      case 'CONFIRMED':
      case 'PROCESSING':
        return 0;
      case 'PACKED':
      case 'MANIFESTED':
        return 1;
      case 'SHIPPED':
      case 'IN_TRANSIT':
      case 'PICKED_UP':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStageIndex(localStatus);

  const copyAwb = () => {
    if (!awbNumber) return;
    navigator.clipboard.writeText(awbNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateStage = async (
    stage: 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  ) => {
    if (!awbNumber) return;
    try {
      setSimulating(true);
      const res = await simulateTrackingProgressAction(awbNumber, stage);
      if (res.success && res.data) {
        setLocalStatus(stage);
        if (res.data.event) {
          const activity =
            readStringField(res.data.event.payload, 'activity') ||
            res.data.event.status;
          const newEv: TrackingEvent = {
            id: res.data.event.id,
            status: res.data.event.status,
            location: res.data.event.location,
            timestamp: new Date().toISOString(),
            activity,
          };
          setLocalEvents((prev) => [newEv, ...prev]);
        }
        if (typeof window !== 'undefined') {
          // reload after short delay to sync server state
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Simulation error:', msg);
    } finally {
      setSimulating(false);
    }
  };

  // Locate the most recent tracking scan whose status maps to a given stage.
  const findStageEvent = (stageKey: string): TrackingEvent | undefined => {
    const upper = stageKey.toUpperCase();
    return localEvents.find(
      (e) => e.status.toUpperCase() === upper || e.status.toUpperCase().includes(upper)
    );
  };

  return (
    <div className="bg-card border border-border p-6 sm:p-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
            <span className="dot-rec" aria-hidden />
            Live Courier Tracking
          </div>
          <h3 className="display text-xl text-foreground flex items-baseline gap-2">
            {carrier || 'Delhivery Surface'}
          </h3>
          <div className="text-[11px] text-stone-500 mt-1 font-mono">
            Order <span className="text-foreground">{orderNumber}</span>
          </div>
        </div>

        {awbNumber && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background">
              <span className="eyebrow text-stone-500">AWB</span>
              <span className="text-xs font-mono text-foreground">{awbNumber}</span>
              <button
                type="button"
                onClick={copyAwb}
                title="Copy AWB"
                aria-label="Copy AWB number"
                className="text-stone-400 hover:text-foreground transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs"
                style={{ padding: '0.5rem 0.875rem' }}
              >
                <span>Track</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* 5-Stage Vertical Editorial Timeline */}
      <div className="py-6 sm:py-8">
        <ol className="relative">
          {/* Hairline vertical rule */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px bg-border"
            aria-hidden
          />

          {STAGES.map((stage, idx) => {
            const isPast = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const stageEvent = findStageEvent(stage.key);
            const ts = stageEvent ? new Date(stageEvent.timestamp) : null;

            return (
              <li
                key={stage.key}
                className="relative pl-8 pb-7 last:pb-0"
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Node — completed = filled ink, current = dot-rec pulse, pending = outline */}
                <span
                  className="absolute left-0 top-1 w-[15px] h-[15px] flex items-center justify-center"
                  aria-hidden
                >
                  {isPast ? (
                    <span className="w-2.5 h-2.5 bg-foreground rounded-full" />
                  ) : isCurrent ? (
                    <span className="dot-rec" />
                  ) : (
                    <span className="w-2.5 h-2.5 border border-stone-400 bg-card rounded-full" />
                  )}
                </span>

                {/* Stage body */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5">
                  <div className="min-w-0">
                    <span
                      className={`eyebrow ${
                        isCurrent ? 'text-[var(--brand)]' : 'text-stone-500'
                      } block`}
                    >
                      {stage.label}
                    </span>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed max-w-md">
                      {stage.desc}
                    </p>
                    {stageEvent?.location && (
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-stone-400" /> {stageEvent.location}
                      </p>
                    )}
                  </div>
                  {ts && (
                    <span className="text-[11px] font-mono text-stone-500 shrink-0 sm:ml-4 sm:text-right">
                      {ts.toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Chronological Scan History Toggle */}
      {localEvents.length > 0 && (
        <div className="pt-5 border-t border-border">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-xs text-stone-500 hover:text-foreground transition-colors group"
            aria-expanded={showHistory}
          >
            <span className="eyebrow text-stone-500 flex items-center gap-1.5 group-hover:text-foreground">
              <Clock className="w-3 h-3 text-[var(--brand)]" />
              Checkpoint History · {localEvents.length}{' '}
              {localEvents.length === 1 ? 'scan' : 'scans'}
            </span>
            {showHistory ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showHistory && (
            <ol className="mt-5 relative">
              <div
                className="absolute left-[5px] top-2 bottom-2 w-px bg-border"
                aria-hidden
              />
              {localEvents.map((ev, i) => (
                <li
                  key={ev.id || i}
                  className="relative pl-7 pb-4 last:pb-0"
                >
                  <span
                    className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full bg-foreground ring-2 ring-card"
                    aria-hidden
                  />
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <span className="text-xs text-foreground">{ev.activity}</span>
                    <span className="text-[11px] font-mono text-stone-500 shrink-0 sm:ml-4 sm:text-right">
                      {new Date(ev.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  {ev.location && (
                    <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-stone-400" /> {ev.location}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Interactive Simulation Controls for Testing (ADR-012) */}
      {isTestMode && awbNumber && activeIndex < 4 && (
        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="eyebrow text-[var(--brand)] flex items-center gap-1.5">
              <PlayCircle className="w-3.5 h-3.5" />
              Simulation Controls · Demo Mode
            </div>
            <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">
              Staff / Evaluator Tool
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mb-3 leading-relaxed max-w-2xl">
            Since carrier webhooks are awaiting real API dispatch, click below to trigger
            simulated carrier scans.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {activeIndex < 2 && (
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulateStage('IN_TRANSIT')}
                className="btn-ink text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                style={{ padding: '0.5rem 0.875rem' }}
              >
                {simulating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Truck className="w-3 h-3" />
                )}
                Simulate: In Transit (Surat Hub)
              </button>
            )}

            {activeIndex < 3 && (
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulateStage('OUT_FOR_DELIVERY')}
                className="btn-ghost text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                style={{ padding: '0.5rem 0.875rem' }}
              >
                {simulating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Simulate: Out for Delivery
              </button>
            )}

            {activeIndex < 4 && (
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulateStage('DELIVERED')}
                className="btn-ink text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                style={{ padding: '0.5rem 0.875rem' }}
              >
                {simulating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                Simulate: Delivered (Consignee)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
