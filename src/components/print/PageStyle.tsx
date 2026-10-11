'use client';

import { useEffect } from 'react';

/**
 * Injects the tool's `@page` rule into <head> while this page is mounted and
 * removes it on unmount. This avoids the cross-tool clash where Next keeps a
 * previously-visited route's global CSS (so an A4 tool could inherit A3 rules
 * and print on the wrong paper size).
 */
export default function PageStyle({ size, margin = '0' }: { size: string; margin?: string }) {
  useEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-print-page-style', size);
    el.textContent = `@page { size: ${size}; margin: ${margin}; }`;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [size, margin]);

  return null;
}
