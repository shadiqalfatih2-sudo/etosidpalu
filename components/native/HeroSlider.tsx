'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeHero } from '@/lib/native-public';
import styles from './HomePreview.module.css';

const AUTOPLAY_MS = 6400;
const READY_RETRY_MS = 180;

export function HeroSlider({ heroes }: { heroes: NativeHero[] }) {
  const slides = useMemo(() => heroes.filter((item) => item.photo), [heroes]);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set());
  const readySlides = useRef<Set<number>>(new Set());
  const leadTitle = slides[0]?.subtitle || 'Membentuk Nalar Kritis, Menempa Etos Peradaban.';

  const markReady = useCallback((index: number) => {
    readySlides.current.add(index);
    setLoadedSlides((previous) => {
      if (previous.has(index)) return previous;
      const next = new Set(previous);
      next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  useEffect(() => {
    if (slides.length < 2 || reducedMotion) return;

    let switchTimer = 0;
    let readinessTimer = 0;
    let cancelled = false;

    const advanceWhenReady = () => {
      if (cancelled) return;
      const nextIndex = (active + 1) % slides.length;
      if (readySlides.current.has(nextIndex)) {
        setActive(nextIndex);
        return;
      }
      readinessTimer = window.setTimeout(advanceWhenReady, READY_RETRY_MS);
    };

    switchTimer = window.setTimeout(advanceWhenReady, AUTOPLAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(switchTimer);
      window.clearTimeout(readinessTimer);
    };
  }, [active, reducedMotion, slides.length]);

  const current = slides[active] || slides[0];
  const firstSlide = slides[0];
  const nextIndex = slides.length ? (active + 1) % slides.length : 0;

  return (
    <section className={`${styles.hero} etos-hero etos-hero-2026`} id="beranda">
      <div className={`${styles.heroMedia} etos-hero-media`}>
        <div
          className="etos-hero-slides"
          aria-hidden="true"
          style={firstSlide ? {
            backgroundImage: `url(${firstSlide.photo})`,
            backgroundPosition: firstSlide.photoPosition || '50% 50%',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          } : undefined}
        >
          {firstSlide ? (
            <img
              className="etos-hero-poster"
              src={firstSlide.photo}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: firstSlide.photoPosition || '50% 50%',
                opacity: 1,
                pointerEvents: 'none',
              }}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={() => markReady(0)}
            />
          ) : null}

          {slides.map((slide, index) => {
            const shouldLoad = index === 0 || index === active || index === nextIndex || loadedSlides.has(index);
            const isVisible = index === active && loadedSlides.has(index);
            return (
              <img
                key={slide.id}
                className={`etos-hero-slide${index === active ? ' is-active' : ''}`}
                src={shouldLoad ? slide.photo : undefined}
                alt=""
                style={{
                  objectPosition: slide.photoPosition || '50% 50%',
                  opacity: isVisible ? 1 : 0,
                }}
                loading={index === 0 || index === nextIndex ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : index === nextIndex ? 'auto' : 'low'}
                decoding="async"
                onLoad={() => markReady(index)}
              />
            );
          })}
        </div>

        <div className={`${styles.heroOverlay} etos-hero-overlay`} />

        <div className={`${styles.heroContent} etos-hero-content`}>
          <div className="etos-hero-copy-panel" data-etos-stagger="hero">
            <div className={`${styles.heroKicker} etos-hero-kicker`} data-etos-reveal="soft">ETOS ID PALU • WE ARE RESILIENT LEADER</div>
            <h1 data-etos-reveal="soft">{current?.subtitle || leadTitle}</h1>
            <p data-etos-reveal="soft">Ruang tumbuh bagi mahasiswa untuk menguatkan karakter, kepemimpinan, spiritualitas, dan kontribusi sosial yang berdampak.</p>

            <div className="etos-hero-chips" data-etos-reveal="soft">
              <span>Pembinaan karakter</span>
              <span>Kepemimpinan</span>
              <span>Kontribusi sosial</span>
            </div>

            <div className={`${styles.heroActions} etos-hero-actions`} data-etos-reveal="soft">
              <a href="/#program" className={`${styles.heroPrimary} etos-hero-primary`}>Jelajahi Program</a>
              <a href="/#awardee" className={`${styles.heroGhost} etos-hero-secondary`}>Kenal Awardee <b>→</b></a>
            </div>
          </div>
        </div>

        <aside className="etos-hero-floating-card" aria-label="Mitra kampus Etos ID Palu" data-etos-reveal="soft">
          <span>Mitra kampus</span>
          <strong>Universitas Tadulako</strong>
          <p>Kampus program ETOS ID di Palu sejak 2021.</p>
        </aside>

        {slides.length > 1 ? (
          <div className="etos-hero-controls" aria-label="Pilih slide hero">
            <span className="etos-hero-count">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
            <div className="etos-hero-dots">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  className={index === active ? 'is-active' : ''}
                  key={slide.id}
                  onClick={() => setActive(index)}
                  aria-label={`Tampilkan slide ${index + 1}`}
                  aria-current={index === active ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
