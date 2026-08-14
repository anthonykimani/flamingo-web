'use client';

import Script from 'next/script';

export function ErudaDebug() {
  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/eruda"
      strategy="afterInteractive"
      onLoad={() => (window as any).eruda?.init()}
    />
  );
}
