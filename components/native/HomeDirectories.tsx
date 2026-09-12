'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeAwardee, NativeProgram, NativeProgramPhoto } from '@/lib/native-public';
import homeStyles from './HomePreview.module.css';
import styles from './HomeDirectories.module.css';

type DrawerState =
  | { kind: 'program'; item: NativeProgram }
  | { kind: 'awardee'; item: NativeAwardee }
  | null;

const HOMEPAGE_DIRECTORY_LIMIT = 4;

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

function compactText(value: string, limit = 145) {
  const text = cleanText(value);
  if (text.length <= limit) return text;
  const shortened = text.slice(0, limit + 1).replace(/\s+\S*$/, '').trim();
  return `${shortened || text.slice(0, limit).trim()}…`;
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
                <button
                  className={styles.galleryButton}
                  type="button"
                  key={photo.id}
                  onClick={() => setActivePhoto(photo)}
                  aria-label={`Lihat ${photo.caption || program.name}`}
                  aria-pressed={activePhoto?.id === photo.id}
                >
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);

  const closeWithMotion = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (dialog?.open) dialog.close();
      setClosing(false);
      onClose();
    }, 180);
  }, [closing, onClose]);

  useEffect(() => {
    if (!state) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    setClosing(false);
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute('open', '');
      }
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      if (dialog.open) dialog.close();
    };
  }, [state]);

  if (!state) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`etos-directory-dialog${closing ? ' is-closing' : ''}`}
      aria-label={state.kind === 'program' ? `Detail program ${state.item.name}` : `Profil awardee ${state.item.name}`}
      onCancel={(event) => {
        event.preventDefault();
        closeWithMotion();
      }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) closeWithMotion();
      }}
    >
      <aside className={`${styles.drawer} etos-directory-dialog-panel`} role="document">
        {state.kind === 'program'
          ? <ProgramDrawer program={state.item} onClose={closeWithMotion} />
          : <AwardeeDrawer awardee={state.item} onClose={closeWithMotion} />}
      </aside>
    </dialog>
  );
}

export function ProgramPartner() {
  return (
    <section className="etos-partner-section" id="mitra-program" aria-labelledby="mitra-program-title">
      <div className="etos-partner-shell" data-etos-reveal="soft">
        <div className="etos-partner-mark" data-etos-reveal="media">
          <img
            src="https://untad.ac.id/wp-content/uploads/2024/03/Logo-Untad-Baru.jpg"
            alt="Lambang resmi Universitas Tadulako"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="etos-partner-copy" data-etos-reveal="soft" data-etos-delay="70">
          <div className="etos-partner-eyebrow">Mitra Program</div>
          <h2 id="mitra-program-title">Tumbuh bersama Universitas Tadulako.</h2>
          <p>Universitas Tadulako menjadi kampus program Etos ID di Palu sejak 2021, menjadi ruang tumbuh bagi pembinaan, pendampingan, dan pengembangan penerima manfaat.</p>
        </div>
        <div className="etos-partner-meta" data-etos-reveal="soft" data-etos-delay="140">
          <strong>Universitas Tadulako</strong>
          <span>Kampus Program ETOS ID Palu • Sejak 2021</span>
          <a href="https://untad.ac.id/" target="_blank" rel="noreferrer">Kunjungi UNTAD <b>↗</b></a>
        </div>
      </div>
    </section>
  );
}

function StoryBridge({ programs, awardees }: { programs: NativeProgram[]; awardees: NativeAwardee[] }) {
  const visual = programs.find((program) => program.preview)?.preview || awardees.find((awardee) => awardee.photo)?.photo || '';

  return (
    <section className="etos-story-section" aria-labelledby="etos-story-title">
      <div className="etos-story-media" data-etos-reveal="media">
        {visual ? <img src={visual} alt="Dokumentasi perjalanan pembinaan Etos ID Palu" loading="lazy" decoding="async" fetchPriority="low" /> : null}
        <span className="etos-story-stamp">Etos ID Palu • Resilient Leader</span>
      </div>
      <div className="etos-story-copy" data-etos-reveal="soft">
        <div className="etos-story-kicker">Perjalanan Awardee</div>
        <h2 id="etos-story-title">Dari penerima manfaat menjadi pemberi manfaat.</h2>
        <p>Pembinaan Etos dirancang agar pengalaman belajar berujung pada kontribusi: dari ruang diskusi dan penguatan karakter, menuju kepemimpinan serta kerja sosial yang dekat dengan kebutuhan masyarakat.</p>
        <a href="/#awardee">Kenal lebih dekat awardee →</a>
      </div>
    </section>
  );
}

export function HomeDirectories({ programs, awardees }: { programs: NativeProgram[]; awardees: NativeAwardee[] }) {
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [showAllAwardees, setShowAllAwardees] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const visiblePrograms = showAllPrograms ? programs : programs.slice(0, HOMEPAGE_DIRECTORY_LIMIT);
  const visibleAwardees = showAllAwardees ? awardees : awardees.slice(0, HOMEPAGE_DIRECTORY_LIMIT);

  return (
    <>
      <section className={`${homeStyles.programSection} etos-program-section etos-program-section-v3`} id="program">
        <div className={`${homeStyles.sectionHeadWide} etos-program-head-v3`} data-etos-reveal="soft">
          <div>
            <div className={homeStyles.sectionLabel}><span />Program Etos ID Palu</div>
            <h2>Program yang membentuk cara berpikir, karakter, dan keberanian untuk memberi dampak.</h2>
          </div>
          <p>Setiap program dirancang sebagai bagian dari satu perjalanan pembinaan: ringkas dalam tampilan, kuat dalam pengalaman, dan terhubung dengan kebutuhan awardee.</p>
        </div>

        <div className={`${homeStyles.programGrid} etos-home-program-grid etos-program-grid-v3`} data-etos-stagger="program-grid">
          {visiblePrograms.map((program, index) => {
            const category = cleanText(program.category || 'Program Pembinaan');
            const summary = compactText(program.summary || program.description || '');
            return (
              <button
                className={`${homeStyles.programCard} ${styles.cardButton} etos-home-program-card etos-program-editorial-card`}
                type="button"
                onClick={() => setDrawer({ kind: 'program', item: program })}
                key={program.id}
                data-etos-reveal="media"
              >
                <div className={`${homeStyles.programImage} etos-home-program-image etos-program-editorial-media`}>
                  {program.preview ? <img src={program.preview} alt={program.name} loading="lazy" decoding="async" fetchPriority="low" /> : null}
                  <div className="etos-program-media-wash" />
                  <div className={`${homeStyles.programIndex} etos-program-index-v3`}>{String(index + 1).padStart(2, '0')}</div>
                </div>
                <div className="etos-program-editorial-body">
                  <div className="etos-program-editorial-meta">{category || 'Program Pembinaan'}</div>
                  <h3>{cleanText(program.name)}</h3>
                  {summary ? <p>{summary}</p> : null}
                  <span className="etos-program-editorial-link">Lihat program <b>↗</b></span>
                </div>
              </button>
            );
          })}
        </div>

        {programs.length > HOMEPAGE_DIRECTORY_LIMIT ? (
          <div className={homeStyles.sectionFootNote} data-etos-reveal="soft">
            <button className={`${styles.textAction} etos-directory-toggle`} type="button" onClick={() => setShowAllPrograms((value) => !value)}>
              {showAllPrograms ? 'Tampilkan lebih ringkas ↑' : `Lihat seluruh ${programs.length} program aktif →`}
            </button>
          </div>
        ) : null}
      </section>

      <StoryBridge programs={programs} awardees={awardees} />

      <section className={`${homeStyles.awardeeSection} etos-awardee-section`} id="awardee">
        <div className={homeStyles.awardeeHead} data-etos-reveal="soft">
          <div>
            <div className={homeStyles.sectionLabel}><span />Awardee Etos ID Palu</div>
            <h2>Orang-orang yang bertumbuh dan membawa gagasan menjadi dampak.</h2>
          </div>
          {awardees.length > HOMEPAGE_DIRECTORY_LIMIT ? (
            <button className={`${homeStyles.darkPill} ${styles.sectionAction} etos-directory-toggle`} type="button" onClick={() => setShowAllAwardees((value) => !value)}>
              {showAllAwardees ? 'Tampilkan Ringkas' : 'Lihat Semua Awardee'}
            </button>
          ) : null}
        </div>
        <div className={`${homeStyles.awardeeGrid} etos-home-awardee-grid`} data-etos-stagger="awardee-grid">
          {visibleAwardees.map((awardee) => {
            const detailLine = [awardee.studyProgram, awardee.university]
              .map((value) => cleanText(value || ''))
              .filter(Boolean)
              .join(' • ');
            return (
              <button className={`${homeStyles.awardeeCard} ${styles.cardButton} etos-home-awardee-card`} type="button" onClick={() => setDrawer({ kind: 'awardee', item: awardee })} key={awardee.id} data-etos-reveal="media">
                <div className={`${homeStyles.imageWrap} etos-home-awardee-image`}>
                  {awardee.photo ? <img src={awardee.photo} alt={cleanText(awardee.name)} style={{ objectPosition: awardee.photoPosition }} loading="lazy" decoding="async" fetchPriority="low" /> : null}
                </div>
                <div className={homeStyles.cardBody}>
                  <small>{awardee.cohort ? `Angkatan ${cleanText(awardee.cohort)}` : 'Awardee Etos ID'}</small>
                  <h3>{cleanText(awardee.name)}</h3>
                  {detailLine ? <p>{detailLine}</p> : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <DetailDrawer state={drawer} onClose={() => setDrawer(null)} />
    </>
  );
}
