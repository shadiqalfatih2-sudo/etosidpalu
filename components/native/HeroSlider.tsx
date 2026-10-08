'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { NativeHero } from '@/lib/native-public';
import styles from './HomePreview.module.css';
import './HybridHero.css';
import './EditorialPhotoMotion.css';
import './PremiumEditorial.css';

const AUTOPLAY_MS = 6900;
function safeHeroLink(link: string) {
  const value = String(link || '').trim();
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.href;
  } catch { /* invalid or absent link falls back to programs */ }
  return '/#program';
}
function heroActionLabel(link: string) {
  const value = String(link || '').toLowerCase();
  if (value.includes('awardee')) return 'Kenali Awardee';
  if (value.includes('berita') || value.includes('opini')) return 'Baca Cerita';
  if (value.includes('cerita-dampak')) return 'Jelajahi Cerita';
  if (value.includes('tentang')) return 'Kenali ETOS';
  return 'Jelajahi Program';
}

export function HeroSlider({ heroes }: { heroes: NativeHero[] }) {
  const slides = useMemo(() => heroes.filter(item => item.photo), [heroes]);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(true);
  const touchStart = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const element = heroRef.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => setVisible(Boolean(entries[0]?.isIntersecting)), { threshold: .12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActive(previous => slides.length ? Math.min(previous, slides.length - 1) : 0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused || interacting || reducedMotion || !visible) return;
    const advance = () => setActive(previous => (previous + 1) % slides.length);
    let timer: number | null = null;
    const resume = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = document.hidden ? null : window.setInterval(advance, AUTOPLAY_MS);
    };
    resume();
    document.addEventListener('visibilitychange', resume);
    return () => {
      if (timer !== null) window.clearInterval(timer);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [slides.length, paused, interacting, reducedMotion, visible]);

  const goTo = (next: number) => {
    if (!slides.length) return;
    setActive((next + slides.length) % slides.length);
    setPaused(true);
  };
  const current = slides[active] || slides[0];
  const titleIsGeneric = !current?.title || current.title.trim().toLowerCase() === 'etos id palu';
  const headline = titleIsGeneric ? current?.subtitle || 'Bertumbuh dalam nilai. Bergerak membawa dampak.' : current.title;
  const supportingText = titleIsGeneric
    ? 'Ruang pembinaan mahasiswa untuk menguatkan karakter, kepemimpinan, dan kontribusi.'
    : current?.subtitle || 'Menguatkan nilai, nalar, dan keberanian untuk memberi dampak.';
  const href = safeHeroLink(current?.link || '');
  const nextImage = slides.length > 1 ? slides[(active + 1) % slides.length] : null;

  return (
    <section ref={heroRef} className={`${styles.hero} etos-hero etos-hero-2026 etos-premium-hero`}
      id="beranda" aria-label="Sorotan Etos ID Palu"
      onPointerEnter={event => { if (event.pointerType === 'mouse') setInteracting(true); }}
      onPointerLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
      onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={event => {
        if (touchStart.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        touchStart.current = null;
        if (Math.abs(delta) > 65 && slides.length > 1) goTo(active + (delta < 0 ? 1 : -1));
      }}
    >
      <div className={`${styles.heroMedia} etos-hero-media`}>
        <div className="etos-hero-slides" aria-hidden="true">
          {slides.map((slide, index) => (
            <img key={slide.id} src={slide.photo} alt=""
              className={`etos-hero-slide${index === active ? ' is-active' : ''}`}
              style={{ objectPosition: slide.photoPosition || '50% 50%',
                opacity: index === active ? 1 : 0, zIndex: index === active ? 2 : 1,
                transition: reducedMotion ? 'opacity .15s linear' : 'opacity 1.05s cubic-bezier(.24,.66,.27,1)' }}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
            />
          ))}
        </div>
        <div className={`${styles.heroOverlay} etos-hero-overlay`} aria-hidden="true" />
        <div className="etos-hybrid-ornament" aria-hidden="true"><svg viewBox="0 0 260 260" fill="none"><path d="M43 149C-1 53 147 4 201 79c70 99-77 194-151 111C-18 115 191 5 228 157" stroke="currentColor" strokeWidth="18" strokeLinecap="round"/><path d="M39 149C-1 53 147 4 201 79c70 99-77 194-151 111C-18 115 191 5 228 157" stroke="white" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round"/></svg></div>
        {nextImage ? <div className="etos-hybrid-photo-stack" aria-hidden="true"><div className="etos-hybrid-photo-card" key={nextImage.id}><img src={nextImage.photo} alt="" style={{ objectPosition: nextImage.photoPosition || '50% 50%' }} loading="lazy" decoding="async" /></div></div> : null}
        <div className={`${styles.heroContent} etos-hero-content`}>
          <div className="etos-hero-copy-panel etos-editorial-hero-copy">
            <div className={`${styles.heroKicker} etos-hero-kicker`}>ETOS ID PALU <span aria-hidden="true">—</span> WE ARE RESILIENT LEADER</div>
            <div key={current?.id || 'empty'} className="etos-hero-type-motion">
              <h1>{headline}</h1>
              <p>{supportingText}</p>
              <div className={`${styles.heroActions} etos-hero-actions`}>
                <a href={href} className={`${styles.heroPrimary} etos-hero-primary`}>{heroActionLabel(current?.link || '')} <span aria-hidden="true">↗</span></a>
                <a href="/#awardee" className={`${styles.heroGhost} etos-hero-secondary`}>Kenali Ekosistem <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
        </div>
        {slides.length > 1 ? <nav className="etos-editorial-slide-nav" aria-label="Navigasi slide hero">
          <div className="etos-editorial-slide-tracks">
            {slides.map((slide, index) => <button key={slide.id} type="button"
              className={`etos-editorial-slide-track${index === active ? ' is-active' : ''}`}
              onClick={() => goTo(index)} aria-label={`Tampilkan slide ${index + 1}`}
              aria-current={index === active ? 'true' : undefined} />)}
          </div>
          <button type="button" className="etos-editorial-slide-pause"
            onClick={() => setPaused(value => !value)}
            aria-label={paused || reducedMotion ? 'Jalankan slide otomatis' : 'Jeda slide otomatis'}
            aria-pressed={paused}
            title={paused ? 'Lanjutkan slide' : 'Jeda slide'}>
            <span aria-hidden="true">{paused || reducedMotion ? '▶' : 'Ⅱ'}</span>
          </button>
        </nav> : null}
      </div>
    </section>
  );
}
