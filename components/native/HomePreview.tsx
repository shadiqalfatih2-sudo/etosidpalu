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
      <style>{`
        .etos-mobile-menu{display:none;position:relative}
        .etos-mobile-menu summary{list-style:none;cursor:pointer;border:1px solid #d8e1db;border-radius:999px;padding:10px 13px;color:#225e48;background:#fff;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;user-select:none}
        .etos-mobile-menu summary::-webkit-details-marker{display:none}
        .etos-mobile-menu[open] summary{background:#eef5f1}
        .etos-mobile-menu-panel{position:absolute;right:0;top:calc(100% + 10px);width:min(270px,84vw);padding:8px;background:#fff;border:1px solid #dce4df;border-radius:14px;box-shadow:0 18px 55px rgba(19,54,40,.16);display:flex;flex-direction:column;z-index:80}
        .etos-mobile-menu-panel a{color:#1b2b23;text-decoration:none;padding:11px 12px;border-radius:9px;font-size:12px;font-weight:800}
        .etos-mobile-menu-panel a:hover{background:#f1f6f3;color:#155d43}
        .etos-mobile-menu-panel a+a{border-top:1px solid #eef2ef}
        @media(max-width:1180px){.etos-mobile-menu{display:block}}
        @media(max-width:620px){.etos-mobile-menu summary{padding:9px 11px;font-size:9px}.etos-mobile-menu-panel{right:-2px}}
      `}</style>

      <Link className={`${styles.brandRow} etos-brand-row`} href="/" aria-label="Etos ID Palu">
        <BrandMark />
        <div className={`${styles.brandDivider} etos-brand-divider`} />
        <div className={`${styles.tagline} etos-tagline`}>We Are Resilient Leader</div>
      </Link>

      <nav className={`${styles.nav} etos-desktop-nav`} aria-label="Navigasi utama">
        <Link href="/">Beranda</Link>
        <Link href="/#tentang">Tentang</Link>
        <Link href="/program">Program</Link>
        <Link href="/awardee">Awardee</Link>
        <Link href="/#publikasi">Berita & Opini</Link>
      </nav>

      <div className={`${styles.actions} etos-header-actions`}>
        <Link className={`${styles.primaryButton} etos-header-primary`} href="/kirim-tulisan">Kirim Tulisan</Link>
        <Link className={`${styles.secondaryButton} etos-header-admin`} href="/admin">Admin</Link>
        <details className="etos-mobile-menu">
          <summary>Menu</summary>
          <nav className="etos-mobile-menu-panel" aria-label="Navigasi mobile">
            <Link href="/">Beranda</Link>
            <Link href="/#tentang">Tentang</Link>
            <Link href="/program">Program</Link>
            <Link href="/awardee">Awardee</Link>
            <Link href="/#publikasi">Berita & Opini</Link>
            <Link href="/kirim-tulisan">Kirim Tulisan</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

function About() {
  return (
    <section className={`${styles.about} etos-about etos-about-v3`} id="tentang">
      <div className={styles.sectionLabel}><span />Tentang Etos ID Palu</div>
      <div className={`${styles.aboutGrid} etos-about-grid-v3`}>
        <div className="etos-about-title-wrap">
          <h2>Menumbuhkan pemimpin muda yang tangguh, berakar pada nilai, dan hadir membawa dampak.</h2>
        </div>
        <div className={`${styles.aboutCopy} etos-about-copy-v3`}>
          <p>Etos ID Palu menghadirkan pembinaan yang tidak berhenti pada capaian akademik. Prosesnya dirancang sebagai ekosistem tumbuh: mengasah nalar, memperkuat spiritualitas, membangun kepemimpinan, dan menghubungkan gagasan dengan kebutuhan masyarakat.</p>
          <p>Di sini, awardee belajar untuk tidak hanya menjadi penerima manfaat, tetapi juga menjadi pribadi yang mampu mengubah pengalaman menjadi kontribusi nyata.</p>
          <Link href="/program">Lihat ekosistem pembinaan <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}

function Programs({ programs }: { programs: NativeProgram[] }) {
  return (
    <section className={`${styles.programSection} etos-program-section etos-program-section-v3`} id="program">
      <div className={`${styles.sectionHeadWide} etos-program-head-v3`}>
        <div>
          <div className={styles.sectionLabel}><span />Program Etos ID Palu</div>
          <h2>Program yang membentuk cara berpikir, karakter, dan keberanian untuk memberi dampak.</h2>
        </div>
        <p>Setiap program dirancang sebagai bagian dari satu perjalanan pembinaan: ringkas dalam tampilan, kuat dalam pengalaman, dan terhubung dengan kebutuhan awardee.</p>
      </div>

      <div className={`${styles.programGrid} etos-home-program-grid etos-program-grid-v3`}>
        {programs.slice(0, 8).map((program, index) => (
          <Link
            className={`${styles.programCard} etos-home-program-card etos-program-editorial-card`}
            href={`/program/${encodeURIComponent(program.id)}`}
            key={program.id}
          >
            <div className={`${styles.programImage} etos-home-program-image etos-program-editorial-media`}>
              {program.preview ? <img src={program.preview} alt={program.name} /> : null}
              <div className="etos-program-media-wash" />
              <div className={`${styles.programIndex} etos-program-index-v3`}>{String(index + 1).padStart(2, '0')}</div>
            </div>
            <div className="etos-program-editorial-body">
              <div className="etos-program-editorial-meta">{program.category || 'Program Pembinaan'}</div>
              <h3>{program.name}</h3>
              <p>{program.summary}</p>
              <span className="etos-program-editorial-link">Lihat program <b>↗</b></span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.sectionFootNote}><Link href="/program">Lihat seluruh program aktif →</Link></div>
    </section>
  );
}

function Awardees({ awardees }: { awardees: NativeAwardee[] }) {
  return (
    <section className={`${styles.awardeeSection} etos-awardee-section`} id="awardee">
      <div className={styles.awardeeHead}>
        <div>
          <div className={styles.sectionLabel}><span />Awardee Etos ID Palu</div>
          <h2>Orang-orang yang bertumbuh dan membawa gagasan menjadi dampak.</h2>
        </div>
        <Link href="/awardee" className={styles.darkPill}>Lihat Semua Awardee</Link>
      </div>
      <div className={`${styles.awardeeGrid} etos-home-awardee-grid`}>
        {awardees.slice(0, 5).map((awardee) => (
          <Link className={`${styles.awardeeCard} etos-home-awardee-card`} href={`/awardee/${encodeURIComponent(awardee.id)}`} key={awardee.id}>
            <div className={`${styles.imageWrap} etos-home-awardee-image`}>
              {awardee.photo ? <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition }} /> : null}
            </div>
            <div className={styles.cardBody}>
              <small>{awardee.cohort ? `Angkatan ${awardee.cohort}` : 'Awardee Etos ID'}</small>
              <h3>{awardee.name}</h3>
              <p>{awardee.studyProgram}{awardee.university ? ` • ${awardee.university}` : ''}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Publications({ publications }: { publications: NativePublication[] }) {
  const lead = publications[0];
  const rest = publications.slice(1, 5);

  return (
    <section className={`${styles.publicationSection} etos-publication-section`} id="publikasi">
      <div className={styles.sectionHeadSimple}>
        <div>
          <div className={styles.sectionLabel}><span />Berita & Opini</div>
          <h2>Catatan perjalanan, gagasan, dan dampak dari ekosistem Etos ID Palu.</h2>
        </div>
        <Link href="/#publikasi">Lihat Selengkapnya</Link>
      </div>

      {lead ? (
        <div className={`${styles.publicationLayout} etos-home-publication-layout`}>
          <Link className={`${styles.leadPublication} etos-lead-publication`} href={publicationHref(lead)}>
            <div className={`${styles.leadImage} etos-lead-publication-image`}>{lead.thumbnail ? <img src={lead.thumbnail} alt="" /> : null}</div>
            <div className={`${styles.leadBody} etos-lead-publication-copy`}>
              <div className={styles.meta}>{lead.kind} <span>•</span> {formatDate(lead.publishedAt)}</div>
              <h3>{lead.title}</h3>
              <p>{lead.excerpt}</p>
              <span className={styles.readMore}>Baca selengkapnya →</span>
            </div>
          </Link>
          <div className={styles.publicationList}>
            {rest.map((item, index) => (
              <Link href={publicationHref(item)} className={`${styles.publicationRow} etos-publication-row`} key={`${item.kind}-${item.id}`}>
                <div className={styles.publicationRowNumber}>{String(index + 2).padStart(2, '0')}</div>
                <div className={styles.publicationRowText}>
                  <small>{item.kind} • {formatDate(item.publishedAt)}</small>
                  <h3>{item.title}</h3>
                </div>
                <div className={`${styles.publicationRowImage} etos-publication-row-image`}>{item.thumbnail ? <img src={item.thumbnail} alt="" /> : null}</div>
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
    <section className={`${styles.ctaSection} etos-cta-section`}>
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
    <footer className={`${styles.footer} etos-footer etos-footer-v3`}>
      <div className={`${styles.footerBrand} etos-footer-brand-v3`}>
        <BrandMark />
        <p>We Are Resilient Leader</p>
        <span className="etos-footer-location-copy">Palu, Sulawesi Tengah</span>
      </div>
      <div className={styles.footerLinks}>
        <Link href="/#tentang">Tentang</Link>
        <Link href="/program">Program</Link>
        <Link href="/awardee">Awardee</Link>
        <Link href="/#publikasi">Berita & Opini</Link>
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
  return (
    <main className={`${styles.page} native-home`}>
      <SiteHeader />
      <HeroSlider heroes={heroes} stats={stats} />
      <About />
      <Programs programs={programs} />
      <Awardees awardees={awardees} />
      <Publications publications={publications} />
      <ClosingCta />
      <Footer />
    </main>
  );
}
