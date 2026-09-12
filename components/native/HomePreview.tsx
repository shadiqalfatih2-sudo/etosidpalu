import Link from 'next/link';
import type {
  NativeAwardee,
  NativeHero,
  NativeHomeStats,
  NativeProgram,
  NativePublication,
} from '@/lib/native-public';
import { BrandMark } from './BrandMark';
import { HeroSlider } from './HeroSlider';
import { HomeDirectories, ProgramPartner } from './HomeDirectories';
import { HomepageMotion } from './HomepageMotion';
import { MobileMenu } from './MobileMenu';
import styles from './HomePreview.module.css';

function publicationHref(item: NativePublication) {
  return `/${item.kind === 'Berita' ? 'berita' : 'opini'}/${encodeURIComponent(item.slug)}`;
}

function formatDate(value: string) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export function SiteHeader() {
  return (
    <header className={`${styles.header} etos-site-header`}>
      <a className={`${styles.brandRow} etos-brand-row`} href="/#beranda" aria-label="Etos ID Palu">
        <BrandMark />
        <div className={`${styles.brandDivider} etos-brand-divider`} />
        <div className={`${styles.tagline} etos-tagline`}>We Are Resilient Leader</div>
      </a>

      <nav className={`${styles.nav} etos-desktop-nav`} aria-label="Navigasi utama">
        <a href="/#beranda">Beranda</a>
        <a href="/#tentang">Tentang</a>
        <a href="/#program">Program</a>
        <a href="/#awardee">Awardee</a>
        <a href="/#publikasi">Publikasi</a>
      </nav>

      <div className={`${styles.actions} etos-header-actions`}>
        <Link className={`${styles.primaryButton} etos-header-primary`} href="/kirim-tulisan">Kirim Tulisan</Link>
        <Link className={`${styles.secondaryButton} etos-header-admin`} href="/admin" aria-label="Masuk ke halaman admin">Admin</Link>
        <MobileMenu />
      </div>
    </header>
  );
}

function ImpactStrip({ stats }: { stats: NativeHomeStats }) {
  const items = [
    { value: stats.awardees, label: 'Awardee dalam ekosistem', note: 'bertumbuh bersama Etos ID Palu' },
    { value: stats.programs, label: 'Program pembinaan aktif', note: 'spiritual, intelektual, dan kepemimpinan' },
    { value: stats.publications, label: 'Publikasi & cerita', note: 'gagasan dan perjalanan dampak' },
    { value: '2021', label: 'Bersama Universitas Tadulako', note: 'kampus program ETOS ID di Palu' },
  ];

  return (
    <section className="etos-impact" aria-label="Ringkasan Etos ID Palu" data-etos-reveal="soft">
      <div className="etos-impact-grid">
        {items.map((item) => (
          <article className="etos-impact-card" key={`${item.value}-${item.label}`}>
            <strong>{item.value}</strong>
            <div>
              <span>{item.label}</span>
              <p>{item.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function About({ visual }: { visual: string }) {
  return (
    <section className={`${styles.about} etos-about etos-about-2026`} id="tentang">
      <div className="etos-about-shell">
        <div className="etos-about-visual" data-etos-reveal="media">
          {visual ? <img src={visual} alt="Dokumentasi kegiatan Etos ID Palu" loading="lazy" decoding="async" fetchPriority="low" /> : null}
          <div className="etos-about-visual-badge">
            <span>ETOS ID PALU</span>
            <strong>Ruang tumbuh untuk pemimpin muda yang tangguh dan berdampak.</strong>
          </div>
        </div>

        <div className="etos-about-content" data-etos-reveal="soft">
          <div className={`${styles.sectionLabel} etos-section-pill`}>Tentang Kami</div>
          <h2>Menumbuhkan pemimpin muda yang kuat dalam nilai, tajam dalam nalar, dan nyata dalam kontribusi.</h2>
          <p className="etos-about-lead">Etos ID Palu menghadirkan pembinaan yang tidak berhenti pada capaian akademik. Awardee dibentuk melalui pengalaman yang menguatkan spiritualitas, kepemimpinan, kolaborasi, dan keberanian menjawab kebutuhan masyarakat.</p>

          <div className="etos-value-grid" aria-label="Nilai pembinaan Etos ID Palu">
            <article className="etos-value-card">
              <span>01</span>
              <div><strong>Integritas</strong><p>Teguh pada nilai, etika, dan tanggung jawab dalam setiap keputusan.</p></div>
            </article>
            <article className="etos-value-card">
              <span>02</span>
              <div><strong>Profesional</strong><p>Belajar bekerja tuntas, akurat, kolaboratif, dan dapat dipercaya.</p></div>
            </article>
            <article className="etos-value-card">
              <span>03</span>
              <div><strong>Transformatif</strong><p>Mengubah pengetahuan dan pengalaman menjadi manfaat yang terasa.</p></div>
            </article>
          </div>

          <a className="etos-inline-link" href="/#program">Jelajahi ekosistem pembinaan <span>→</span></a>
        </div>
      </div>
    </section>
  );
}

function Publications({ publications }: { publications: NativePublication[] }) {
  const cards = publications.slice(0, 3);
  if (!cards.length) return null;

  return (
    <section className={`${styles.publicationSection} etos-publication-section`} id="publikasi">
      <div className={`${styles.sectionHeadSimple} etos-publication-head`} data-etos-reveal="soft">
        <div>
          <div className={`${styles.sectionLabel} etos-section-pill`}>Berita & Opini</div>
          <h2>Catatan perjalanan, gagasan, dan dampak dari ekosistem Etos ID Palu.</h2>
        </div>
        <span className="etos-section-caption">Pembaruan terbaru dari ekosistem Etos ID Palu</span>
      </div>

      <div className="etos-publication-grid" data-etos-stagger="publication-grid">
        {cards.map((item) => (
          <Link href={publicationHref(item)} className="etos-publication-card" key={`${item.kind}-${item.id}`} data-etos-reveal="media">
            <div className="etos-publication-image">
              {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" decoding="async" fetchPriority="low" /> : <div className="etos-publication-placeholder" />}
              <span className="etos-publication-kind">{item.kind}</span>
            </div>
            <div className="etos-publication-body">
              <small>{formatDate(item.publishedAt)}</small>
              <h3>{item.title}</h3>
              {item.excerpt ? <p>{item.excerpt}</p> : null}
              <span className={styles.readMore}>Baca selengkapnya <b>↗</b></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className={`${styles.ctaSection} etos-cta-section`} data-etos-reveal="soft">
      <div className="etos-cta-copy">
        <span>SUARA DARI EKOSISTEM ETOS</span>
        <h2>Punya cerita, gagasan, atau pengalaman yang layak dibagikan?</h2>
        <p>Kirim tulisanmu dan ikut merawat ruang belajar yang tumbuh dari pengalaman nyata awardee.</p>
      </div>
      <div className={styles.ctaActions}>
        <Link href="/kirim-tulisan" className={styles.ctaPrimary}>Kirim Tulisan</Link>
        <a href="https://www.instagram.com/etosidpalu/" target="_blank" rel="noreferrer" className={styles.ctaSecondary}>Instagram Etos ID Palu</a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={`${styles.footer} etos-footer etos-footer-2026`} data-etos-reveal="soft">
      <div className={`${styles.footerBrand} etos-footer-brand-v3`}>
        <BrandMark />
        <p>Ekosistem pembinaan mahasiswa untuk menumbuhkan resilient leader yang berintegritas, profesional, dan transformatif.</p>
        <span className="etos-footer-location-copy">Palu, Sulawesi Tengah</span>
      </div>

      <div className="etos-footer-group">
        <strong>Navigasi</strong>
        <div className={styles.footerLinks}>
          <a href="/#tentang">Tentang</a>
          <a href="/#program">Program</a>
          <a href="/#awardee">Awardee</a>
          <a href="/#publikasi">Publikasi</a>
        </div>
      </div>

      <div className="etos-footer-group">
        <strong>Terhubung</strong>
        <div className={styles.footerLinks}>
          <Link href="/kirim-tulisan">Kirim Tulisan</Link>
          <a href="https://www.instagram.com/etosidpalu/" target="_blank" rel="noreferrer">Instagram</a>
          <Link href="/admin">Admin</Link>
        </div>
      </div>

      <div className={styles.footerMeta}>© {new Date().getFullYear()} Etos ID Palu. We Are Resilient Leader.</div>
    </footer>
  );
}

export function NativeHomePreview({
  heroes,
  programs,
  awardees,
  publications,
  stats,
}: {
  heroes: NativeHero[];
  programs: NativeProgram[];
  awardees: NativeAwardee[];
  publications: NativePublication[];
  stats: NativeHomeStats;
}) {
  const aboutVisual = heroes[1]?.photo || heroes[0]?.photo || programs.find((item) => item.preview)?.preview || awardees.find((item) => item.photo)?.photo || '';

  return (
    <main className={`${styles.page} native-home native-home-2026`} id="beranda">
      <HomepageMotion />
      <SiteHeader />
      <HeroSlider heroes={heroes} />
      <ImpactStrip stats={stats} />
      <About visual={aboutVisual} />
      <ProgramPartner />
      <HomeDirectories programs={programs} awardees={awardees} />
      <Publications publications={publications} />
      <ClosingCta />
      <Footer />
    </main>
  );
}
