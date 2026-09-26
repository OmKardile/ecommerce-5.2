'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Reveal } from '@/components/storefront/Reveal';
import { formatPrice } from '@/lib/utils';
import { addToCartAction } from '@/app/actions/cart.actions';
import {
  Wrench,
  Check,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface KitOptions {
  dvr: { id: string; name: string; channels: number; price: number; sku: string };
  bulletCount: number;
  bulletRes: string;
  bulletPrice: number;
  domeCount: number;
  domeRes: string;
  domePrice: number;
  hdd: { id: string; name: string; size: string; price: number; days: string };
  cable: { id: string; name: string; length: string; price: number };
  powerSupply: { id: string; name: string; price: number };
}

export default function KitBuilderPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Recorder Options
  const dvrOptions = [
    {
      id: 'dvr-4ch',
      name: 'Hikvision 4-Channel AcuSense 1080p AI DVR',
      channels: 4,
      price: 3200,
      sku: 'HIK-DVR-04CH',
      desc: 'Supports up to 4 cameras with AcuSense human/vehicle detection.',
    },
    {
      id: 'dvr-8ch',
      name: 'Hikvision 8-Channel AcuSense 1080p AI DVR',
      channels: 8,
      price: 5400,
      sku: 'HIK-DVR-08CH',
      desc: 'Supports up to 8 cameras for medium residential or commercial sites.',
    },
  ];

  // Hard Drive Options
  const hddOptions = [
    { id: 'hdd-none', name: 'Without hard drive (supply my own)', size: '0TB', price: 0, days: 'No storage' },
    { id: 'hdd-1tb', name: 'Seagate SkyHawk 1TB Surveillance HDD', size: '1TB', price: 3600, days: '~15-20 days retention' },
    { id: 'hdd-2tb', name: 'Seagate SkyHawk 2TB Surveillance HDD', size: '2TB', price: 5100, days: '~30-40 days retention' },
    { id: 'hdd-4tb', name: 'Seagate SkyHawk 4TB Surveillance HDD', size: '4TB', price: 8200, days: '~60-80 days retention' },
  ];

  // Cable Options
  const cableOptions = [
    { id: 'cab-90', name: 'CP Plus 3+1 Pure Copper HD Cable (90 Meters)', length: '90m', price: 1450 },
    { id: 'cab-180', name: 'CP Plus 3+1 Pure Copper HD Cable (180 Meters)', length: '180m', price: 2850 },
    { id: 'cab-305', name: 'D-Link Cat6 UTP 305m Solid Drum (Heavy Duty)', length: '305m', price: 7800 },
  ];

  // State
  const [selectedDvr, setSelectedDvr] = useState(dvrOptions[0]);
  const [bulletCount, setBulletCount] = useState<number>(2);
  const [bulletRes, setBulletRes] = useState<'2MP' | '4MP' | '8MP'>('2MP');
  const [domeCount, setDomeCount] = useState<number>(2);
  const [domeRes, setDomeRes] = useState<'2MP' | '4MP' | '8MP'>('2MP');
  const [selectedHdd, setSelectedHdd] = useState(hddOptions[1]);
  const [selectedCable, setSelectedCable] = useState(cableOptions[0]);

  const cameraPrices = {
    '2MP': 1450,
    '4MP': 2350,
    '8MP': 4890,
  };

  const totalCameras = bulletCount + domeCount;
  const maxChannels = selectedDvr.channels;

  // Auto-matching SMPS Power Supply
  const powerSupply =
    maxChannels === 4
      ? { name: 'CP Plus 4-Channel 12V 5A CCTV SMPS', price: 650 }
      : { name: 'CP Plus 8-Channel 12V 10A CCTV SMPS', price: 1150 };

  // Price calculations
  const dvrTotal = selectedDvr.price;
  const bulletTotal = bulletCount * cameraPrices[bulletRes];
  const domeTotal = domeCount * cameraPrices[domeRes];
  const hddTotal = selectedHdd.price;
  const cableTotal = selectedCable.price;
  const powerTotal = powerSupply.price;
  const accessoriesTotal = 450; // BNC + DC pack

  const rawSubtotal = dvrTotal + bulletTotal + domeTotal + hddTotal + cableTotal + powerTotal + accessoriesTotal;
  const comboDiscount = Math.round(rawSubtotal * 0.05); // 5% Package Discount (ADR-006)
  const finalKitPrice = rawSubtotal - comboDiscount;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      // 1. Add DVR
      if (selectedDvr.sku) {
        await addToCartAction(selectedDvr.sku, 1);
      }

      // 2. Add Bullet Cameras
      if (bulletCount > 0) {
        await addToCartAction(`CPP-001-${bulletRes}`, bulletCount);
      }

      // 3. Add Dome Cameras
      if (domeCount > 0) {
        await addToCartAction(`CPP-001-${domeRes}`, domeCount);
      }

      // 4. Add HDD if selected
      if (selectedHdd.size === '1TB') {
        await addToCartAction('ST-SKY-1TB', 1);
      } else if (selectedHdd.size === '2TB') {
        await addToCartAction('ST-SKY-2TB', 1);
      } else if (selectedHdd.size === '4TB') {
        await addToCartAction('ST-SKY-4TB', 1);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 4000);
    } catch (err) {
      console.error('Failed to add kit items:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const steps: Array<{ num: number; label: string }> = [
    { num: 1, label: 'Recorder' },
    { num: 2, label: 'Cameras' },
    { num: 3, label: 'Storage' },
    { num: 4, label: 'Accessories' },
    { num: 5, label: 'Review' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-10 sm:py-14">
        {/* Heading */}
        <div className="max-w-3xl mb-10">
          <div className="eyebrow text-stone-500 mb-3 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" /> Custom CCTV kit configurator · ADR-006
          </div>
          <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)] leading-tight text-foreground">
            Build your custom surveillance package.
          </h1>
          <p className="text-sm text-stone-500 mt-4 leading-relaxed max-w-xl">
            Select compatible surveillance hardware step-by-step. Get guaranteed hardware
            compatibility, verified 18% GST invoicing, and an automatic{' '}
            <strong className="text-foreground">5% package bundle discount</strong> applied at checkout.
          </p>
        </div>

        {/* Step indicator — editorial hairline numbered index (clickable) */}
        <div className="border-t border-border mb-12">
          <div className="grid grid-cols-5">
            {steps.map((s, i) => {
              const isCurrent = currentStep === s.num;
              const isDone = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-4 px-3 sm:px-4 border-b border-border transition-colors ${
                    i < steps.length - 1 ? 'sm:border-r border-border' : ''
                  } ${
                    isCurrent ? 'bg-foreground text-background' : 'bg-background text-foreground hover:bg-accent/50'
                  }`}
                >
                  <span
                    className={`font-mono text-xs ${
                      isCurrent ? 'text-background/60' : isDone ? 'text-[var(--brand)]' : 'text-stone-400'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : String(s.num).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isCurrent ? 'text-background' : 'text-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard layout: steps (left) + sticky summary (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ============================================================ */}
          {/* STEP CONTROLS (left 8 cols) */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 space-y-8">
            {/* STEP 1: RECORDER */}
            {currentStep === 1 && (
              <Reveal>
                <section className="space-y-6">
                  <div className="pb-3 border-b border-border">
                    <div className="eyebrow text-stone-500 mb-2">Step 1 of 5</div>
                    <h2 className="display text-2xl text-foreground">Select your video recorder (DVR)</h2>
                    <p className="text-xs text-stone-500 mt-2">
                      Choose based on the maximum number of surveillance cameras you plan to connect.
                    </p>
                  </div>

                  {/* Selection cards — sharp, hairline, ink-selected */}
                  <div className="grid grid-cols-1 gap-px bg-border">
                    {dvrOptions.map((opt) => {
                      const isSelected = selectedDvr.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedDvr(opt);
                            if (bulletCount + domeCount > opt.channels) {
                              setBulletCount(Math.floor(opt.channels / 2));
                              setDomeCount(Math.ceil(opt.channels / 2));
                            }
                          }}
                          className={`flex items-start justify-between gap-4 p-5 text-left transition-colors ${
                            isSelected
                              ? 'bg-foreground text-background'
                              : 'bg-background text-foreground hover:bg-accent/50'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{opt.name}</span>
                              <span
                                className={`text-[10px] uppercase tracking-[0.16em] px-1.5 py-0.5 border ${
                                  isSelected
                                    ? 'border-background/30 text-background/70'
                                    : 'border-border text-stone-500'
                                }`}
                              >
                                {opt.channels} channels
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <p
                              className={`text-xs ${
                                isSelected ? 'text-background/70' : 'text-stone-500'
                              }`}
                            >
                              {opt.desc}
                            </p>
                            <span
                              className={`text-[10px] font-mono ${
                                isSelected ? 'text-background/60' : 'text-stone-400'
                              }`}
                            >
                              SKU · {opt.sku}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-lg font-mono">{formatPrice(opt.price)}</span>
                            <span
                              className={`block text-[10px] mt-0.5 ${
                                isSelected ? 'text-background/60' : 'text-stone-400'
                              }`}
                            >
                              incl. GST
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={() => setCurrentStep(2)} className="btn-ink">
                      Next: choose cameras <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              </Reveal>
            )}

            {/* STEP 2: CAMERAS */}
            {currentStep === 2 && (
              <Reveal>
                <section className="space-y-6">
                  <div className="pb-3 border-b border-border">
                    <div className="eyebrow text-stone-500 mb-2">Step 2 of 5</div>
                    <h2 className="display text-2xl text-foreground">Select your surveillance cameras</h2>
                    <p className="text-xs text-stone-500 mt-2">
                      Your {selectedDvr.channels}-channel DVR supports up to {selectedDvr.channels} cameras.
                      Currently configured:{' '}
                      <strong
                        className={
                          totalCameras > maxChannels ? 'text-[var(--brand)]' : 'text-foreground'
                        }
                      >
                        {totalCameras} of {maxChannels}
                      </strong>
                      .
                    </p>
                  </div>

                  {totalCameras > maxChannels && (
                    <div className="p-3 border border-rose-300/70 dark:border-rose-700/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Total cameras exceed {maxChannels} channels. Please reduce count or upgrade your DVR.
                    </div>
                  )}

                  {/* Outdoor bullet cameras */}
                  <div className="border border-border p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="display text-base text-foreground">Outdoor weatherproof bullet cameras</h3>
                        <p className="text-xs text-stone-500 mt-0.5">IP67 rated — gates, perimeter, outdoor mounting.</p>
                      </div>
                      {/* Quantity stepper — sharp, like the cart page */}
                      <div className="flex items-center border border-border bg-background w-fit">
                        <button
                          type="button"
                          onClick={() => setBulletCount(Math.max(0, bulletCount - 1))}
                          className="w-9 h-10 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent transition-colors text-lg leading-none"
                          aria-label="Decrease bullet cameras"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-mono text-foreground">
                          {bulletCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBulletCount(bulletCount + 1)}
                          disabled={totalCameras >= maxChannels}
                          className="w-9 h-10 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition-colors text-lg leading-none"
                          aria-label="Increase bullet cameras"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Resolution chips — sharp hairline buttons, ink-selected */}
                    {bulletCount > 0 && (
                      <div className="flex items-center gap-3 pt-2 flex-wrap">
                        <span className="eyebrow text-stone-500">Resolution</span>
                        <div className="flex gap-px bg-border">
                          {(['2MP', '4MP', '8MP'] as const).map((r) => {
                            const isSelected = bulletRes === r;
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setBulletRes(r)}
                                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                                  isSelected
                                    ? 'bg-foreground text-background'
                                    : 'bg-background text-foreground hover:bg-accent'
                                }`}
                              >
                                {r} · {formatPrice(cameraPrices[r])}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Indoor dome cameras */}
                  <div className="border border-border p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="display text-base text-foreground">Indoor ceiling dome cameras</h3>
                        <p className="text-xs text-stone-500 mt-0.5">Aesthetic dome housing — offices, living rooms, shops.</p>
                      </div>
                      <div className="flex items-center border border-border bg-background w-fit">
                        <button
                          type="button"
                          onClick={() => setDomeCount(Math.max(0, domeCount - 1))}
                          className="w-9 h-10 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent transition-colors text-lg leading-none"
                          aria-label="Decrease dome cameras"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-mono text-foreground">
                          {domeCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDomeCount(domeCount + 1)}
                          disabled={totalCameras >= maxChannels}
                          className="w-9 h-10 flex items-center justify-center text-stone-500 hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition-colors text-lg leading-none"
                          aria-label="Increase dome cameras"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {domeCount > 0 && (
                      <div className="flex items-center gap-3 pt-2 flex-wrap">
                        <span className="eyebrow text-stone-500">Resolution</span>
                        <div className="flex gap-px bg-border">
                          {(['2MP', '4MP', '8MP'] as const).map((r) => {
                            const isSelected = domeRes === r;
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setDomeRes(r)}
                                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                                  isSelected
                                    ? 'bg-foreground text-background'
                                    : 'bg-background text-foreground hover:bg-accent'
                                }`}
                              >
                                {r} · {formatPrice(cameraPrices[r])}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setCurrentStep(1)} className="btn-ghost">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={totalCameras === 0 || totalCameras > maxChannels}
                      className="btn-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                      Next: select storage <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              </Reveal>
            )}

            {/* STEP 3: STORAGE */}
            {currentStep === 3 && (
              <Reveal>
                <section className="space-y-6">
                  <div className="pb-3 border-b border-border">
                    <div className="eyebrow text-stone-500 mb-2">Step 3 of 5</div>
                    <h2 className="display text-2xl text-foreground">Select surveillance hard drive</h2>
                    <p className="text-xs text-stone-500 mt-2">
                      Desktop drives fail under 24/7 CCTV writes. We only supply genuine Seagate SkyHawk
                      surveillance drives.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-px bg-border">
                    {hddOptions.map((opt) => {
                      const isSelected = selectedHdd.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedHdd(opt)}
                          className={`flex items-center justify-between gap-4 p-4 text-left transition-colors ${
                            isSelected
                              ? 'bg-foreground text-background'
                              : 'bg-background text-foreground hover:bg-accent/50'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{opt.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span
                              className={`text-xs ${
                                isSelected ? 'text-background/70' : 'text-[var(--brand)]'
                              }`}
                            >
                              {opt.days}
                            </span>
                          </div>
                          <span className="font-mono text-sm shrink-0">
                            {opt.price === 0 ? 'Included' : `+${formatPrice(opt.price)}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setCurrentStep(2)} className="btn-ghost">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button type="button" onClick={() => setCurrentStep(4)} className="btn-ink">
                      Next: cables & power <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              </Reveal>
            )}

            {/* STEP 4: ACCESSORIES */}
            {currentStep === 4 && (
              <Reveal>
                <section className="space-y-6">
                  <div className="pb-3 border-b border-border">
                    <div className="eyebrow text-stone-500 mb-2">Step 4 of 5</div>
                    <h2 className="display text-2xl text-foreground">Cabling, power & connectors</h2>
                    <p className="text-xs text-stone-500 mt-2">
                      We automatically pair the matching SMPS power supply and include high-grade copper
                      BNC / DC connectors.
                    </p>
                  </div>

                  {/* Cable selector */}
                  <div>
                    <div className="eyebrow text-stone-500 mb-3">Choose cable length</div>
                    <div className="grid grid-cols-1 gap-px bg-border">
                      {cableOptions.map((c) => {
                        const isSelected = selectedCable.id === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCable(c)}
                            className={`flex justify-between items-center p-4 text-left transition-colors ${
                              isSelected
                                ? 'bg-foreground text-background'
                                : 'bg-background text-foreground hover:bg-accent/50'
                            }`}
                          >
                            <span className="text-xs font-medium flex items-center gap-2">
                              {c.name}
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </span>
                            <span className="font-mono text-xs">{formatPrice(c.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Auto-included components */}
                  <div className="border border-border bg-card p-5 space-y-2 text-xs">
                    <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                      <span className="dot-rec" /> Automatically included
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>{powerSupply.name}</span>
                      <span className="font-mono text-foreground">{formatPrice(powerSupply.price)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Heavy-duty BNC connectors & DC pins pack</span>
                      <span className="font-mono text-foreground">{formatPrice(accessoriesTotal)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setCurrentStep(3)} className="btn-ghost">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button type="button" onClick={() => setCurrentStep(5)} className="btn-ink">
                      Review final kit <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              </Reveal>
            )}

            {/* STEP 5: FINAL REVIEW */}
            {currentStep === 5 && (
              <Reveal>
                <section className="space-y-6">
                  <div className="pb-3 border-b border-border">
                    <div className="eyebrow text-stone-500 mb-2 flex items-center gap-2">
                      <span className="dot-rec" /> Step 5 of 5 · Kit ready
                    </div>
                    <h2 className="display text-2xl text-foreground">
                      Your complete surveillance package is ready.
                    </h2>
                    <p className="text-xs text-stone-500 mt-2">
                      All components are certified compatible with your {selectedDvr.name}.
                    </p>
                  </div>

                  {/* Itemized review — editorial hairline rows */}
                  <div className="border-t border-border">
                    <ReviewRow label={`1× ${selectedDvr.name}`} value={formatPrice(dvrTotal)} />
                    {bulletCount > 0 && (
                      <ReviewRow
                        label={`${bulletCount}× CP Plus ${bulletRes} Smart IR bullet camera`}
                        value={formatPrice(bulletTotal)}
                      />
                    )}
                    {domeCount > 0 && (
                      <ReviewRow
                        label={`${domeCount}× CP Plus ${domeRes} ceiling dome camera`}
                        value={formatPrice(domeTotal)}
                      />
                    )}
                    {selectedHdd.price > 0 && (
                      <ReviewRow label={`1× ${selectedHdd.name}`} value={formatPrice(hddTotal)} />
                    )}
                    <ReviewRow label={`1× ${selectedCable.name}`} value={formatPrice(cableTotal)} />
                    <ReviewRow label={`1× ${powerSupply.name}`} value={formatPrice(powerTotal)} />
                    <ReviewRow label="Connectors pack (BNC / DC)" value={formatPrice(accessoriesTotal)} />
                  </div>

                  {/* Bundle discount notice */}
                  <div className="border border-border bg-card p-4 flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium flex items-center gap-2">
                      <span className="dot-rec" /> 5% CCTV combo package discount applied
                    </span>
                    <span className="font-mono text-[var(--brand)]">−{formatPrice(comboDiscount)}</span>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setCurrentStep(4)} className="btn-ghost">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to edit
                    </button>
                    <button type="button" onClick={handleAddToCart} className="btn-ink">
                      <ShoppingCart className="w-4 h-4" /> Add complete kit to cart ·{' '}
                      {formatPrice(finalKitPrice)}
                    </button>
                  </div>
                </section>
              </Reveal>
            )}
          </div>

          {/* ============================================================ */}
          {/* LIVE KIT SUMMARY (right 4 cols, sticky) */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="border border-border bg-card p-7 space-y-6">
              <div>
                <div className="eyebrow text-stone-500 mb-1">Live kit summary</div>
                <div className="display text-xl text-foreground">Surveillance configuration</div>
              </div>

              {/* Config rows */}
              <div className="space-y-2.5 text-xs border-t border-border pt-4">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Recorder</span>
                  <span className="text-foreground text-right max-w-[60%]">
                    {selectedDvr.channels}-CH DVR
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Cameras</span>
                  <span className="text-foreground">
                    {bulletCount} bullet + {domeCount} dome
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Storage</span>
                  <span className="text-foreground">{selectedHdd.size}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Cable</span>
                  <span className="text-foreground">{selectedCable.length}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2.5 text-xs pt-4 border-t border-border">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Components subtotal</span>
                  <span className="line-through font-mono">{formatPrice(rawSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--brand)]">
                  <span>Combo savings (5%)</span>
                  <span className="font-mono">−{formatPrice(comboDiscount)}</span>
                </div>
                <div className="pt-3 mt-1 border-t border-border flex justify-between items-baseline">
                  <span className="text-foreground font-medium">Total kit price</span>
                  <span className="text-xl font-mono text-[var(--brand)]">
                    {formatPrice(finalKitPrice)}
                  </span>
                </div>
                <div className="text-[10px] text-stone-500 text-right">
                  Inclusive of 18% GST · ITC invoice
                </div>
              </div>

              {/* Add to cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="btn-ink w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding hardware bundle…
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add kit to cart
                  </>
                )}
              </button>

              {addedToast && (
                <div className="p-3 border border-border bg-accent/40 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                    Custom kit added to cart
                  </span>
                  <Link href="/cart" className="text-foreground link-underline">
                    View cart
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- small editorial helper for the review rows ---------- */
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 flex justify-between text-xs border-b border-border">
      <span className="text-stone-600 dark:text-stone-400">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}
