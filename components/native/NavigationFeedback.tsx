'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const SECTION_TARGET_KEY = 'etos:section-target';
const RETURN_KEY = 'etos:publication-return';
const RESTORE_KEY = 'etos:restore-scroll';
const SECTION_LINK_SELECTOR = 'a[href^="/#"], a[href^="#"]';

function parseStored<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

export function NavigationFeedback() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    const normalizeAnchor = (anchor: HTMLAnchorElement) => {
      const rawHref = anchor.getAttribute('href') || '';
      if (!rawHref.startsWith('/#') && !rawHref.startsWith('#')) return;
      try {
        const url = new URL(rawHref, window.location.href);
        const target = decodeURIComponent(url.hash.replace(/^#/, ''));
        if (!target) return;
        anchor.dataset.etosSectionTarget = target;
        anchor.setAttribute('href', '/');
      } catch {
        // Ignore malformed anchors.
      }
    };

    document.querySelectorAll<HTMLAnchorElement>(SECTION_LINK_SELECTOR).forEach(normalizeAnchor);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('a')) normalizeAnchor(node as HTMLAnchorElement);
          node.querySelectorAll<HTMLAnchorElement>(SECTION_LINK_SELECTOR).forEach(normalizeAnchor);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onIntent = (event: Event) => {
      const target = event.target;
      const anchor = target instanceof Element ? target.closest('a[href]') as HTMLAnchorElement | null : null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      try {
        const next = new URL(anchor.href, window.location.href);
        if (next.origin !== window.location.origin) return;
        if (/^\/(berita|opini)(\/|$)/.test(next.pathname) || next.pathname === '/kirim-tulisan') {
          router.prefetch(`${next.pathname}${next.search}`);
        }
      } catch {
        // Ignore malformed hrefs.
      }
    };

    document.addEventListener('pointerover', onIntent, { capture: true, passive: true });
    document.addEventListener('touchstart', onIntent, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerover', onIntent, true);
      document.removeEventListener('touchstart', onIntent, true);
    };
  }, [router]);

  useEffect(() => {
    const scrollToSection = (target: string, behavior: ScrollBehavior = 'smooth') => {
      const run = (attempt = 0) => {
        const node = target === 'beranda' ? document.documentElement : document.getElementById(target);
        if (node) {
          if (target === 'beranda') window.scrollTo({ top: 0, behavior });
          else node.scrollIntoView({ behavior, block: 'start' });
          return;
        }
        if (attempt < 6) window.setTimeout(() => run(attempt + 1), 45);
      };
      window.requestAnimationFrame(() => run());
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      const anchor = target instanceof Element ? target.closest('a[href]') as HTMLAnchorElement | null : null;
      if (!anchor || anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      const smartBack = anchor.dataset.etosSmartBack;
      if (smartBack) {
        event.preventDefault();
        const origin = parseStored<{ path: string; scrollY: number }>(RETURN_KEY);
        window.sessionStorage.removeItem(RETURN_KEY);
        if (origin?.path) {
          window.sessionStorage.setItem(RESTORE_KEY, JSON.stringify(origin));
          setPending(true);
          router.push(origin.path, { scroll: false });
        } else {
          const fallback = anchor.dataset.etosFallbackTarget || 'publikasi';
          window.sessionStorage.setItem(SECTION_TARGET_KEY, fallback);
          setPending(true);
          router.push('/', { scroll: false });
        }
        return;
      }

      const sectionTarget = anchor.dataset.etosSectionTarget;
      if (sectionTarget) {
        event.preventDefault();
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (pathname === '/') {
          scrollToSection(sectionTarget, reduceMotion ? 'auto' : 'smooth');
        } else {
          window.sessionStorage.setItem(SECTION_TARGET_KEY, sectionTarget);
          setPending(true);
          router.push('/', { scroll: false });
        }
        return;
      }

      try {
        const next = new URL(anchor.href, window.location.href);
        const current = new URL(window.location.href);
        if (next.origin !== current.origin) return;
        if (next.pathname === current.pathname && next.search === current.search) return;

        const openingPublication = /^\/(berita|opini)\/.+/.test(next.pathname);
        if (openingPublication && (pathname === '/' || pathname === '/berita')) {
          window.sessionStorage.setItem(RETURN_KEY, JSON.stringify({
            path: pathname,
            scrollY: window.scrollY,
          }));
        }
        setPending(true);
      } catch {
        // Ignore malformed/non-standard href values.
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname, router]);

  useEffect(() => {
    if (pendingRef.current) setPending(false);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const restore = parseStored<{ path: string; scrollY: number }>(RESTORE_KEY);
    if (restore?.path === pathname) {
      window.sessionStorage.removeItem(RESTORE_KEY);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: Math.max(0, restore.scrollY || 0), behavior: 'auto' });
        });
      });
      return;
    }

    if (pathname === '/') {
      const target = window.sessionStorage.getItem(SECTION_TARGET_KEY);
      if (!target) return;
      window.sessionStorage.removeItem(SECTION_TARGET_KEY);
      const run = (attempt = 0) => {
        const node = target === 'beranda' ? document.documentElement : document.getElementById(target);
        if (node) {
          if (target === 'beranda') window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
          else node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
          return;
        }
        if (attempt < 8) window.setTimeout(() => run(attempt + 1), 45);
      };
      window.requestAnimationFrame(() => run());
    }
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const timeout = window.setTimeout(() => setPending(false), 8000);
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
