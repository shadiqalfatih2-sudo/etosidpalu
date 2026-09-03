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
import { HomeDirectories } from './HomeDirectories';
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
        <a href="/#publikasi">Berita & Opini</a>
      </nav>

      <div className={`${styles.actions} etos-header-actions`}>
        <Link className={`${styles.primaryButton} etos-header-primary`} href="/kirim-tulisan">Kirim Tulisan</Link>
        <Link className={`${styles.secondaryButton} etos-header-admin`} href="/admin">Admin</Link>
        <MobileMenu />
      </div>
    </header>
  );
}

function About() {
  return (
    <section className={`${styles.about} etos-about etos-about-v3`} id="tentang">
      <div className={styles.sectionLabel} data-etos-reveal="line"><span />Tentang Etos ID Palu</div>
      <div className={`${styles.aboutGrid} etos-about-grid-v3`}>
        <div className="etos-about-title-wrap" data-etos-reveal="soft">
          <h2>Menumbuhkan pemimpin muda yang tangguh, berakar pada nilai, dan hadir membawa dampak.</h2>
        </div>
        <div className={`${styles.aboutCopy} etos-about-copy-v3`} data-etos-reveal="soft" data-etos-delay="90">
          <p>Etos ID Palu menghadirkan pembinaan yang tidak berhenti pada capaian akademik. Prosesnya dirancang sebagai ekosistem tumbuh: mengasah nalar, memperkuat spiritualitas, membangun kepemimpinan, dan menghubungkan gagasan dengan kebutuhan masyarakat.</p>
          <p>Di sini, awardee belajar untuk tidak hanya menjadi penerima manfaat, tetapi juga menjadi pribadi yang mampu mengubah pengalaman menjadi kontribusi nyata.</p>
          <a href="/#program">Lihat ekosistem pembinaan <span>→</span></a>
        </div>
      </div>
    </section>
  );
}

function Publications({ publications }: { publications: NativePublication[] }) {
  const lead = publications[0];
  const rest = publications.slice(1, 5);

  return (
    <section className={`${styles.publicationSection} etos-publication-section`} id="publikasi">
      <div className={styles.sectionHeadSimple} data-etos-reveal="soft">
        <div>
          <div className={styles.sectionLabel}><span />Berita & Opini</div>
          <h2>Catatan perjalanan, gagasan, dan dampak dari ekosistem Etos ID Palu.</h2>
        </div>
        <a href="/#publikasi">Lihat Selengkapnya</a>
      </div>

      {lead ? (
        <div className={`${styles.publicationLayout} etos-home-publication-layout`}>
          <Link className={`${styles.leadPublication} etos-lead-publication`} href={publicationHref(lead)} data-etos-reveal="media">
            <div className={`${styles.leadImage} etos-lead-publication-image`}>{lead.thumbnail ? <img src={lead.thumbnail} alt="" loading="lazy" decoding="async" fetchPriority="low" /> : null}</div>
            <div className={`${styles.leadBody} etos-lead-publication-copy`}>
              <div className={styles.meta}>{lead.kind} <span>•</span> {formatDate(lead.publishedAt)}</div>
              <h3>{lead.title}</h3>
              <p>{lead.excerpt}</p>
              <span className={styles.readMore}>Baca selengkapnya →</span>
            </div>
          </Link>
          <div className={styles.publicationList} data-etos-stagger="publication-list">
            {rest.map((item, index) => (
              <Link href={publicationHref(item)} className={`${styles.publicationRow} etos-publication-row`} key={`${item.kind}-${item.id}`} data-etos-reveal="soft">
                <div className={styles.publicationRowNumber}>{String(index + 2).padStart(2, '0')}</div>
                <div className={styles.publicationRowText}>
                  <small>{item.kind} • {formatDate(item.publishedAt)}</small>
                  <h3>{item.title}</h3>
                </div>
                <div className={`${styles.publicationRowImage} etos-publication-row-image`}>{item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" decoding="async" fetchPriority="low" /> : null}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ClosingCta() {
  return (
    <section className={`${styles.ctaSection} etos-cta-section`} data-etos-reveal="soft">
      <div><span>SUARA DARI EKOSISTEM ETOS</span><h2>Punya cerita, gagasan, atau pengalaman yang layak dibagikan?</h2></div>
      <div className={styles.ctaActions}>
        <Link href="/kirim-tulisan" className={styles.ctaPrimary}>Kirim Tulisan</Link>
        <a href="https://www.instagram.com/etosidpalu/" target="_blank" rel="noreferrer" className={styles.ctaSecondary}>Instagram Etos ID Palu</a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={`${styles.footer} etos-footer etos-footer-v3`} data-etos-reveal="soft">
      <div className={`${styles.footerBrand} etos-footer-brand-v3`}>
        <BrandMark />
        <p>We Are Resilient Leader</p>
        <span className="etos-footer-location-copy">Palu, Sulawesi Tengah</span>
      </div>
      <div className={styles.footerLinks}>
        <a href="/#tentang">Tentang</a>
        <a href="/#program">Program</a>
        <a href="/#awardee">Awardee</a>
        <a href="/#publikasi">Berita & Opini</a>
      </div>
      <div className={styles.footerMeta}>© {new Date().getFullYear()} Etos ID Palu.</div>
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
  void stats;
  return (
    <main className={`${styles.page} native-home`} id="beranda">
      <HomepageMotion />
      <SiteHeader />
      <HeroSlider heroes={heroes} />
      <About />
      <HomeDirectories programs={programs} awardees={awardees} />
      <Publications publications={publications} />
      <ClosingCta />
      <Footer />
    </main>
  );
}
