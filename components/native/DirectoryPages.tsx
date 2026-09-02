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

function awardeeStudyLine(awardee: NativeAwardeeProfile) {
  return [awardee.studyProgram, awardee.university].filter(Boolean).join(' • ');
}

export function AwardeeDirectory({ awardees }: { awardees: NativeAwardeeProfile[] }) {
  return (
    <main className={`${styles.page} native-directory native-awardee-directory`}>
      <SiteHeader />
      <section className={`${styles.directoryHero} native-directory-hero`}>
        <div className={styles.eyebrow}>AWARDEE ETOS ID PALU</div>
        <div className={`${styles.heroGrid} native-directory-hero-grid`}>
          <h1>Orang-orang yang bertumbuh bersama proses dan membawa kapasitasnya menjadi dampak.</h1>
          <p>{awardees.length} profil awardee aktif ditampilkan langsung dari database Supabase.</p>
        </div>
      </section>
      <section className={`${styles.directorySection} native-directory-section`}>
        <div className={`${styles.awardeeGrid} native-awardee-directory-grid`}>
          {awardees.map((awardee) => {
            const studyLine = awardeeStudyLine(awardee);
            return (
              <Link href={`/awardee/${encodeURIComponent(awardee.id)}`} className={`${styles.awardeeCard} native-awardee-directory-card`} key={awardee.id}>
                <div className={`${styles.awardeeImage} native-awardee-directory-image`}>
                  {awardee.photo ? <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition }} loading="lazy" decoding="async" fetchPriority="low" /> : null}
                </div>
                <div className={styles.cardMeta}>{awardee.cohort ? `Angkatan ${awardee.cohort}` : awardee.status}</div>
                <h2>{awardee.name}</h2>
                {studyLine ? <p>{studyLine}</p> : null}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export function AwardeeProfile({ awardee }: { awardee: NativeAwardeeProfile }) {
  const facts = [
    awardee.status ? { label: 'Status', value: awardee.status } : null,
    awardee.cohort ? { label: 'Angkatan', value: awardee.cohort } : null,
    awardee.studyProgram ? { label: 'Program Studi', value: awardee.studyProgram } : null,
    awardee.university ? { label: 'Universitas', value: awardee.university } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <main className={`${styles.page} native-directory native-awardee-profile`}>
      <SiteHeader />
      <section className={`${styles.profileShell} native-profile-shell`}>
        <Link href="/awardee" className={styles.back}>← Semua Awardee</Link>
        <div className={`${styles.profileGrid} native-profile-grid`}>
          <div className={`${styles.profilePhoto} native-profile-photo`}>
            {awardee.photo ? <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition }} loading="eager" decoding="async" fetchPriority="high" /> : null}
          </div>
          <div className={`${styles.profileContent} native-profile-content`}>
            <div className={styles.eyebrow}>AWARDEE ETOS ID PALU</div>
            <h1>{awardee.name}</h1>
            {facts.length ? (
              <div className={`${styles.profileFacts} native-profile-facts`}>
                {facts.map((fact) => <div key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></div>)}
              </div>
            ) : null}
            {awardee.summary ? <div className={styles.profileSummary}>{awardee.summary}</div> : null}
            {awardee.portfolio ? <a className={styles.outlineButton} href={awardee.portfolio} target="_blank" rel="noreferrer">Lihat Portofolio / CV →</a> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export function ProgramDirectory({ programs }: { programs: NativeProgram[] }) {
  return (
    <main className={`${styles.page} native-directory native-program-directory`}>
      <SiteHeader />
      <section className={`${styles.directoryHero} native-directory-hero`}>
        <div className={styles.eyebrow}>PROGRAM ETOS ID PALU</div>
        <div className={`${styles.heroGrid} native-directory-hero-grid`}>
          <h1>Ekosistem pembinaan yang menghubungkan nilai, kapasitas, kepemimpinan, dan pengabdian.</h1>
          <p>{programs.length} program aktif terhubung langsung dengan data pengelolaan program.</p>
        </div>
      </section>
      <section className={`${styles.directorySection} native-directory-section`}>
        <div className={`${styles.programGrid} native-program-directory-grid etos-program-directory-grid-v3`}>
          {programs.map((program, index) => (
            <Link
              href={`/program/${encodeURIComponent(program.id)}`}
              className={`${styles.programCard} native-program-directory-card etos-program-directory-card-v3`}
              key={program.id}
            >
              <div className={`${styles.programImage} native-program-directory-image etos-program-directory-media-v3`}>
                {program.preview ? <img src={program.preview} alt={program.name} loading="lazy" decoding="async" fetchPriority="low" /> : null}
                <span className={`${styles.programNumber} etos-program-directory-number-v3`}>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="etos-program-directory-body-v3">
                <small>{program.category || 'Program Pembinaan'}</small>
                <h2>{program.name}</h2>
                <p>{program.summary}</p>
                <span>Lihat detail <b>↗</b></span>
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
    <main className={`${styles.page} native-directory native-program-detail`}>
      <SiteHeader />
      <section className={`${styles.programDetailShell} native-program-detail-shell`}>
        <Link href="/program" className={styles.back}>← Semua Program</Link>
        <div className={`${styles.programDetailHead} native-program-detail-head`}>
          <div><div className={styles.eyebrow}>{program.category}</div><h1>{program.name}</h1></div>
          <p>{program.summary}</p>
        </div>
        {hero ? <div className={`${styles.programHeroImage} native-program-detail-hero`}><img src={hero} alt={program.name} loading="eager" decoding="async" fetchPriority="high" /></div> : null}
        <div className={`${styles.programBodyGrid} native-program-body-grid`}>
          <div><div className={styles.bodyLabel}>Tentang Program</div><div className={styles.programDescription} dangerouslySetInnerHTML={{ __html: safeDescription }} /></div>
          <div className={styles.programAside}><div className={styles.bodyLabel}>Dokumentasi</div><strong>{program.photos.length}</strong><span>foto program tersedia</span></div>
        </div>
        {program.photos.length > 1 ? <div className={`${styles.gallery} native-program-gallery`}>{program.photos.slice(1).map((photo) => <figure key={photo.id}><img src={photo.url} alt={photo.caption || program.name} style={{ objectPosition: photo.position }} loading="lazy" decoding="async" fetchPriority="low" />{photo.caption ? <figcaption>{photo.caption}</figcaption> : null}</figure>)}</div> : null}
      </section>
    </main>
  );
}
