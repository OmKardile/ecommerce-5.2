'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * ThemeProvider — wraps the app with next-themes.
 * - defaultTheme: 'light' (Clean Trust — white + blue)
 * - dark theme: 'dark' (Industrial Steel — charcoal + amber)
 * - enableSystem: false (we control it via the toggle button, not OS preference)
 * - attribute: 'class' (adds/removes .dark on <html>)
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
