'use client';

import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-etos-reveal]';
const STAGGER_SELECTOR = '[data-etos-stagger]';

export function HomepageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const applyStagger = (scope: ParentNode = document) => {
      const groups = Array.from(scope.querySelectorAll<HTMLElement>(STAGGER_SELECTOR));
      groups.forEach((group) => {
        const children = Array.from(group.querySelectorAll<HTMLElement>(':scope > [data-etos-reveal]'));
        children.forEach((child, index) => {
          const base = Number(child.dataset.etosDelay || 0);
          child.style.setProperty('--etos-reveal-delay', `${base + index * 72}ms`);
        });
      });
    };

    applyStagger();
    const initialItems = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));

    if (prefersReducedMotion) {
      root.classList.add('etos-motion-reduced');
      initialItems.forEach((item) => item.classList.add('is-revealed'));

      const reducedMutation = new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches(REVEAL_SELECTOR)) node.classList.add('is-revealed');
            node.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((item) => item.classList.add('is-revealed'));
          });
        });
      });
      reducedMutation.observe(document.body, { childList: true, subtree: true });

      return () => {
        reducedMutation.disconnect();
        root.classList.remove('etos-motion-reduced');
      };
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

    const observeItem = (item: HTMLElement) => {
      if (item.classList.contains('is-revealed')) return;
      observer.observe(item);
    };

    initialItems.forEach(observeItem);

    const firstFrame = window.requestAnimationFrame(() => {
      initialItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
          item.classList.add('is-revealed');
          observer.unobserve(item);
        }
      });
    });

    const mutationObserver = new MutationObserver((records) => {
      let needsStaggerRefresh = false;
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          needsStaggerRefresh = true;
          if (node.matches(REVEAL_SELECTOR)) observeItem(node as HTMLElement);
          node.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(observeItem);
        });
      });
      if (needsStaggerRefresh) applyStagger();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      mutationObserver.disconnect();
      observer.disconnect();
      root.classList.remove('etos-motion-ready');
    };
  }, []);

  return null;
}
