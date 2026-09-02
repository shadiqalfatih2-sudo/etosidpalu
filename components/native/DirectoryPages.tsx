import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';
import type { NativeProgram } from '@/lib/native-public';
import type { NativeAwardeeProfile, NativeProgramDetail } from '@/lib/native-directory';
import { SiteHeader } from './HomePreview';
import styles from './DirectoryPages.module.css';

function safeTextHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'blockquote'],
    allowedAttributes: {},
  });
}

export function AwardeeDirectory({ awardees }: { awardees: NativeAwardeeProfile[] }) {
  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.directoryHero}>
        <div className={styles.eyebrow}>AWARDEE ETOS ID PALU</div>
        <div className={styles.heroGrid}>
          <h1>Orang-orang yang bertumbuh bersama proses dan membawa kapasitasnya menjadi dampak.</h1>
          <p>{awardees.length} profil awardee aktif ditampilkan langsung dari database Supabase.</p>
        </div>
      </section>
      <section className={styles.directorySection}>
        <div className={styles.awardeeGrid}>
          {awardees.map((awardee) => (
            <Link href={`/awardee/${encodeURIComponent(awardee.id)}`} className={styles.awardeeCard} key={awardee.id}>
              <div className={styles.awardeeImage}>
                {awardee.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition }} />
                ) : null}
              </div>
              <div className={styles.cardMeta}>{awardee.cohort ? `Angkatan ${awardee.cohort}` : awardee.status}</div>
              <h2>{awardee.name}</h2>
              <p>{awardee.studyProgram}{awardee.university ? ` • ${awardee.university}` : ''}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export function AwardeeProfile({ awardee }: { awardee: NativeAwardeeProfile }) {
  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.profileShell}>
        <Link href="/awardee" className={styles.back}>← Semua Awardee</Link>
        <div className={styles.profileGrid}>
          <div className={styles.profilePhoto}>
            {awardee.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition }} />
            ) : null}
          </div>
          <div className={styles.profileContent}>
            <div className={styles.eyebrow}>AWARDEE ETOS ID PALU</div>
            <h1>{awardee.name}</h1>
            <div className={styles.profileFacts}>
              <div><span>Status</span><strong>{awardee.status}</strong></div>
              <div><span>Angkatan</span><strong>{awardee.cohort || '—'}</strong></div>
              <div><span>Program Studi</span><strong>{awardee.studyProgram || '—'}</strong></div>
              <div><span>Universitas</span><strong>{awardee.university || '—'}</strong></div>
            </div>
            <div className={styles.profileSummary}>{awardee.summary || 'Profil awardee belum dilengkapi.'}</div>
            {awardee.portfolio ? (
              <a className={styles.outlineButton} href={awardee.portfolio} target="_blank" rel="noreferrer">Lihat Portofolio / CV →</a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export function ProgramDirectory({ programs }: { programs: NativeProgram[] }) {
  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.directoryHero}>
        <div className={styles.eyebrow}>PROGRAM ETOS ID PALU</div>
        <div className={styles.heroGrid}>
          <h1>Ekosistem pembinaan yang menghubungkan nilai, kapasitas, kepemimpinan, dan pengabdian.</h1>
          <p>{programs.length} program aktif terhubung langsung dengan data pengelolaan program.</p>
        </div>
      </section>
      <section className={styles.directorySection}>
        <div className={styles.programGrid}>
          {programs.map((program, index) => (
            <Link href={`/program/${encodeURIComponent(program.id)}`} className={styles.programCard} key={program.id}>
              <div className={styles.programImage}>
                {program.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={program.preview} alt={program.name} />
                ) : null}
                <div className={styles.programShade} />
                <span className={styles.programNumber}>{String(index + 1).padStart(2, '0')}</span>
                <div className={styles.programText}>
                  <small>{program.category}</small>
                  <h2>{program.name}</h2>
                  <p>{program.summary}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export function ProgramDetail({ program }: { program: NativeProgramDetail }) {
  const safeDescription = safeTextHtml(program.description);
  const hero = program.photos[0]?.url || program.preview;
  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.programDetailShell}>
        <Link href="/program" className={styles.back}>← Semua Program</Link>
        <div className={styles.programDetailHead}>
          <div>
            <div className={styles.eyebrow}>{program.category}</div>
            <h1>{program.name}</h1>
          </div>
          <p>{program.summary}</p>
        </div>
        {hero ? (
          <div className={styles.programHeroImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero} alt={program.name} />
          </div>
        ) : null}
        <div className={styles.programBodyGrid}>
          <div>
            <div className={styles.bodyLabel}>Tentang Program</div>
            <div className={styles.programDescription} dangerouslySetInnerHTML={{ __html: safeDescription }} />
          </div>
          <div className={styles.programAside}>
            <div className={styles.bodyLabel}>Dokumentasi</div>
            <strong>{program.photos.length}</strong>
            <span>foto program tersedia</span>
          </div>
        </div>
        {program.photos.length > 1 ? (
          <div className={styles.gallery}>
            {program.photos.slice(1).map((photo) => (
              <figure key={photo.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.caption || program.name} style={{ objectPosition: photo.position }} />
                {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
