'use client';

import { useEffect, useMemo, useState } from 'react';
import type { NativeAwardee, NativeProgram, NativeProgramPhoto } from '@/lib/native-public';
import homeStyles from './HomePreview.module.css';
import styles from './HomeDirectories.module.css';

type DrawerState =
  | { kind: 'program'; item: NativeProgram }
  | { kind: 'awardee'; item: NativeAwardee }
  | null;

function cleanText(value: string) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function ProgramDrawer({ program, onClose }: { program: NativeProgram; onClose: () => void }) {
  const photos = useMemo(() => {
    const rows = (program.photos || []).filter((photo) => photo.url);
    if (program.preview && !rows.some((photo) => photo.url === program.preview)) {
      return [{ id: `preview-${program.id}`, url: program.preview, caption: '', position: '50% 50%', order: 0 }, ...rows];
    }
    return rows;
  }, [program]);
  const [activePhoto, setActivePhoto] = useState<NativeProgramPhoto | null>(photos[0] || null);

  useEffect(() => {
    setActivePhoto(photos[0] || null);
  }, [photos]);

  const description = cleanText(program.description || program.summary);

  return (
    <>
      <div className={styles.drawerTop}>
        <div className={styles.drawerEyebrow}>{program.category || 'Program Pembinaan'}</div>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Tutup detail program">×</button>
      </div>
      <div className={styles.drawerBody}>
        {activePhoto?.url ? (
          <div className={styles.programHero}>
            <img src={activePhoto.url} alt={activePhoto.caption || program.name} style={{ objectPosition: activePhoto.position || '50% 50%' }} decoding="async" fetchPriority="high" />
          </div>
        ) : null}
        <h2 className={styles.drawerTitle}>{program.name}</h2>
        {program.summary ? <p className={styles.drawerLead}>{program.summary}</p> : null}
        {description ? (
          <div className={styles.detailBlock}>
            <h3>Tentang Program</h3>
            <p>{description}</p>
          </div>
        ) : null}
        {photos.length > 1 ? (
          <div className={styles.detailBlock}>
            <h3>Dokumentasi</h3>
            <div className={styles.gallery}>
              {photos.map((photo) => (
                <button className={styles.galleryButton} type="button" key={photo.id} onClick={() => setActivePhoto(photo)} aria-label={`Lihat ${photo.caption || program.name}`}>
                  <img src={photo.url} alt={photo.caption || program.name} style={{ objectPosition: photo.position || '50% 50%' }} loading="lazy" decoding="async" fetchPriority="low" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function AwardeeDrawer({ awardee, onClose }: { awardee: NativeAwardee; onClose: () => void }) {
  const facts = [
    awardee.status ? ['Status', awardee.status] : null,
    awardee.cohort ? ['Angkatan', awardee.cohort] : null,
    awardee.studyProgram ? ['Program Studi', awardee.studyProgram] : null,
    awardee.university ? ['Universitas', awardee.university] : null,
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <>
      <div className={styles.drawerTop}>
        <div className={styles.drawerEyebrow}>Awardee Etos ID Palu</div>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Tutup profil awardee">×</button>
      </div>
      <div className={styles.drawerBody}>
        {awardee.photo ? (
          <div className={styles.awardeeHero}>
            <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition || '50% 50%' }} decoding="async" fetchPriority="high" />
          </div>
        ) : null}
        <h2 className={styles.drawerTitle}>{awardee.name}</h2>
        {facts.length ? (
          <div className={styles.facts}>
            {facts.map(([label, value]) => (
              <div className={styles.fact} key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
        ) : null}
        {awardee.summary ? (
          <div className={styles.detailBlock}>
            <h3>Profil Singkat</h3>
            <p>{awardee.summary}</p>
          </div>
        ) : null}
        {awardee.portfolio ? <a className={styles.portfolioLink} href={awardee.portfolio} target="_blank" rel="noreferrer">Lihat Portofolio / CV →</a> : null}
      </div>
    </>
  );
}

function DetailDrawer({ state, onClose }: { state: DrawerState; onClose: () => void }) {
  useEffect(() => {
    if (!state) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [state, onClose]);

  if (!state) return null;

  return (
    <div className={styles.drawerBackdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={state.kind === 'program' ? `Detail program ${state.item.name}` : `Profil awardee ${state.item.name}`}>
        {state.kind === 'program'
          ? <ProgramDrawer program={state.item} onClose={onClose} />
          : <AwardeeDrawer awardee={state.item} onClose={onClose} />}
      </aside>
    </div>
  );
}

export function HomeDirectories({ programs, awardees }: { programs: NativeProgram[]; awardees: NativeAwardee[] }) {
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [showAllAwardees, setShowAllAwardees] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const visiblePrograms = showAllPrograms ? programs : programs.slice(0, 8);
  const visibleAwardees = showAllAwardees ? awardees : awardees.slice(0, 8);

  return (
    <>
      <section className={`${homeStyles.programSection} etos-program-section etos-program-section-v3`} id="program">
        <div className={`${homeStyles.sectionHeadWide} etos-program-head-v3`}>
          <div>
            <div className={homeStyles.sectionLabel}><span />Program Etos ID Palu</div>
            <h2>Program yang membentuk cara berpikir, karakter, dan keberanian untuk memberi dampak.</h2>
          </div>
          <p>Setiap program dirancang sebagai bagian dari satu perjalanan pembinaan: ringkas dalam tampilan, kuat dalam pengalaman, dan terhubung dengan kebutuhan awardee.</p>
        </div>

        <div className={`${homeStyles.programGrid} etos-home-program-grid etos-program-grid-v3`}>
          {visiblePrograms.map((program, index) => (
            <button
              className={`${homeStyles.programCard} ${styles.cardButton} etos-home-program-card etos-program-editorial-card`}
              type="button"
              onClick={() => setDrawer({ kind: 'program', item: program })}
              key={program.id}
            >
              <div className={`${homeStyles.programImage} etos-home-program-image etos-program-editorial-media`}>
                {program.preview ? <img src={program.preview} alt={program.name} loading="lazy" decoding="async" fetchPriority="low" /> : null}
                <div className="etos-program-media-wash" />
                <div className={`${homeStyles.programIndex} etos-program-index-v3`}>{String(index + 1).padStart(2, '0')}</div>
              </div>
              <div className="etos-program-editorial-body">
                <div className="etos-program-editorial-meta">{program.category || 'Program Pembinaan'}</div>
                <h3>{program.name}</h3>
                <p>{program.summary}</p>
                <span className="etos-program-editorial-link">Lihat program <b>↗</b></span>
              </div>
            </button>
          ))}
        </div>

        {programs.length > 8 ? (
          <div className={homeStyles.sectionFootNote}>
            <button className={styles.textAction} type="button" onClick={() => setShowAllPrograms((value) => !value)}>
              {showAllPrograms ? 'Tampilkan lebih ringkas ↑' : `Lihat seluruh ${programs.length} program aktif →`}
            </button>
          </div>
        ) : null}
      </section>

      <section className={`${homeStyles.awardeeSection} etos-awardee-section`} id="awardee">
        <div className={homeStyles.awardeeHead}>
          <div>
            <div className={homeStyles.sectionLabel}><span />Awardee Etos ID Palu</div>
            <h2>Orang-orang yang bertumbuh dan membawa gagasan menjadi dampak.</h2>
          </div>
          {awardees.length > 8 ? (
            <button className={`${homeStyles.darkPill} ${styles.sectionAction}`} type="button" onClick={() => setShowAllAwardees((value) => !value)}>
              {showAllAwardees ? 'Tampilkan Ringkas' : 'Lihat Semua Awardee'}
            </button>
          ) : null}
        </div>
        <div className={`${homeStyles.awardeeGrid} etos-home-awardee-grid`}>
          {visibleAwardees.map((awardee) => (
            <button className={`${homeStyles.awardeeCard} ${styles.cardButton} etos-home-awardee-card`} type="button" onClick={() => setDrawer({ kind: 'awardee', item: awardee })} key={awardee.id}>
              <div className={`${homeStyles.imageWrap} etos-home-awardee-image`}>
                {awardee.photo ? <img src={awardee.photo} alt={awardee.name} style={{ objectPosition: awardee.photoPosition }} loading="lazy" decoding="async" fetchPriority="low" /> : null}
              </div>
              <div className={homeStyles.cardBody}>
                <small>{awardee.cohort ? `Angkatan ${awardee.cohort}` : 'Awardee Etos ID'}</small>
                <h3>{awardee.name}</h3>
                {(awardee.studyProgram || awardee.university) ? <p>{[awardee.studyProgram, awardee.university].filter(Boolean).join(' • ')}</p> : null}
              </div>
            </button>
          ))}
        </div>
      </section>

      <DetailDrawer state={drawer} onClose={() => setDrawer(null)} />
    </>
  );
}
