'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationFeedback() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      const anchor = target instanceof Element ? target.closest('a[href]') as HTMLAnchorElement | null : null;
      if (!anchor || anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      try {
        const next = new URL(anchor.href, window.location.href);
        const current = new URL(window.location.href);
        if (next.origin !== current.origin) return;

        // Hash-only navigation already has native smooth scrolling and should not show route progress.
        if (next.pathname === current.pathname && next.search === current.search) return;

        setPending(true);
      } catch {
        // Ignore malformed/non-standard href values.
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (pendingRef.current) setPending(false);
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const timeout = window.setTimeout(() => setPending(false), 10000);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  return (
    <div
      className={`etos-navigation-progress${pending ? ' is-active' : ''}`}
      role="progressbar"
      aria-label="Memuat halaman"
      aria-hidden={!pending}
    >
      <span />
    </div>
  );
}
