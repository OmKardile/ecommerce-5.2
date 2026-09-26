'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  PhoneCall,
  Package,
  Building2,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

const DEALER_WHATSAPP_NUMBER = '919876543210';

export function WhatsAppSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const quickPrompts = [
    {
      label: 'Track my order',
      icon: Package,
      text: 'Hi Patel Networks, I would like to track my surveillance hardware order status.',
    },
    {
      label: 'B2B contractor pricing',
      icon: Building2,
      text: 'Hello, I am a security system installer and would like to inquire about commercial project dealer pricing.',
    },
    {
      label: 'CCTV architecture advice',
      icon: ShieldCheck,
      text: 'Hi, I need technical guidance on selecting the right IP Cameras and NVR storage for a new site installation.',
    },
    {
      label: 'Warranty & support',
      icon: PhoneCall,
      text: 'Hi Patel Networks support, I have a question regarding product warranty and technical configuration.',
    },
  ];

  const handleLaunchWhatsApp = (textToSend?: string) => {
    const finalMsg = (textToSend || customMessage).trim() || 'Hello Patel Networks, I have an inquiry.';
    const encoded = encodeURIComponent(finalMsg);
    const url = `https://wa.me/${DEALER_WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMessage('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans print:hidden">
      {/* Expanded dialogue — restrained, monochrome */}
      {isOpen && (
        <div className="mb-3 w-[330px] sm:w-[370px] bg-popover text-popover-foreground border border-border shadow-lg overflow-hidden">
          {/* Header — ink, no gradient */}
          <div className="p-4 bg-foreground text-background flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 border border-background/30 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-[var(--brand)] border border-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium leading-tight">Patel Networks Helpdesk</h4>
                <span className="text-[11px] text-background/60 flex items-center gap-1.5 mt-0.5">
                  <span className="dot-rec" /> Typically replies in ~5 minutes
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center text-background/70 hover:text-background hover:bg-background/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto scrollbar-thin">
            <div className="p-3 border border-border bg-background text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Namaste. Tap a topic below or type your inquiry to connect with our CCTV
              engineers on WhatsApp.
            </div>

            <div className="space-y-2">
              <div className="eyebrow text-stone-400 px-1">Frequent topics</div>
              {quickPrompts.map((prompt) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => handleLaunchWhatsApp(prompt.text)}
                    className="w-full text-left p-2.5 border border-border hover:border-foreground hover:bg-accent text-xs font-medium text-foreground transition-colors flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-stone-500 group-hover:text-[var(--brand)] transition-colors" />
                      <span>{prompt.label}</span>
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:text-foreground transition-colors" />
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your question or project requirements…"
                className="w-full text-xs p-3 bg-transparent border border-border focus:border-foreground text-foreground placeholder:text-stone-400 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={() => handleLaunchWhatsApp()}
                className="w-full mt-2 py-3 px-4 bg-foreground text-background text-xs font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
                Open WhatsApp chat
              </button>
            </div>
          </div>

          <div className="p-2.5 border-t border-border text-[10px] text-center text-stone-400">
            Official Patel Networks Business API desk · +91 98765 43210
          </div>
        </div>
      )}

      {/* Floating toggle — restrained monochrome, sharp */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact via WhatsApp"
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-foreground text-background border border-foreground hover:bg-background hover:text-foreground transition-colors"
      >
        <span className="dot-rec" />
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline text-xs font-medium tracking-wide">
          {isOpen ? 'Close' : 'Support'}
        </span>
      </button>
    </div>
  );
}
