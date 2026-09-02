'use client';

import { useEffect, useMemo, useState } from 'react';
import type { NativeHero, NativeHomeStats } from '@/lib/native-public';
import styles from './HomePreview.module.css';

export function HeroSlider({ heroes }: { heroes: NativeHero[]; stats: NativeHomeStats }) {
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
          gap:12px;
          width:min(1180px,94%);
          margin:18px auto 30px;
        }
        .etos-hero-profile-item{
          min-width:0;
          display:grid;
          grid-template-columns:auto minmax(0,1fr);
          gap:12px;
          align-items:start;
          padding:14px 16px 15px;
          border:1px solid #e1e8e3;
          border-radius:14px;
          background:#fff;
          box-shadow:0 8px 26px rgba(24,73,54,.035);
        }
        .etos-hero-profile-index{
          width:27px;
          height:27px;
          border-radius:50%;
          display:grid;
          place-items:center;
          background:#eef5f1;
          color:#1f6b50;
          font:900 8px/1 Inter,ui-sans-serif,system-ui,sans-serif;
          letter-spacing:.04em;
        }
        .etos-hero-profile-meta{
          margin:1px 0 4px;
          color:#2d7d5e;
          font-size:8px;
          font-weight:900;
          letter-spacing:.13em;
          text-transform:uppercase;
        }
        .etos-hero-profile-item strong{
          display:block;
          color:#17372b;
          font-family:Georgia,'Times New Roman',serif;
          font-size:18px;
          line-height:1.12;
          font-weight:600;
          letter-spacing:-.018em;
        }
        .etos-hero-profile-item p{
          margin:5px 0 0;
          max-width:31rem;
          color:#6a776f;
          font-size:11px;
          line-height:1.5;
        }
        @media(max-width:820px){
          .etos-hero-profile-strip{
            grid-template-columns:1fr;
            gap:9px;
            width:calc(100% - 12px);
            margin:14px auto 24px;
          }
          .etos-hero-profile-item{padding:12px 13px 13px;gap:11px}
          .etos-hero-profile-item strong{font-size:17px}
          .etos-hero-profile-item p{font-size:10.5px;line-height:1.48}
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

      <div className="etos-hero-profile-strip" aria-label="Profil Program Etos ID">
        <article className="etos-hero-profile-item">
          <span className="etos-hero-profile-index">01</span>
          <div>
            <div className="etos-hero-profile-meta">Profil Etos ID</div>
            <strong>Integritas</strong>
            <p>Berpikir, berkata, berperilaku, dan bertindak dengan baik dan benar; teguh pada kode etik dan prinsip moral.</p>
          </div>
        </article>
        <article className="etos-hero-profile-item">
          <span className="etos-hero-profile-index">02</span>
          <div>
            <div className="etos-hero-profile-meta">Profil Etos ID</div>
            <strong>Profesional</strong>
            <p>Bekerja tuntas dan akurat dengan kompetensi terbaik, penuh tanggung jawab, dan komitmen tinggi.</p>
          </div>
        </article>
        <article className="etos-hero-profile-item">
          <span className="etos-hero-profile-index">03</span>
          <div>
            <div className="etos-hero-profile-meta">Profil Etos ID</div>
            <strong>Transformatif</strong>
            <p>Memberi kontribusi melalui beragam kanal secara adil dan bertanggung jawab.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
