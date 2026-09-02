'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export function MobileMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (!details?.open) return;
      if (event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <details ref={detailsRef} className="etos-mobile-menu">
      <summary>Menu</summary>
      <nav className="etos-mobile-menu-panel" aria-label="Navigasi mobile">
        <a href="/#beranda" onClick={closeMenu}>Beranda</a>
        <a href="/#tentang" onClick={closeMenu}>Tentang</a>
        <a href="/#program" onClick={closeMenu}>Program</a>
        <a href="/#awardee" onClick={closeMenu}>Awardee</a>
        <a href="/#publikasi" onClick={closeMenu}>Berita &amp; Opini</a>
        <Link href="/kirim-tulisan" onClick={closeMenu}>Kirim Tulisan</Link>
        <Link href="/admin" onClick={closeMenu}>Admin</Link>
      </nav>
    </details>
  );
}
