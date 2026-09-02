'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { NativeHero, NativeHomeStats } from '@/lib/native-public';
import styles from './HomePreview.module.css';

export function HeroSlider({ heroes, stats }: { heroes: NativeHero[]; stats: NativeHomeStats }) {
  const slides = useMemo(() => heroes.filter((item) => item.photo), [heroes]);
  const [active, setActive] = useState(0);
  const leadTitle = slides[0]?.subtitle || 'Membentuk Nalar Kritis, Menempa Etos Peradaban.';

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5600);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const current = slides[active] || slides[0];

  return (
    <section className={`${styles.hero} etos-hero`} id="beranda">
      <div className={`${styles.heroMedia} etos-hero-media`}>
        <div className="etos-hero-slides" aria-hidden="true">
          {slides.map((slide, index) => (
            <img
              key={slide.id}
              className={`etos-hero-slide${index === active ? ' is-active' : ''}`}
              src={slide.photo}
              alt=""
              style={{ objectPosition: slide.photoPosition }}
            />
          ))}
        </div>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} etos-hero-content`}>
          <div className={styles.heroKicker}>ETOS ID PALU • WE ARE RESILIENT LEADER</div>
          <h1>{current?.subtitle || leadTitle}</h1>
          <p>Ruang tumbuh bagi mahasiswa untuk menguatkan karakter, kepemimpinan, spiritualitas, dan kontribusi sosial yang berdampak.</p>
          <div className={styles.heroActions}>
            <Link href="/program" className={styles.heroPrimary}>Jelajahi Program</Link>
            <Link href="/awardee" className={styles.heroGhost}>Kenal Lebih Dekat Awardee</Link>
          </div>
        </div>
      </div>

      <div className={`${styles.heroBottom} etos-hero-bottom`}>
        <div className={`${styles.statsStrip} etos-home-stats`}>
          <div><strong>{stats.awardees}</strong><span>Awardee</span></div>
          <div><strong>{stats.programs}</strong><span>Program</span></div>
          <div><strong>{stats.publications}</strong><span>Publikasi</span></div>
        </div>
        <div className={`${styles.heroThumbs} etos-hero-thumbs`}>
          {slides.map((slide, index) => (
            <button
              type="button"
              className={`etos-hero-thumb-button${index === active ? ' is-active' : ''}`}
              key={slide.id}
              onClick={() => setActive(index)}
              aria-label={`Tampilkan foto ${index + 1}`}
            >
              <img src={slide.photo} alt="" style={{ objectPosition: slide.photoPosition }} />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
