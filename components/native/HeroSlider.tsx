'use client';

import { useEffect, useMemo, useState } from 'react';
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
      <style>{`
        .etos-hero-profile-strip{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          margin:14px 0 22px;
          border:1px solid #e0e8e2;
          border-radius:17px;
          overflow:hidden;
          background:#fff;
          box-shadow:0 10px 34px rgba(24,73,54,.045);
        }
        .etos-hero-profile-item{
          min-width:0;
          display:grid;
          grid-template-columns:auto minmax(0,1fr);
          gap:14px;
          align-items:start;
          padding:18px 20px 19px;
        }
        .etos-hero-profile-item + .etos-hero-profile-item{border-left:1px solid #e5ebe7}
        .etos-hero-profile-index{
          width:31px;
          height:31px;
          border-radius:50%;
          display:grid;
          place-items:center;
          background:#edf5f0;
          color:#1f6b50;
          font:900 9px/1 Inter,ui-sans-serif,system-ui,sans-serif;
          letter-spacing:.04em;
        }
        .etos-hero-profile-meta{
          margin:0 0 5px;
          color:#2d7d5e;
          font-size:9px;
          font-weight:900;
          letter-spacing:.12em;
          text-transform:uppercase;
        }
        .etos-hero-profile-item strong{
          display:block;
          color:#17372b;
          font-family:Georgia,'Times New Roman',serif;
          font-size:20px;
          line-height:1.12;
          font-weight:600;
          letter-spacing:-.02em;
        }
        .etos-hero-profile-item p{
          margin:6px 0 0;
          color:#6a776f;
          font-size:12px;
          line-height:1.55;
        }
        @media(max-width:820px){
          .etos-hero-profile-strip{grid-template-columns:1fr;margin:12px 0 18px}
          .etos-hero-profile-item{padding:14px 15px;gap:12px}
          .etos-hero-profile-item + .etos-hero-profile-item{border-left:0;border-top:1px solid #e5ebe7}
          .etos-hero-profile-item strong{font-size:18px}
          .etos-hero-profile-item p{font-size:11px}
        }
      `}</style>

      <div className={`${styles.heroMedia} etos-hero-media`}>
        <div className="etos-hero-slides" aria-hidden="true">
          {slides.map((slide, index) => (
            <img
              key={slide.id}
              className={`etos-hero-slide${index === active ? ' is-active' : ''}`}
              src={slide.photo}
              alt=""
              style={{ objectPosition: slide.photoPosition }}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              decoding="async"
            />
          ))}
        </div>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} etos-hero-content`}>
          <div className={styles.heroKicker}>ETOS ID PALU • WE ARE RESILIENT LEADER</div>
          <h1>{current?.subtitle || leadTitle}</h1>
          <p>Ruang tumbuh bagi mahasiswa untuk menguatkan karakter, kepemimpinan, spiritualitas, dan kontribusi sosial yang berdampak.</p>
          <div className={styles.heroActions}>
            <a href="/#program" className={styles.heroPrimary}>Jelajahi Program</a>
            <a href="/#awardee" className={styles.heroGhost}>Kenal Lebih Dekat Awardee</a>
          </div>
        </div>
      </div>

      <div className="etos-hero-profile-strip" aria-label="Profil singkat Etos ID Palu">
        <article className="etos-hero-profile-item">
          <span className="etos-hero-profile-index">01</span>
          <div>
            <div className="etos-hero-profile-meta">{stats.awardees} Awardee</div>
            <strong>Komunitas Pembelajar</strong>
            <p>Mahasiswa bertumbuh bersama melalui pembinaan karakter, spiritualitas, dan kepemimpinan.</p>
          </div>
        </article>
        <article className="etos-hero-profile-item">
          <span className="etos-hero-profile-index">02</span>
          <div>
            <div className="etos-hero-profile-meta">{stats.programs} Program</div>
            <strong>Pembinaan Terstruktur</strong>
            <p>Program dirancang saling terhubung untuk membangun kapasitas, resiliensi, dan kolaborasi.</p>
          </div>
        </article>
        <article className="etos-hero-profile-item">
          <span className="etos-hero-profile-index">03</span>
          <div>
            <div className="etos-hero-profile-meta">{stats.publications} Publikasi</div>
            <strong>Gagasan &amp; Dampak</strong>
            <p>Cerita, pengalaman, dan kontribusi awardee diolah menjadi pengetahuan yang dapat dibagikan.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
