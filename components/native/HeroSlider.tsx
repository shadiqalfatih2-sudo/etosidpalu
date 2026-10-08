'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { NativeHero } from '@/lib/native-public';
import './SeamlessEditorialHero.css';

const INTERVAL_MS = 3000;
const fallback = [
  { title: 'Membentuk Nalar Kritis, Menempa Etos Peradaban.', summary: 'Ruang pembinaan mahasiswa yang menguatkan karakter, cara berpikir, dan kepemimpinan.', link: '/#program' },
  { title: 'Bertumbuh Bersama. Menguatkan Karakter.', summary: 'Setiap proses belajar membuka ruang untuk mengenal diri dan berkembang bersama.', link: '/#tentang' },
  { title: 'Belajar Memimpin, Berani Berkontribusi.', summary: 'Mengenal orang-orang yang bertumbuh melalui pembinaan dan kolaborasi.', link: '/#awardee' },
  { title: 'Merawat Gagasan, Membangun Kolaborasi.', summary: 'Menemukan ide dan pengalaman dari ekosistem ETOS ID Palu.', link: '/berita' },
  { title: 'Dari Proses, Menuju Kontribusi.', summary: 'Menjelajahi perjalanan pembinaan, dokumentasi kegiatan, dan cerita di baliknya.', link: '/cerita-dampak' },
  { title: 'Bertumbuh Bersama. Melangkah Membawa Dampak.', summary: 'Perjalanan pembinaan yang mempertemukan mahasiswa untuk belajar, memimpin, dan bertumbuh bersama.', link: '/#awardee' },
];
function safeLink(value: string, replacement: string): string {
  const link = String(value || '').trim();
  if (link.startsWith('/') && !link.startsWith('//')) return link;
  if (/^https?:\/\/[^\s]+$/i.test(link)) return link;
  return replacement;
}
function actionText(link: string) {
  if (link.includes('awardee')) return 'Kenali Awardee';
  if (link.includes('tentang')) return 'Tentang ETOS';
  if (link.includes('berita') || link.includes('opini')) return 'Baca Publikasi';
  if (link.includes('cerita-dampak')) return 'Cerita Dampak';
  return 'Jelajahi Program';
}

export function HeroSlider({ heroes }: { heroes: NativeHero[] }) {
  const slides = useMemo(() => heroes.filter(slide => Boolean(slide.photo)), [heroes]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);
  const [visible, setVisible] = useState(true);
  const [cycle, setCycle] = useState(0);
  const startX = useRef<number | null>(null);
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  useEffect(() => {
    const target = root.current;
    if (!target || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => setVisible(Boolean(entries[0]?.isIntersecting)), { threshold: .12 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setActive(old => slides.length ? Math.min(old, slides.length - 1) : 0);
  }, [slides.length]);
  // Autoplay remains independent of cursor movement and button focus.
  const autoPaused = paused || !visible || (reduced && !manualPlay);
  useEffect(() => {
    if (slides.length < 2 || autoPaused) return;
    let timer: number | undefined;
    const run = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = document.hidden ? undefined : window.setInterval(() => {
        setActive(n => (n + 1) % slides.length);
        setCycle(n => n + 1);
      }, INTERVAL_MS);
    };
    run();
    document.addEventListener('visibilitychange', run);
    return () => {
      if (timer !== undefined) window.clearInterval(timer);
      document.removeEventListener('visibilitychange', run);
    };
  // Restart the 3-second countdown after a manual indicator/swipe selection.
  }, [slides.length, autoPaused, cycle]);

  const moveTo = (index: number) => {
    if (!slides.length) return;
    setActive((index + slides.length) % slides.length);
    setCycle(value => value + 1);
  };
  const selected = slides[active];
  const copy = fallback[active % fallback.length];
  const generic = !selected?.title || selected.title.trim().toLowerCase() === 'etos id palu';
  const headline = generic ? selected?.subtitle || copy.title : selected.title;
  const description = generic ? copy.summary : selected?.subtitle || copy.summary;
  const link = safeLink(selected?.link || '', copy.link);
  const canAuto = !autoPaused;
  const togglePlay = () => {
    setCycle(value => value + 1);
    if (reduced && !manualPlay) { setManualPlay(true); setPaused(false); return; }
    setPaused(value => !value);
  };

  return (
    <section ref={root} className="etos-signature-hero" id="beranda" aria-label="Sorotan ETOS ID Palu"
      onTouchStart={event => { startX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={event => {
        if (startX.current === null || slides.length < 2) return;
        const delta = (event.changedTouches[0]?.clientX ?? startX.current) - startX.current;
        startX.current = null;
        if (Math.abs(delta) > 62) moveTo(active + (delta < 0 ? 1 : -1));
      }}>
      <div className="etos-signature-stage">
        <div className="etos-signature-visual" aria-hidden="true">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`etos-signature-visual-slide${index === active ? ' is-current' : ''}`}
              style={{ opacity: index === active ? 1 : 0, pointerEvents: 'none' }}>
              <img className="etos-signature-image-ambient" src={slide.photo} alt=""
                style={{ objectPosition: slide.photoPosition || '50% 50%' }} loading="eager" decoding="async"/>
              <img className={`etos-signature-image-main${slide.displayMode === 'cover' ? ' is-cover' : ''}`}
                src={slide.photo} alt="" style={{ objectPosition: slide.photoPosition || '50% 50%' }}
                loading="eager" fetchPriority={index === 0 ? 'high' : 'low'} decoding="async"/>
            </div>
          ))}
          <div className="etos-signature-feather"/>
        </div>
        <div className="etos-signature-content">
          <div className="etos-signature-eyebrow">ETOS ID PALU <span>—</span> WE ARE RESILIENT LEADER</div>
          <div className="etos-signature-dynamic" key={selected?.id || 'empty'}>
            <h1>{headline}</h1>
            <p>{description}</p>
            <div className="etos-signature-actions">
              <a className="etos-signature-primary etos-living-magnetic" data-etos-magnetic href={link}>{actionText(link)} <span aria-hidden="true">↗</span></a>
              <a className="etos-signature-secondary etos-living-magnetic" data-etos-magnetic href="/#awardee">Kenali Ekosistem <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
        {slides.length > 1 ? <nav className="etos-signature-nav" aria-label="Navigasi slide utama">
          <div className="etos-signature-progress">
            {slides.map((slide, index) => <button type="button" key={slide.id}
              className={`etos-signature-progress-button${index === active ? ' is-current' : ''}`}
              aria-label={`Tampilkan slide ${index + 1}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => moveTo(index)}>
              <span className="etos-signature-progress-line">
                {index === active && canAuto ? <span key={cycle} className="etos-signature-progress-fill" style={{ animationDuration: `${INTERVAL_MS}ms` }} /> : null}
              </span>
            </button>)}
          </div>
          <button type="button" onClick={togglePlay} className="etos-signature-pause"
            aria-label={!canAuto ? 'Jalankan slide otomatis' : 'Jeda slide otomatis'}
            aria-pressed={!canAuto} title={!canAuto ? 'Putar slide' : 'Jeda slide'}>
            <span aria-hidden="true">{!canAuto ? '▶' : 'Ⅱ'}</span>
          </button>
        </nav> : null}
      </div>
    </section>
  );
}
