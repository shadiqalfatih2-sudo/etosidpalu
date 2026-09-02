import Link from 'next/link';
import type {
  NativeAwardee,
  NativeHero,
  NativeHomeStats,
  NativeProgram,
  NativePublication,
} from '@/lib/native-public';
import styles from './HomePreview.module.css';

function publicationHref(item: NativePublication) {
  return `/native-preview/${item.kind === 'Berita' ? 'berita' : 'opini'}/${encodeURIComponent(item.slug)}`;
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
    <header className={styles.header}>
      <Link className={styles.brandRow} href="/native-preview" aria-label="Etos ID Palu">
        <div className={styles.brand}>etos<span>ID</span></div>
        <div className={styles.brandDivider} />
        <div className={styles.tagline}>We Are Resilient Leader</div>
      </Link>
      <nav className={styles.nav} aria-label="Navigasi utama">
        <Link href="/native-preview">Beranda</Link>
        <Link href="/native-preview#tentang">Tentang</Link>
        <Link href="/native-preview/program">Program</Link>
        <Link href="/native-preview/awardee">Awardee</Link>
        <Link href="/native-preview#publikasi">Berita & Opini</Link>
      </nav>
      <div className={styles.actions}>
        <Link className={styles.primaryButton} href="/#submit">Kirim Tulisan</Link>
        <Link className={styles.secondaryButton} href="/#admin">Admin</Link>
      </div>
    </header>
  );
}

function Hero({ heroes, stats }: { heroes: NativeHero[]; stats: NativeHomeStats }) {
  const lead = heroes[0];
  const support = heroes.slice(1, 4);
  return (
    <section className={styles.hero} id="beranda">
      <div className={styles.heroMedia}>
        {lead?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lead.photo} alt="Etos ID Palu" style={{ objectPosition: lead.photoPosition }} />
        ) : null}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroKicker}>ETOS ID PALU • WE ARE RESILIENT LEADER</div>
          <h1>{lead?.subtitle || 'Membentuk Nalar Kritis, Menempa Etos Peradaban.'}</h1>
          <p>Ruang tumbuh bagi mahasiswa untuk menguatkan karakter, kepemimpinan, spiritualitas, dan kontribusi sosial yang berdampak.</p>
          <div className={styles.heroActions}>
            <Link href="/native-preview/program" className={styles.heroPrimary}>Jelajahi Program</Link>
            <Link href="/native-preview/awardee" className={styles.heroGhost}>Kenal Lebih Dekat Awardee</Link>
          </div>
        </div>
      </div>

      <div className={styles.heroBottom}>
        <div className={styles.statsStrip}>
          <div><strong>{stats.awardees}</strong><span>Awardee aktif</span></div>
          <div><strong>{stats.programs}</strong><span>Program pembinaan</span></div>
          <div><strong>{stats.publications}</strong><span>Berita & opini</span></div>
        </div>
        <div className={styles.heroThumbs}>
          {support.map((hero, index) => (
            <div className={styles.heroThumb} key={hero.id}>
              {hero.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.photo} alt="" style={{ objectPosition: hero.photoPosition }} />
              ) : null}
              <span>0{index + 2}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className={styles.about} id="tentang">
      <div className={styles.sectionLabel}><span />Tentang Etos ID Palu</div>
      <div className={styles.aboutGrid}>
        <h2>Menumbuhkan pemimpin muda yang tangguh, berakar pada nilai, dan hadir membawa dampak.</h2>
        <div className={styles.aboutCopy}>
          <p>Etos ID Palu menghadirkan pembinaan yang tidak berhenti pada capaian akademik. Prosesnya dirancang sebagai ekosistem tumbuh: mengasah nalar, memperkuat spiritualitas, membangun kepemimpinan, dan menghubungkan gagasan dengan kebutuhan masyarakat.</p>
          <p>Di sini, awardee belajar untuk tidak hanya menjadi penerima manfaat, tetapi juga menjadi pribadi yang mampu mengubah pengalaman menjadi kontribusi nyata.</p>
          <Link href="/native-preview/program">Lihat ekosistem pembinaan <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}

function Programs({ programs }: { programs: NativeProgram[] }) {
  return (
    <section className={styles.programSection} id="program">
      <div className={styles.sectionHeadWide}>
        <div>
          <div className={styles.sectionLabel}><span />Program Etos ID Palu</div>
          <h2>Program yang dirancang untuk membentuk manusia, bukan sekadar memenuhi agenda.</h2>
        </div>
        <p>Setiap program menghubungkan penguatan karakter, spiritualitas, kepemimpinan, kolaborasi, dan pengabdian.</p>
      </div>
      <div className={styles.programGrid}>
        {programs.slice(0, 6).map((program, index) => (
          <Link className={styles.programCard} href={`/native-preview/program/${encodeURIComponent(program.id)}`} key={program.id}>
            <div className={styles.programImage}>
              {program.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={program.preview} alt={program.name} />
              ) : null}
              <div className={styles.programShade} />
              <div className={styles.programIndex}>{String(index + 1).padStart(2, '0')}</div>
              <div className={styles.programOverlayContent}>
                <small>{program.category}</small>
                <h3>{program.name}</h3>
                <p>{program.summary}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className={styles.sectionFootNote}><Link href="/native-preview/program">Lihat seluruh program aktif →</Link></div>
    </section>
  );
}

function Awardees({ awardees }: { awardees: NativeAwardee[] }) {
  return (
    <section className={styles.awardeeSection} id="awardee">
      <div className={styles.awardeeHead}>
        <div>
          <div className={styles.sectionLabel}><span />Awardee Etos ID Palu</div>
          <h2>Orang-orang yang bertumbuh dan membawa gagasan menjadi dampak.</h2>
        </div>
        <Link href="/native-preview/awardee" className={styles.darkPill}>Lihat Semua Awardee</Link>
      </div>
      <div className={styles.awardeeGrid}>
        {awardees.slice(0, 4).map((awardee) => (
          <Link className={styles.awardeeCard} href={`/native-preview/awardee/${encodeURIComponent(awardee.id)}`} key={awardee.id}>
            <div className={styles.imageWrap}>
              {awardee.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition }} />
              ) : null}
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
    <section className={styles.publicationSection} id="publikasi">
      <div className={styles.sectionHeadSimple}>
        <div>
          <div className={styles.sectionLabel}><span />Berita & Opini</div>
          <h2>Catatan perjalanan, gagasan, dan dampak dari ekosistem Etos ID Palu.</h2>
        </div>
        <Link href="/native-preview#publikasi">Lihat Selengkapnya</Link>
      </div>

      {lead ? (
        <div className={styles.publicationLayout}>
          <Link className={styles.leadPublication} href={publicationHref(lead)}>
            <div className={styles.leadImage}>
              {lead.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lead.thumbnail} alt="" />
              ) : null}
            </div>
            <div className={styles.leadBody}>
              <div className={styles.meta}>{lead.kind} <span>•</span> {formatDate(lead.publishedAt)}</div>
              <h3>{lead.title}</h3>
              <p>{lead.excerpt}</p>
              <span className={styles.readMore}>Baca selengkapnya →</span>
            </div>
          </Link>
          <div className={styles.publicationList}>
            {rest.map((item, index) => (
              <Link href={publicationHref(item)} className={styles.publicationRow} key={`${item.kind}-${item.id}`}>
                <div className={styles.publicationRowNumber}>{String(index + 2).padStart(2, '0')}</div>
                <div className={styles.publicationRowText}>
                  <small>{item.kind} • {formatDate(item.publishedAt)}</small>
                  <h3>{item.title}</h3>
                </div>
                <div className={styles.publicationRowImage}>
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnail} alt="" />
                  ) : null}
                </div>
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
    <section className={styles.ctaSection}>
      <div>
        <span>SUARA DARI EKOSISTEM ETOS</span>
        <h2>Punya cerita, gagasan, atau pengalaman yang layak dibagikan?</h2>
      </div>
      <div className={styles.ctaActions}>
        <Link href="/#submit" className={styles.ctaPrimary}>Kirim Tulisan</Link>
        <a href="https://www.instagram.com/etosidpalu/" target="_blank" rel="noreferrer" className={styles.ctaSecondary}>Instagram Etos ID Palu</a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        <div className={styles.brand}>etos<span>ID</span></div>
        <p>We Are Resilient Leader</p>
      </div>
      <div className={styles.footerLinks}>
        <Link href="/native-preview#tentang">Tentang</Link>
        <Link href="/native-preview/program">Program</Link>
        <Link href="/native-preview/awardee">Awardee</Link>
        <Link href="/native-preview#publikasi">Berita & Opini</Link>
      </div>
      <div className={styles.footerMeta}>© {new Date().getFullYear()} Etos ID Palu. Native Next.js migration preview.</div>
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
    <main className={styles.page}>
      <SiteHeader />
      <Hero heroes={heroes} stats={stats} />
      <About />
      <Programs programs={programs} />
      <Awardees awardees={awardees} />
      <Publications publications={publications} />
      <ClosingCta />
      <Footer />
    </main>
  );
}
