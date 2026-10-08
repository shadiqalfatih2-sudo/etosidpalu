'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ETOS Living Cursor.
 * Decorative follower only: native pointer, selection, scrolling, clicks and
 * keyboard behavior are never replaced. Intentionally excluded from the admin.
 */
export function LivingCursor() {
  const pathname = usePathname();
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname.startsWith('/native-preview/admin');

  useEffect(() => {
    if (isAdmin) return;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = false;
    let raf = 0;
    let following = false;
    let x = -90, y = -90, px = -90, py = -90;
    let dotX = -90, dotY = -90;
    let magnetic: HTMLElement | null = null;
    let activeFillTarget: HTMLElement | null = null;

    const permitted = () => finePointer.matches && !reducedMotion.matches;

    const resetMagnetic = () => {
      if (magnetic) {
        magnetic.style.removeProperty('--etos-magnetic-x');
        magnetic.style.removeProperty('--etos-magnetic-y');
      }
      magnetic = null;
    };

    const hide = () => {
      active = false;
      following = false;
      ring.classList.remove('is-visible', 'is-expanded');
      dot.classList.remove('is-visible');
      resetMagnetic();
      activeFillTarget = null;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    };

    const draw = () => {
      if (!active || !permitted()) { raf = 0; return; }
      px += (x - px) * .15;
      py += (y - py) * .15;
      dotX += (x - dotX) * .52;
      dotY += (y - dotY) * .52;
      ring.style.transform = `translate3d(${px}px,${py}px,0) translate(-50%,-50%)`;
      dot.style.transform = `translate3d(${dotX}px,${dotY}px,0) translate(-50%,-50%)`;
      raf = window.requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !permitted()) { hide(); return; }
      if (!(event.target instanceof Element)) return;
      // No halo over editing surfaces, native dialogs or video players.
      const blocked = event.target.closest('input, textarea, select, [contenteditable="true"], dialog[open], iframe, video, [data-etos-no-cursor]');
      if (blocked) { hide(); return; }

      x = event.clientX;
      y = event.clientY;
      if (!active) {
        px = x; py = y; dotX = x; dotY = y;
        active = true;
        ring.classList.add('is-visible');
        dot.classList.add('is-visible');
      }
      const interactive = event.target.closest('a, button, [role="button"], .etos-motion-metric, .etos-living-value-card');
      const expanded = Boolean(interactive);
      ring.classList.toggle('is-expanded', expanded);

      const nextMagnetic = event.target.closest<HTMLElement>('[data-etos-magnetic]');
      if (magnetic !== nextMagnetic) resetMagnetic();
      if (nextMagnetic) {
        magnetic = nextMagnetic;
        const rect = magnetic.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - .5;
        const relY = (event.clientY - rect.top) / rect.height - .5;
        magnetic.style.setProperty('--etos-magnetic-x', `${(Math.max(-.5, Math.min(.5, relX)) * 7).toFixed(2)}px`);
        magnetic.style.setProperty('--etos-magnetic-y', `${(Math.max(-.5, Math.min(.5, relY)) * 7).toFixed(2)}px`);
      }

      // A single delegated pointer tracker powers fluid color fill throughout
      // the program cards and the four About ETOS cards. No extra listeners.
      const aboutCard = event.target.closest<HTMLElement>('.etos-living-about-lead, .etos-living-value-card');
      const program = event.target.closest<HTMLElement>('.etos-living-program-card');
      const programBody = program?.querySelector<HTMLElement>('.etos-program-editorial-body') || null;
      const fillTarget = aboutCard || programBody;
      if (fillTarget) {
        activeFillTarget = fillTarget;
        const rect = fillTarget.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          fillTarget.style.setProperty('--etos-fill-x', `${Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)).toFixed(1)}%`);
          fillTarget.style.setProperty('--etos-fill-y', `${Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100)).toFixed(1)}%`);
        }
      } else {
        activeFillTarget = null;
      }

      if (!following) { following = true; raf = window.requestAnimationFrame(draw); }
    };

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) hide();
    };
    const onBlur = () => hide();
    const onVisibility = () => { if (document.hidden) hide(); };
    const onChange = () => hide();

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onLeave, { passive: true });
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    finePointer.addEventListener('change', onChange);
    reducedMotion.addEventListener('change', onChange);

    return () => {
      hide();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onLeave);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      finePointer.removeEventListener('change', onChange);
      reducedMotion.removeEventListener('change', onChange);
    };
  }, [isAdmin, pathname]);

  if (isAdmin) return null;
  return (
    <div className="etos-living-cursor-layer" aria-hidden="true">
      <span ref={ringRef} className="etos-living-cursor-ring" />
      <span ref={dotRef} className="etos-living-cursor-dot" />
    </div>
  );
}
