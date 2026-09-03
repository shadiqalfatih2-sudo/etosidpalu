'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { NativeHero } from '@/lib/native-public';
import styles from './HomePreview.module.css';

const AUTOPLAY_MS = 6200;
const READY_RETRY_MS = 180;

export function HeroSlider({ heroes }: { heroes: NativeHero[] }) {
  const slides = useMemo(() => heroes.filter((item) => item.photo), [heroes]);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const readySlides = useRef<Set<number>>(new Set([0]));
  const leadTitle = slides[0]?.subtitle || 'Membentuk Nalar Kritis, Menempa Etos Peradaban.';

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
    if (slides.length < 2) return;

    let cancelled = false;
    const preloaders: HTMLImageElement[] = [];

    slides.forEach((slide, index) => {
      if (index === 0 || readySlides.current.has(index)) return;

      const image = new Image();
      preloaders.push(image);
      image.decoding = 'async';
      image.src = slide.photo;

      const markReady = () => {
        if (!cancelled) readySlides.current.add(index);
      };

      const decodeReady = () => {
        if (typeof image.decode === 'function') image.decode().then(markReady).catch(markReady);
        else markReady();
      };

      if (image.complete && image.naturalWidth > 0) decodeReady();
      else image.onload = decodeReady;
    });

    return () => {
      cancelled = true;
      preloaders.forEach((image) => {
        image.onload = null;
      });
    };
  }, [slides]);

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

  return (
    <section className={`${styles.hero} etos-hero`} id="beranda">
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
          {slides.map((slide, index) => (
            <img
              key={slide.id}
              className={`etos-hero-slide${index === active ? ' is-active' : ''}`}
              src={slide.photo}
              alt=""
              style={{ objectPosition: slide.photoPosition }}
              loading={index <= 1 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : index === 1 ? 'auto' : 'low'}
              decoding="async"
            />
          ))}
        </div>
        <div className={`${styles.heroOverlay} etos-hero-overlay`} />
        <div className={`${styles.heroContent} etos-hero-content`} data-etos-stagger="hero">
          <div className={`${styles.heroKicker} etos-hero-kicker`} data-etos-reveal="soft">ETOS ID PALU • WE ARE RESILIENT LEADER</div>
          <h1 data-etos-reveal="soft">{current?.subtitle || leadTitle}</h1>
          <p data-etos-reveal="soft">Ruang tumbuh bagi mahasiswa untuk menguatkan karakter, kepemimpinan, spiritualitas, dan kontribusi sosial yang berdampak.</p>
          <div className={`${styles.heroActions} etos-hero-actions`} data-etos-reveal="soft">
            <a href="/#program" className={`${styles.heroPrimary} etos-hero-primary`}>Jelajahi Program</a>
            <a href="/#awardee" className={`${styles.heroGhost} etos-hero-secondary`}>Kenal Lebih Dekat Awardee</a>
          </div>
        </div>
      </div>

      <div className="etos-hero-profile-block" aria-label="Profil Program Etos ID" data-etos-reveal="soft">
        <div className="etos-hero-profile-heading">
          <span>Profil Program Etos ID</span>
          <p>Tiga nilai yang menjadi fondasi karakter dan pembinaan awardee.</p>
        </div>
        <div className="etos-hero-profile-strip" data-etos-stagger="values">
          <article className="etos-hero-profile-item" data-etos-reveal="soft">
            <span className="etos-hero-profile-index">01</span>
            <div>
              <strong>Integritas</strong>
              <p>Berpikir, berkata, dan bertindak benar; teguh pada kode etik dan prinsip moral.</p>
            </div>
          </article>
          <article className="etos-hero-profile-item" data-etos-reveal="soft">
            <span className="etos-hero-profile-index">02</span>
            <div>
              <strong>Profesional</strong>
              <p>Bekerja tuntas dan akurat dengan kompetensi terbaik, tanggung jawab, dan komitmen tinggi.</p>
            </div>
          </article>
          <article className="etos-hero-profile-item" data-etos-reveal="soft">
            <span className="etos-hero-profile-index">03</span>
            <div>
              <strong>Transformatif</strong>
              <p>Memberi kontribusi melalui beragam kanal secara adil dan bertanggung jawab.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
