'use client';

import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-etos-reveal]';
const STAGGER_SELECTOR = '[data-etos-stagger]';

export function HomepageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
    const staggerGroups = Array.from(document.querySelectorAll<HTMLElement>(STAGGER_SELECTOR));

    staggerGroups.forEach((group) => {
      const children = Array.from(group.querySelectorAll<HTMLElement>(':scope > [data-etos-reveal]'));
      children.forEach((child, index) => {
        const base = Number(child.dataset.etosDelay || 0);
        child.style.setProperty('--etos-reveal-delay', `${base + index * 72}ms`);
      });
    });

    if (prefersReducedMotion) {
      root.classList.add('etos-motion-reduced');
      revealItems.forEach((item) => item.classList.add('is-revealed'));
      return () => root.classList.remove('etos-motion-reduced');
    }

    root.classList.add('etos-motion-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12,
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    const firstFrame = window.requestAnimationFrame(() => {
      revealItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
          item.classList.add('is-revealed');
          observer.unobserve(item);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      observer.disconnect();
      root.classList.remove('etos-motion-ready');
    };
  }, []);

  return null;
}
