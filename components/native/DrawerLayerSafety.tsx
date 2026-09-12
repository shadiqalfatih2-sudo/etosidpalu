'use client';

import { useEffect } from 'react';

const BACKDROP_SELECTOR = 'div[class*="drawerBackdrop"]';
const DIALOG_SELECTOR = 'aside[role="dialog"]';

function forceDrawerLayer(backdrop: HTMLElement) {
  const dialog = backdrop.querySelector<HTMLElement>(DIALOG_SELECTOR);
  if (!dialog) return;

  const backdropStyles: Array<[string, string]> = [
    ['position', 'fixed'],
    ['inset', '0'],
    ['z-index', '2147483600'],
    ['display', 'flex'],
    ['align-items', 'stretch'],
    ['justify-content', 'flex-end'],
    ['overflow', 'hidden'],
    ['pointer-events', 'auto'],
  ];

  const dialogStyles: Array<[string, string]> = [
    ['position', 'fixed'],
    ['z-index', '2147483646'],
    ['top', '0'],
    ['right', '0'],
    ['bottom', 'auto'],
    ['left', 'auto'],
    ['display', 'block'],
    ['height', '100dvh'],
    ['max-height', '100dvh'],
    ['margin', '0'],
    ['overflow-x', 'hidden'],
    ['overflow-y', 'auto'],
    ['visibility', 'visible'],
    ['opacity', '1'],
    ['transform', 'none'],
    ['filter', 'none'],
    ['animation', 'none'],
    ['background', '#fff'],
    ['pointer-events', 'auto'],
  ];

  backdropStyles.forEach(([property, value]) => backdrop.style.setProperty(property, value, 'important'));
  dialogStyles.forEach(([property, value]) => dialog.style.setProperty(property, value, 'important'));

  const mobile = window.matchMedia('(max-width: 720px)').matches;
  const compactLandscape = window.matchMedia('(max-width: 980px) and (orientation: landscape)').matches;

  if (mobile) {
    dialog.style.setProperty('width', '100vw', 'important');
    dialog.style.setProperty('max-width', '100vw', 'important');
  } else if (compactLandscape) {
    dialog.style.setProperty('width', 'min(640px, 86vw)', 'important');
    dialog.style.setProperty('max-width', '86vw', 'important');
  } else {
    dialog.style.setProperty('width', 'min(690px, 95vw)', 'important');
    dialog.style.setProperty('max-width', '95vw', 'important');
  }
}

export function DrawerLayerSafety() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>(BACKDROP_SELECTOR).forEach(forceDrawerLayer);
    };

    apply();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(apply);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', apply, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, []);

  return null;
}
