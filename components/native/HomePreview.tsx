import Link from 'next/link';
import type { NativeAwardee, NativePublication } from '@/lib/native-public';
import styles from './HomePreview.module.css';

function publicationHref(item: NativePublication) {
  return `/${item.kind === 'Berita' ? 'berita' : 'opini'}/${encodeURIComponent(item.slug)}`;
}

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <div className={styles.brand}>etos<span>ID</span></div>
        <div className={styles.tagline}>We Are Resilient Leader</div>
      </div>
      <nav className={styles.nav} aria-label="Navigasi utama">
        <Link href="/">Beranda</Link>
        <Link href="/#home-about">Tentang</Link>
        <Link href="/#home-programs">Program</Link>
        <Link href="/#home-awardees">Awardee</Link>
        <Link href="/#home-publications">Berita & Opini</Link>
      </nav>
      <div className={styles.actions}>
        <Link className={styles.primaryButton} href="/#submit">Kirim Tulisan</Link>
        <Link className={styles.secondaryButton} href="/#admin">Admin</Link>
      </div>
    </header>
  );
}

export function NativeHomePreview({ awardees, publications }: { awardees: NativeAwardee[]; publications: NativePublication[] }) {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.eyebrow}>NEXT.JS NATIVE PREVIEW</div>
        <h1>Orang-orang yang bertumbuh dan membawa gagasan menjadi dampak.</h1>
        <p>Preview ini memakai React Server Components + TypeScript dan mengambil data langsung dari Supabase.</p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>AWARDEE ETOS ID PALU</span>
            <h2>Profil inspiratif</h2>
          </div>
          <Link href="/#home-awardees">Lihat semua awardee</Link>
        </div>
        <div className={styles.awardeeGrid}>
          {awardees.slice(0, 4).map((awardee) => (
            <article className={styles.awardeeCard} key={awardee.id}>
              <div className={styles.imageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition }} />
              </div>
              <div className={styles.cardBody}>
                <small>{awardee.cohort ? `Angkatan ${awardee.cohort}` : 'Awardee Etos ID'}</small>
                <h3>{awardee.name}</h3>
                <p>{awardee.studyProgram}{awardee.university ? ` • ${awardee.university}` : ''}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>BERITA & OPINI</span>
            <h2>Publikasi terbaru</h2>
          </div>
          <Link href="/#home-publications">Lihat selengkapnya</Link>
        </div>
        <div className={styles.publicationGrid}>
          {publications.map((item) => (
            <Link className={styles.publicationCard} href={publicationHref(item)} key={`${item.kind}-${item.id}`}>
              <div className={styles.publicationImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumbnail} alt="" />
              </div>
              <div className={styles.publicationBody}>
                <small>{item.kind}</small>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
