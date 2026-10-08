'use client';

import { useEffect, useMemo, useState } from 'react';
import type { NativeHero } from '@/lib/native-public';
import styles from './HomePreview.module.css';
import './HybridHero.css';

const AUTOPLAY_MS = 6500;

export function HeroSlider({ heroes }: { heroes: NativeHero[] }) {
  const slides = useMemo(() => heroes.filter((item) => item.photo), [heroes]);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const leadTitle = slides[0]?.title || slides[0]?.subtitle || 'Membentuk Nalar Kritis, Menempa Etos Peradaban.';

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    setActive((current) => (current < slides.length ? current : 0));

    const preloaders = slides.slice(1).map((slide) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = slide.photo;
      return image;
    });

    return () => {
      preloaders.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [slides]);

  useEffect(() => {
    if (slides.length < 2 || paused || hovered || reducedMotion) return;

    let timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);

    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) {
        timer = window.setInterval(() => {
          setActive((current) => (current + 1) % slides.length);
        }, AUTOPLAY_MS);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [slides.length, paused, hovered, reducedMotion]);

  const current = slides[active] || slides[0];
  const goTo = (next: number) => { setPaused(true); setActive((next + slides.length) % slides.length); };
  const firstSlide = slides[0];

  return (
    <section className={`${styles.hero} etos-hero etos-hero-2026`} id="beranda" aria-label="Sorotan Etos ID Palu" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false); }}>
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
          {slides.map((slide, index) => {
            const isVisible = index === active;
            return (
              <img
                key={slide.id}
                className={`etos-hero-slide${isVisible ? ' is-active' : ''}`}
                src={slide.photo}
                alt=""
                style={{
                  objectPosition: slide.photoPosition || '50% 50%',
                  opacity: isVisible ? 1 : 0,
                  zIndex: isVisible ? 2 : 1,
                  transition: reducedMotion
                    ? 'opacity 220ms linear'
                    : 'opacity 850ms cubic-bezier(.22,.61,.36,1), transform 4800ms ease-out',
                  transform: reducedMotion
                    ? 'scale(1)'
                    : isVisible
                      ? 'scale(1)'
                      : 'scale(1.018)',
                }}
                loading={index < 2 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            );
          })}
        </div>

        <div className={`${styles.heroOverlay} etos-hero-overlay`} />
        <div className="etos-hybrid-ornament" aria-hidden="true"><svg viewBox="0 0 260 260" fill="none"><path d="M43 149C-1 53 147 4 201 79c70 99-77 194-151 111C-18 115 191 5 228 157" stroke="currentColor" strokeWidth="18" strokeLinecap="round"/><path d="M39 149C-1 53 147 4 201 79c70 99-77 194-151 111C-18 115 191 5 228 157" stroke="white" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round"/></svg></div>

        {slides.length > 2 ? (
          <div className="etos-hybrid-photo-stack" aria-hidden="true">
            {[1, 2].map((offset) => {
              const photo = slides[(active + offset) % slides.length];
              return <div className="etos-hybrid-photo-card" key={photo.id}>
                <img src={photo.photo} alt="" style={{ objectPosition: photo.photoPosition || '50% 50%' }} loading="lazy" decoding="async" />
              </div>;
            })}
          </div>
        ) : null}

        <div className={`${styles.heroContent} etos-hero-content`}>
          <div className="etos-hero-copy-panel" data-etos-stagger="hero">
            <div className={`${styles.heroKicker} etos-hero-kicker`} data-etos-reveal="soft">
              ETOS ID PALU • WE ARE RESILIENT LEADER
            </div>
            <h1 data-etos-reveal="soft">{current?.title && current.title.trim().toLowerCase() !== 'etos id palu' ? current.title : current?.subtitle || leadTitle}</h1>
            <p data-etos-reveal="soft">
              {current?.title && current.title.trim().toLowerCase() !== 'etos id palu' && current?.subtitle ? current.subtitle : 'Ruang tumbuh bagi mahasiswa untuk memperkuat nilai, nalar, spiritualitas, dan keberanian memberi dampak.'}
            </p>

            <div className={`${styles.heroActions} etos-hero-actions`} data-etos-reveal="soft">
              <a href={current?.link && (/^https?:\/\//.test(current.link) || (current.link.startsWith('/') && !current.link.startsWith('//'))) ? current.link : '/#program'} className={`${styles.heroPrimary} etos-hero-primary`}>Jelajahi Program</a>
              <a href="/" data-etos-section-target="awardee" className={`${styles.heroGhost} etos-hero-secondary`}>Kenal Awardee <b>→</b></a>
            </div>
          </div>
          {slides.length > 1 ? <div className="etos-hybrid-controls" aria-label="Kontrol hero slider"><button type="button" onClick={() => goTo(active - 1)} aria-label="Slide sebelumnya">←</button><span aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span><button type="button" onClick={() => goTo(active + 1)} aria-label="Slide berikutnya">→</button><button type="button" onClick={() => setPaused((v) => !v)} aria-label={paused ? 'Putar otomatis' : 'Jeda slide otomatis'}>{paused ? 'Putar' : 'Jeda'}</button></div> : null}
        </div>
      </div>
    </section>
  );
}
