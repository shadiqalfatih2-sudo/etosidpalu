'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './AdminSuperControls.module.css';

const TOKEN_KEY = 'etos_admin_session_token';
type Group = 'Berita' | 'Artikel' | 'Program' | 'ProgramFoto' | 'Awardee' | 'Hero';
type Row = Record<string, any>;

type DataState = Record<Group, Row[]>;
const EMPTY: DataState = { Berita: [], Artikel: [], Program: [], ProgramFoto: [], Awardee: [], Hero: [] };
const GROUPS: Group[] = ['Berita', 'Artikel', 'Program', 'ProgramFoto', 'Awardee', 'Hero'];

async function parseResponse(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request gagal.');
  return typeof body.result === 'string' ? JSON.parse(body.result) : body.result;
}

async function rpc(fn: string, args: unknown[], token: string) {
  const response = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Etos-Admin-Token': token },
    body: JSON.stringify({ fn, args }),
    cache: 'no-store',
  });
  return parseResponse(response);
}

function title(group: Group, row: Row) {
  if (group === 'ProgramFoto') return row.caption || row.programName || row.id || 'Foto Program';
  if (group === 'Awardee' || group === 'Program') return row.nama || row.id || 'Tanpa nama';
  if (group === 'Hero') return row.judul || row.subjudul || row.id || 'Hero Slide';
  return row.judul || row.id || 'Tanpa judul';
}

function meta(group: Group, row: Row) {
  if (group === 'ProgramFoto') return [row.programName, row.id].filter(Boolean).join(' • ');
  if (group === 'Awardee') return [row.prodi, row.universitas, row.id].filter(Boolean).join(' • ');
  if (group === 'Program') return [row.kategori, row.id].filter(Boolean).join(' • ');
  if (group === 'Artikel') return [row.penulis, row.status, row.id].filter(Boolean).join(' • ');
  return [row.status, row.id].filter(Boolean).join(' • ');
}

function deleteMethod(group: Group) {
  if (group === 'Berita') return 'saveBeritaAdmin';
  if (group === 'Artikel') return 'saveArtikelReview';
  if (group === 'Program') return 'saveProgramAdmin';
  if (group === 'ProgramFoto') return 'saveProgramPhotoAdmin';
  if (group === 'Awardee') return 'saveAwardeeAdmin';
  return 'saveHeroAdmin';
}

export function AdminSuperControls() {
  const [token, setToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<Group>('Awardee');
  const [data, setData] = useState<DataState>(EMPTY);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem(TOKEN_KEY) || '');
    syncToken();
    const timer = window.setInterval(syncToken, 1200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setEnabled(false);
      setOpen(false);
      return;
    }
    void rpc('getAdminData', ['Context'], token)
      .then((context) => {
        if (!cancelled) setEnabled(String(context?.role || '').toLowerCase() === 'superadmin');
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  async function load() {
    if (!token) return;
    setLoading(true);
    setFeedback(null);
    try {
      const [berita, artikel, program, programMedia, awardee, hero] = await Promise.all([
        rpc('getAdminData', ['Berita'], token),
        rpc('getAdminData', ['Artikel'], token),
        rpc('getAdminData', ['Program'], token),
        rpc('getAdminProgramPhotos', [], token),
        rpc('getAdminData', ['Awardee'], token),
        rpc('getAdminData', ['Hero'], token),
      ]);
      setData({
        Berita: berita || [],
        Artikel: artikel || [],
        Program: program || [],
        ProgramFoto: programMedia?.photos || [],
        Awardee: awardee || [],
        Hero: hero || [],
      });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Data SuperAdmin gagal dimuat.' });
    } finally {
      setLoading(false);
    }
  }

  async function openPanel() {
    setOpen(true);
    await load();
  }

  async function remove(row: Row) {
    if (!row.id || !token) return;
    if (!window.confirm(`Hapus permanen “${title(group, row)}” dari data website?`)) return;
    setLoading(true);
    setFeedback(null);
    try {
      const result = await rpc(deleteMethod(group), [{ id: row.id, _delete: true }], token);
      if (result?.status !== 'success') throw new Error(result?.message || 'Data gagal dihapus.');
      setFeedback({ type: 'success', message: result.message || 'Data berhasil dihapus.' });
      await load();
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Data gagal dihapus.' });
      setLoading(false);
    }
  }

  async function updateAwardee(row: Row, patch: Row, actionLabel: string) {
    if (!row.id || !token) return;
    if (!window.confirm(`${actionLabel} untuk ${row.nama || row.id}?`)) return;
    setLoading(true);
    setFeedback(null);
    try {
      const payload = { ...row, ...patch };
      const result = await rpc('saveAwardeeAdmin', [payload], token);
      if (result?.status !== 'success') throw new Error(result?.message || 'Profil awardee gagal diperbarui.');
      setFeedback({ type: 'success', message: `${actionLabel} berhasil.` });
      await load();
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Profil awardee gagal diperbarui.' });
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data[group];
    return data[group].filter((row) => `${title(group, row)} ${meta(group, row)}`.toLowerCase().includes(q));
  }, [data, group, search]);

  if (!enabled) return null;

  return (
    <>
      <button className={styles.launcher} type="button" onClick={() => void openPanel()}>SuperAdmin Control</button>
      {open ? (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
          <section className={styles.panel} role="dialog" aria-modal="true" aria-label="SuperAdmin Control">
            <div className={styles.head}>
              <div>
                <small>SUPERADMIN • FULL CONTENT CONTROL</small>
                <h2>Kontrol data website</h2>
                <p>Delete permanen dan tindakan sensitif dipisahkan dari editor utama agar tidak mudah terklik tanpa sengaja.</p>
              </div>
              <button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="Tutup">×</button>
            </div>

            <div className={styles.tabs}>
              {GROUPS.map((item) => <button key={item} className={group === item ? styles.active : ''} type="button" onClick={() => { setGroup(item); setSearch(''); }}>{item === 'ProgramFoto' ? 'Foto Program' : item === 'Artikel' ? 'Opini' : item}</button>)}
            </div>
            <input className={styles.search} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Cari ${group === 'ProgramFoto' ? 'foto program' : group.toLowerCase()}...`} />

            {feedback ? <div className={`${styles.feedback} ${feedback.type === 'success' ? styles.success : styles.error}`}>{feedback.message}</div> : null}

            <div className={styles.list}>
              {loading && !rows.length ? <div className={styles.empty}>Memuat data…</div> : null}
              {!loading && !rows.length ? <div className={styles.empty}>Tidak ada data.</div> : null}
              {rows.map((row) => (
                <article className={styles.row} key={row.id}>
                  <div className={styles.copy}><strong>{title(group, row)}</strong><span>{meta(group, row)}</span></div>
                  <div className={styles.actions}>
                    {group === 'Awardee' && row.foto ? <button className={styles.secondary} type="button" disabled={loading} onClick={() => void updateAwardee(row, { foto: '', fotoRaw: '' }, 'Lepas foto profil')}>Lepas Foto</button> : null}
                    {group === 'Awardee' && row.portofolio ? <button className={styles.secondary} type="button" disabled={loading} onClick={() => void updateAwardee(row, { portofolio: '' }, 'Lepas portofolio')}>Lepas Porto</button> : null}
                    <button type="button" disabled={loading} onClick={() => void remove(row)}>Hapus</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
