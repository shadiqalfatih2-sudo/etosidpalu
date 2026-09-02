'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './NativeForms.module.css';

const TOKEN_KEY = 'etos_admin_session_token';
const MEDIA_BASE = 'https://rcenvyrtswcmllpheszn.supabase.co/storage/v1/object/public/etos-media/';

type Tab = 'Overview' | 'Berita' | 'Artikel' | 'Program' | 'ProgramFoto' | 'Awardee' | 'Hero' | 'Media';
type AnyRow = Record<string, any>;
type Feedback = { type: 'success' | 'error'; message: string } | null;
type AdminData = {
  Berita: AnyRow[];
  Artikel: AnyRow[];
  Program: AnyRow[];
  Awardee: AnyRow[];
  Hero: AnyRow[];
  ProgramFoto: { status?: string; programs: AnyRow[]; photos: AnyRow[] };
  Media: AnyRow[];
};

const NAV_ITEMS: Array<{ id: Tab; label: string; short: string }> = [
  { id: 'Overview', label: 'Ringkasan', short: 'OV' },
  { id: 'Berita', label: 'Berita', short: 'BR' },
  { id: 'Artikel', label: 'Review Opini', short: 'OP' },
  { id: 'Program', label: 'Program', short: 'PR' },
  { id: 'ProgramFoto', label: 'Foto Program', short: 'FP' },
  { id: 'Awardee', label: 'Awardee', short: 'AW' },
  { id: 'Hero', label: 'Hero Slider', short: 'HS' },
  { id: 'Media', label: 'Media Library', short: 'ML' },
];

const EMPTY_DATA: AdminData = {
  Berita: [], Artikel: [], Program: [], Awardee: [], Hero: [],
  ProgramFoto: { programs: [], photos: [] }, Media: [],
};

async function parseResponse(response: Response) {
  const body = await response.json();
  if (!response.ok) throw Object.assign(new Error(body.error || 'Request gagal.'), { status: response.status });
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

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gambar gagal dibaca.'));
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file: File, token: string) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 10 MB.');
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Etos-Admin-Token': token },
    body: JSON.stringify({ dataUrl: await fileToDataUrl(file), fileName: file.name }),
  });
  const result = await parseResponse(response);
  if (result.status !== 'success' || !result.url) throw new Error(result.message || 'Upload gagal.');
  return String(result.url);
}

function newRow(tab: Tab): AnyRow {
  if (tab === 'Berita') return { id: '', judul: '', isi: '', thumbnail: '', thumbnailPosition: '50% 50%', status: 'Published' };
  if (tab === 'Artikel') return { id: '', penulis: '', aktivitas: '', judul: '', isi: '', thumbnail: '', thumbnailPosition: '50% 50%', status: 'Pending' };
  if (tab === 'Program') return { id: '', nama: '', kategori: 'Program Pembinaan Wilayah', ringkasan: '', deskripsi: '', preview: '', icon: 'ph-sparkle', urutan: 1, status: 'Aktif' };
  if (tab === 'Awardee') return { id: '', nama: '', statusAwardee: 'Aktif', angkatan: '', prodi: '', universitas: 'Universitas Tadulako', profil: '', foto: '', fotoPosition: '50% 50%', portofolio: '', urutan: 1, statusTampil: 'Aktif' };
  if (tab === 'Hero') return { id: '', foto: '', judul: '', subjudul: '', posisi: '50% 50%', urutan: 1, tautan: '', status: 'Aktif' };
  if (tab === 'ProgramFoto') return { id: '', programId: '', foto: '', caption: '', urutan: 1, status: 'Aktif', posisi: '50% 50%', setAsPreview: false };
  return {};
}

function mediaUrl(path: string) {
  return MEDIA_BASE + String(path || '').split('/').map(encodeURIComponent).join('/');
}

function formatBytes(value: unknown) {
  const bytes = Number(value || 0);
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function rowImage(tab: Tab, row: AnyRow) {
  if (tab === 'Berita' || tab === 'Artikel') return row.thumb || row.thumbnail || '';
  if (tab === 'Program') return row.preview || '';
  if (tab === 'Awardee' || tab === 'Hero' || tab === 'ProgramFoto') return row.foto || row.fotoRaw || '';
  if (tab === 'Media') return mediaUrl(row.path || '');
  return '';
}

function rowStatus(tab: Tab, row: AnyRow) {
  if (tab === 'Awardee') return row.statusTampil || row.statusAwardee || 'Aktif';
  if (tab === 'ProgramFoto') return row.status || 'Aktif';
  if (tab === 'Media') return row.mimetype || 'Media';
  return row.status || (tab === 'Berita' ? 'Published' : 'Aktif');
}

function rowTitle(tab: Tab, row: AnyRow) {
  if (tab === 'Media') return String(row.path || '').split('/').pop() || 'Media';
  return row.judul || row.nama || row.caption || row.programName || row.id || 'Tanpa judul';
}

function rowMeta(tab: Tab, row: AnyRow) {
  if (tab === 'Artikel') return [row.id, row.penulis].filter(Boolean).join(' • ');
  if (tab === 'ProgramFoto') return [row.programName, row.id].filter(Boolean).join(' • ');
  if (tab === 'Awardee') return [row.prodi, row.universitas].filter(Boolean).join(' • ');
  if (tab === 'Program') return [row.id, row.kategori].filter(Boolean).join(' • ');
  if (tab === 'Hero') return [row.id, `Urutan ${row.urutan || 1}`].filter(Boolean).join(' • ');
  if (tab === 'Media') return `${formatBytes(row.size)} • ${row.createdAt || ''}`;
  return [row.id, row.tgl].filter(Boolean).join(' • ');
}

function previewHref(tab: Tab, row: AnyRow) {
  if (tab === 'Berita' && row.slug) return `/berita/${encodeURIComponent(row.slug)}`;
  if (tab === 'Artikel' && row.slug && String(row.status).toLowerCase() === 'approved') return `/opini/${encodeURIComponent(row.slug)}`;
  if (tab === 'Program' && row.id) return `/program/${encodeURIComponent(row.id)}`;
  if (tab === 'ProgramFoto' && row.programId) return `/program/${encodeURIComponent(row.programId)}`;
  if (tab === 'Awardee' && row.id) return `/awardee/${encodeURIComponent(row.id)}`;
  if (tab === 'Hero') return '/';
  if (tab === 'Media' && row.path) return mediaUrl(row.path);
  return '';
}

function normalizeRow(tab: Tab, row: AnyRow) {
  if (tab === 'Berita') return { ...row, thumbnail: row.thumb || row.thumbnail || '', thumbnailPosition: row.thumbPosition || row.thumbnailPosition || '50% 50%', status: row.status || 'Published' };
  if (tab === 'Artikel') return { ...row, thumbnail: row.thumb || row.thumbnail || '', thumbnailPosition: row.thumbPosition || row.thumbnailPosition || '50% 50%' };
  if (tab === 'Program') return { ...row, preview: row.previewRaw || row.preview || '', status: row.status || 'Aktif' };
  if (tab === 'Awardee') return { ...row, foto: row.fotoRaw || row.foto || '', fotoPosition: row.fotoPosition || '50% 50%' };
  if (tab === 'Hero') return { ...row, foto: row.fotoRaw || row.foto || '', posisi: row.posisi || '50% 50%', status: row.status || 'Aktif' };
  if (tab === 'ProgramFoto') return { ...row, programId: row.programId || '', foto: row.fotoRaw || row.foto || '', posisi: row.posisi || '50% 50%', setAsPreview: false };
  return { ...row };
}

export function NativeAdminDashboard() {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');
  const [data, setData] = useState<AdminData>(EMPTY_DATA);
  const [selected, setSelected] = useState<AnyRow>({});
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [lastSync, setLastSync] = useState('');

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setRole('');
    setData(EMPTY_DATA);
  }, []);

  const loadAll = useCallback(async (sessionToken: string, silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setFeedback(null);
    try {
      const [berita, artikel, awardee, program, hero, programMedia, media] = await Promise.all([
        rpc('getAdminData', ['Berita'], sessionToken),
        rpc('getAdminData', ['Artikel'], sessionToken),
        rpc('getAdminData', ['Awardee'], sessionToken),
        rpc('getAdminData', ['Program'], sessionToken),
        rpc('getAdminData', ['Hero'], sessionToken),
        rpc('getAdminProgramPhotos', [], sessionToken),
        rpc('getAdminData', ['Media'], sessionToken),
      ]);
      setData({
        Berita: berita || [], Artikel: artikel || [], Awardee: awardee || [], Program: program || [], Hero: hero || [],
        ProgramFoto: programMedia || { programs: [], photos: [] }, Media: media || [],
      });
      setLastSync(new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()));
    } catch (error) {
      if (Number((error as any)?.status) === 401 || /sesi admin/i.test(String((error as Error)?.message))) clearSession();
      else if (!silent) setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Data admin gagal dimuat.' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY) || '';
    if (saved) {
      setToken(saved);
      void loadAll(saved);
    }
  }, [loadAll]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(() => void loadAll(token, true), 30000);
    const onFocus = () => void loadAll(token, true);
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadAll, token]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    setFeedback(null);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args: [String(form.get('username') || ''), String(form.get('password') || '')] }),
      });
      const result = await parseResponse(response);
      if (result.status !== 'success' || !result.token) throw new Error(result.message || 'Login gagal.');
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setRole(result.role || 'Admin');
      await loadAll(result.token);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Login gagal.' });
    } finally {
      setLoginLoading(false);
    }
  }

  async function logout() {
    try {
      if (token) await fetch('/api/admin/logout', { method: 'POST', headers: { 'X-Etos-Admin-Token': token } });
    } finally {
      clearSession();
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    setSelected(next === 'Overview' || next === 'Media' ? {} : newRow(next));
    setFile(null);
    setFeedback(null);
    setSearch('');
    setStatusFilter('Semua');
  }

  function selectRowFor(targetTab: Tab, row: AnyRow) {
    setTab(targetTab);
    setSelected(normalizeRow(targetTab, row));
    setFile(null);
    setFeedback(null);
  }

  const rawList: AnyRow[] = useMemo(() => {
    if (tab === 'ProgramFoto') return data.ProgramFoto?.photos || [];
    if (tab === 'Overview') return [];
    return (data as any)[tab] || [];
  }, [data, tab]);

  const statuses = useMemo(() => {
    if (tab === 'Overview' || tab === 'Media') return [];
    return Array.from(new Set(rawList.map((row) => String(rowStatus(tab, row) || '')).filter(Boolean)));
  }, [rawList, tab]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rawList.filter((row) => {
      const haystack = [rowTitle(tab, row), rowMeta(tab, row), rowStatus(tab, row), row.id, row.slug].join(' ').toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus = statusFilter === 'Semua' || String(rowStatus(tab, row)).toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [rawList, search, statusFilter, tab]);

  const stats = useMemo(() => {
    const pending = data.Artikel.filter((x) => String(x.status).toLowerCase() === 'pending').length;
    const approved = data.Artikel.filter((x) => String(x.status).toLowerCase() === 'approved').length;
    const publishedNews = data.Berita.filter((x) => String(x.status || 'Published').toLowerCase() === 'published').length;
    const draftNews = data.Berita.length - publishedNews;
    const activePrograms = data.Program.filter((x) => String(x.status || 'Aktif').toLowerCase() === 'aktif').length;
    const activeAwardees = data.Awardee.filter((x) => String(x.statusTampil || 'Aktif').toLowerCase() === 'aktif').length;
    const activeHero = data.Hero.filter((x) => String(x.status || 'Aktif').toLowerCase() === 'aktif').length;
    const incompleteAwardees = data.Awardee.filter((x) => !String(x.angkatan || '').trim() || !String(x.profil || '').trim() || !String(x.prodi || '').trim()).length;
    const inactivePhotos = (data.ProgramFoto?.photos || []).filter((x) => String(x.status || '').toLowerCase() !== 'aktif').length;
    return { pending, approved, publishedNews, draftNews, activePrograms, activeAwardees, activeHero, incompleteAwardees, inactivePhotos };
  }, [data]);

  async function save() {
    if (!token || tab === 'Overview' || tab === 'Media') return;
    setLoading(true);
    setFeedback(null);
    try {
      const payload = { ...selected };
      if (file) {
        const url = await uploadImage(file, token);
        if (tab === 'Berita' || tab === 'Artikel') payload.thumbnail = url;
        else if (tab === 'Program') payload.preview = url;
        else payload.foto = url;
      }

      let result: AnyRow;
      if (tab === 'Berita') result = await rpc('saveBeritaAdmin', [payload], token);
      else if (tab === 'Artikel') {
        if (!payload.id) throw new Error('Tulisan baru dikirim melalui menu Kirim Tulisan. Admin hanya mereview tulisan yang sudah masuk.');
        result = await rpc('saveArtikelReview', [payload], token);
      } else if (tab === 'Program') result = await rpc('saveProgramAdmin', [payload], token);
      else if (tab === 'Awardee') result = await rpc('saveAwardeeAdmin', [payload], token);
      else if (tab === 'Hero') result = await rpc('saveHeroAdmin', [payload], token);
      else result = await rpc('saveProgramPhotoAdmin', [payload], token);

      if (result?.status !== 'success') throw new Error(result?.message || 'Perubahan gagal disimpan.');
      setFeedback({ type: 'success', message: result.message || 'Perubahan berhasil disimpan.' });
      setFile(null);
      await loadAll(token, true);
      if (!selected.id) setSelected(newRow(tab));
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Perubahan gagal disimpan.' });
    } finally {
      setLoading(false);
    }
  }

  async function copyMedia(row: AnyRow) {
    try {
      await navigator.clipboard.writeText(mediaUrl(row.path || ''));
      setFeedback({ type: 'success', message: 'URL media disalin ke clipboard.' });
    } catch {
      setFeedback({ type: 'error', message: 'Browser tidak mengizinkan akses clipboard.' });
    }
  }

  if (!token) {
    return (
      <main className={styles.page}>
        <section className={styles.adminShell}>
          <Link className={styles.back} href="/">← Kembali ke Portal</Link>
          <div className={styles.loginWrap}>
            <div className={styles.loginIntro}>
              <div className={styles.eyebrow}>ADMIN ETOS ID PALU</div>
              <h1>Ruang kerja editorial dan pengelolaan ekosistem ETOS.</h1>
              <p>Konten, awardee, program, hero, dan media dikelola melalui satu dashboard. Session tetap diverifikasi di Supabase melalui gateway server.</p>
            </div>
            <div className={styles.loginCard}>
              <div className={styles.loginBadge}>SECURE ADMIN</div>
              <h2>Masuk Dashboard</h2>
              <form className={styles.loginForm} onSubmit={login}>
                <label>Username<input name="username" autoComplete="username" required /></label>
                <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
                {feedback ? <div className={`${styles.feedback} ${styles.error}`}>{feedback.message}</div> : null}
                <button className={styles.loginButton} disabled={loginLoading}>{loginLoading ? 'Memverifikasi…' : 'Masuk Dashboard →'}</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const canCreate = !['Overview', 'Artikel', 'Media'].includes(tab);
  const currentLabel = NAV_ITEMS.find((item) => item.id === tab)?.label || tab;

  return (
    <main className={`${styles.page} ${styles.adminPage}`}>
      <div className={styles.adminWorkspace}>
        <aside className={styles.adminSidebar}>
          <Link href="/" className={styles.adminBrand}>
            <span className={styles.adminBrandMark}>E</span>
            <span><strong>ETOS ID</strong><small>PALU • ADMIN</small></span>
          </Link>
          <nav className={styles.adminNav} aria-label="Modul admin">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} className={tab === item.id ? styles.adminNavActive : ''} onClick={() => changeTab(item.id)}>
                <span className={styles.navIcon}>{item.short}</span><span>{item.label}</span>
                {item.id === 'Artikel' && stats.pending > 0 ? <b>{stats.pending}</b> : null}
              </button>
            ))}
          </nav>
          <div className={styles.sidebarFoot}>
            <div><span>Session</span><strong>{role || 'Admin'}</strong></div>
            <div><span>Sinkron terakhir</span><strong>{lastSync || '—'}</strong></div>
            <button onClick={logout}>Keluar dari Dashboard</button>
          </div>
        </aside>

        <section className={styles.adminMain}>
          <div className={styles.commandBar}>
            <div>
              <div className={styles.eyebrow}>ADMIN WORKSPACE • {role || 'ADMIN'}</div>
              <h1>{currentLabel}</h1>
            </div>
            <div className={styles.commandActions}>
              <button className={styles.iconButton} onClick={() => void loadAll(token)} disabled={loading}>{loading ? 'Sinkron…' : '↻ Sinkronkan'}</button>
              <Link className={styles.portalButton} href="/" target="_blank">Lihat Portal ↗</Link>
            </div>
          </div>

          {feedback ? <div className={`${styles.feedback} ${feedback.type === 'success' ? styles.success : styles.error}`}>{feedback.message}</div> : null}
          {loading ? <div className={styles.progressLine}><span /></div> : null}

          {tab === 'Overview' ? (
            <Overview data={data} stats={stats} onOpen={selectRowFor} onNavigate={changeTab} />
          ) : (
            <>
              <div className={styles.moduleHeader}>
                <div>
                  <span>{rawList.length} item tersimpan</span>
                  <p>{moduleDescription(tab)}</p>
                </div>
                <div className={styles.moduleHeaderActions}>
                  {canCreate ? <button className={styles.primaryAction} onClick={() => { setSelected(newRow(tab)); setFile(null); setFeedback(null); }}>+ Tambah Baru</button> : null}
                </div>
              </div>

              <div className={styles.filterBar}>
                <div className={styles.searchBox}><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Cari ${currentLabel.toLowerCase()}...`} /></div>
                {statuses.length ? <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>Semua</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select> : null}
                <span className={styles.resultCount}>{list.length} hasil</span>
              </div>

              {tab === 'Media' ? (
                <MediaLibrary rows={list} onCopy={copyMedia} />
              ) : (
                <div className={styles.adminGrid}>
                  <div className={styles.listPanel}>
                    {list.length ? list.map((row) => {
                      const image = rowImage(tab, row);
                      const active = selected?.id && selected.id === row.id;
                      return (
                        <button type="button" className={`${styles.listItem} ${active ? styles.listItemActive : ''}`} key={row.id || `${rowTitle(tab, row)}-${rowMeta(tab, row)}`} onClick={() => selectRowFor(tab, row)}>
                          {image ? <span className={styles.listThumb}><img src={image} alt="" /></span> : <span className={styles.listThumbPlaceholder}>{String(rowTitle(tab, row)).slice(0, 1).toUpperCase()}</span>}
                          <span className={styles.listCopy}>
                            <small><i className={styles.statusDot} />{rowStatus(tab, row)}</small>
                            <strong>{rowTitle(tab, row)}</strong>
                            <em>{rowMeta(tab, row)}</em>
                          </span>
                        </button>
                      );
                    }) : <div className={styles.empty}>Tidak ada data yang cocok dengan filter.</div>}
                  </div>
                  <Editor tab={tab} value={selected} setValue={setSelected} programs={data.ProgramFoto?.programs || []} setFile={setFile} save={save} loading={loading} />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function moduleDescription(tab: Tab) {
  if (tab === 'Berita') return 'Tulis berita, simpan sebagai draft, lalu terbitkan ketika konten sudah siap.';
  if (tab === 'Artikel') return 'Review tulisan masuk, perbaiki isi bila perlu, lalu Approved atau Rejected.';
  if (tab === 'Program') return 'Kelola profil program, kategori, urutan, preview, dan status tampil.';
  if (tab === 'ProgramFoto') return 'Kelola galeri dokumentasi program dan tentukan gambar preview utama.';
  if (tab === 'Awardee') return 'Kelola profil awardee, status, urutan tampil, foto, dan portofolio.';
  if (tab === 'Hero') return 'Kelola slide utama homepage, urutan, posisi foto, tautan, dan status.';
  if (tab === 'Media') return 'Seluruh aset gambar yang tersimpan di Supabase Storage etos-media.';
  return '';
}

function Overview({ data, stats, onOpen, onNavigate }: { data: AdminData; stats: AnyRow; onOpen: (tab: Tab, row: AnyRow) => void; onNavigate: (tab: Tab) => void }) {
  const pendingRows = data.Artikel.filter((x) => String(x.status).toLowerCase() === 'pending').slice(0, 5);
  const recentNews = data.Berita.slice(0, 4);
  const healthItems = [
    { label: 'Awardee perlu dilengkapi', value: stats.incompleteAwardees, target: 'Awardee' as Tab },
    { label: 'Berita masih draft', value: stats.draftNews, target: 'Berita' as Tab },
    { label: 'Foto program nonaktif', value: stats.inactivePhotos, target: 'ProgramFoto' as Tab },
    { label: 'Hero aktif', value: stats.activeHero, target: 'Hero' as Tab },
  ];
  return (
    <div className={styles.overview}>
      <div className={styles.overviewHero}>
        <div><span className={styles.eyebrow}>LIVE CONTENT OPERATIONS</span><h2>Semua yang publik lihat, dikelola dari sini.</h2><p>Data dashboard terhubung ke Supabase dan tersinkron otomatis setiap 30 detik.</p></div>
        <div className={styles.overviewPulse}><span /><strong>System online</strong><small>Database + Storage + Gateway</small></div>
      </div>

      <div className={styles.statGrid}>
        <button onClick={() => onNavigate('Artikel')}><span>Menunggu review</span><strong>{stats.pending}</strong><small>Opini pending</small></button>
        <button onClick={() => onNavigate('Berita')}><span>Publikasi aktif</span><strong>{stats.publishedNews + stats.approved}</strong><small>Berita + opini</small></button>
        <button onClick={() => onNavigate('Program')}><span>Program aktif</span><strong>{stats.activePrograms}</strong><small>dari {data.Program.length} program</small></button>
        <button onClick={() => onNavigate('Awardee')}><span>Awardee tampil</span><strong>{stats.activeAwardees}</strong><small>profil publik</small></button>
        <button onClick={() => onNavigate('Media')}><span>Media Storage</span><strong>{data.Media.length}</strong><small>aset gambar</small></button>
      </div>

      <div className={styles.overviewGrid}>
        <section className={styles.overviewPanel}>
          <div className={styles.panelHead}><div><span>Editorial Queue</span><h3>Tulisan menunggu keputusan</h3></div><button onClick={() => onNavigate('Artikel')}>Buka semua →</button></div>
          {pendingRows.length ? <div className={styles.queueList}>{pendingRows.map((row) => <button key={row.id} onClick={() => onOpen('Artikel', row)}><span><small>{row.penulis || 'Penulis'}</small><strong>{row.judul}</strong><em>{row.tgl || row.id}</em></span><b>Review →</b></button>)}</div> : <div className={styles.emptyState}>Tidak ada tulisan yang menunggu review. Editorial queue bersih.</div>}
        </section>

        <section className={styles.overviewPanel}>
          <div className={styles.panelHead}><div><span>Data Health</span><h3>Kualitas data konten</h3></div></div>
          <div className={styles.healthList}>{healthItems.map((item) => <button key={item.label} onClick={() => onNavigate(item.target)}><span>{item.label}</span><strong>{item.value}</strong></button>)}</div>
        </section>
      </div>

      <section className={styles.overviewPanel}>
        <div className={styles.panelHead}><div><span>Berita Terbaru</span><h3>Aktivitas publikasi</h3></div><button onClick={() => onNavigate('Berita')}>Kelola berita →</button></div>
        <div className={styles.recentGrid}>{recentNews.map((row) => <button key={row.id} onClick={() => onOpen('Berita', row)}>{row.thumb ? <img src={row.thumb} alt="" /> : null}<span><small>{row.status || 'Published'} • {row.tgl}</small><strong>{row.judul}</strong></span></button>)}</div>
      </section>
    </div>
  );
}

function MediaLibrary({ rows, onCopy }: { rows: AnyRow[]; onCopy: (row: AnyRow) => void }) {
  return (
    <div className={styles.mediaGrid}>
      {rows.length ? rows.map((row) => {
        const url = mediaUrl(row.path || '');
        return <article className={styles.mediaCard} key={row.id || row.path}>
          <a href={url} target="_blank" rel="noreferrer" className={styles.mediaImage}><img src={url} alt="" /></a>
          <div className={styles.mediaBody}><small>{row.mimetype || 'image'} • {formatBytes(row.size)}</small><strong title={row.path}>{String(row.path || '').split('/').pop()}</strong><span>{row.createdAt || ''}</span><div><button onClick={() => onCopy(row)}>Salin URL</button><a href={url} target="_blank" rel="noreferrer">Buka ↗</a></div></div>
        </article>;
      }) : <div className={styles.empty}>Media tidak ditemukan.</div>}
    </div>
  );
}

function Editor({ tab, value, setValue, programs, setFile, save, loading }: { tab: Tab; value: AnyRow; setValue: (row: AnyRow) => void; programs: AnyRow[]; setFile: (file: File | null) => void; save: () => void; loading: boolean }) {
  const update = (key: string, val: any) => setValue({ ...value, [key]: val });
  const image = rowImage(tab, value);
  const preview = previewHref(tab, value);
  const isNew = !value.id;

  return (
    <div className={styles.editor}>
      <div className={styles.editorHead}>
        <div><span>{isNew ? 'CREATE' : 'EDIT'} • {tab === 'ProgramFoto' ? 'FOTO PROGRAM' : tab.toUpperCase()}</span><h2>{isNew ? 'Data Baru' : rowTitle(tab, value)}</h2></div>
        {preview ? <a href={preview} target="_blank" rel="noreferrer">Preview ↗</a> : null}
      </div>

      {image ? <div className={styles.editorPreview}><img src={image} alt="Preview" style={{ objectPosition: value.thumbnailPosition || value.fotoPosition || value.posisi || '50% 50%' }} /><span>Preview media saat ini</span></div> : null}

      <div className={styles.editorGrid}>
        {tab === 'Berita' ? <>
          <label className={styles.full}>Judul<input value={value.judul || ''} onChange={(e) => update('judul', e.target.value)} placeholder="Judul berita" /></label>
          <label>Status<select value={value.status || 'Published'} onChange={(e) => update('status', e.target.value)}><option>Published</option><option>Draft</option></select></label>
          <label>Posisi Thumbnail<input value={value.thumbnailPosition || '50% 50%'} onChange={(e) => update('thumbnailPosition', e.target.value)} /></label>
          <label className={styles.full}>Isi Berita (HTML)<textarea rows={15} value={value.isi || ''} onChange={(e) => update('isi', e.target.value)} /></label>
          <label className={styles.full}>URL Thumbnail<input value={value.thumbnail || ''} onChange={(e) => update('thumbnail', e.target.value)} /></label>
          <label className={styles.full}>Upload Thumbnail Baru<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        </> : null}

        {tab === 'Artikel' ? <>
          <label>Penulis<input value={value.penulis || ''} onChange={(e) => update('penulis', e.target.value)} /></label>
          <label>Aktivitas<input value={value.aktivitas || ''} onChange={(e) => update('aktivitas', e.target.value)} /></label>
          <label className={styles.full}>Judul<input value={value.judul || ''} onChange={(e) => update('judul', e.target.value)} /></label>
          <label>Status Review<select value={value.status || 'Pending'} onChange={(e) => update('status', e.target.value)}><option>Pending</option><option>Approved</option><option>Rejected</option></select></label>
          <label>Posisi Thumbnail<input value={value.thumbnailPosition || '50% 50%'} onChange={(e) => update('thumbnailPosition', e.target.value)} /></label>
          <label className={styles.full}>Isi Tulisan (HTML)<textarea rows={15} value={value.isi || ''} onChange={(e) => update('isi', e.target.value)} /></label>
          <label className={styles.full}>URL Thumbnail<input value={value.thumbnail || ''} onChange={(e) => update('thumbnail', e.target.value)} /></label>
          <label className={styles.full}>Ganti Thumbnail<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        </> : null}

        {tab === 'Program' ? <>
          <label className={styles.full}>Nama Program<input value={value.nama || ''} onChange={(e) => update('nama', e.target.value)} /></label>
          <label>Kategori<input value={value.kategori || ''} onChange={(e) => update('kategori', e.target.value)} /></label>
          <label>Status<select value={value.status || 'Aktif'} onChange={(e) => update('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select></label>
          <label className={styles.full}>Ringkasan<textarea rows={4} value={value.ringkasan || ''} onChange={(e) => update('ringkasan', e.target.value)} /></label>
          <label className={styles.full}>Deskripsi Program (HTML)<textarea rows={10} value={value.deskripsi || ''} onChange={(e) => update('deskripsi', e.target.value)} /></label>
          <label>Icon<input value={value.icon || 'ph-sparkle'} onChange={(e) => update('icon', e.target.value)} /></label>
          <label>Urutan<input type="number" min="1" value={value.urutan || 1} onChange={(e) => update('urutan', Number(e.target.value))} /></label>
          <label className={styles.full}>URL Preview<input value={value.preview || ''} onChange={(e) => update('preview', e.target.value)} /></label>
          <label className={styles.full}>Upload Preview Baru<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        </> : null}

        {tab === 'Awardee' ? <>
          <label className={styles.full}>Nama<input value={value.nama || ''} onChange={(e) => update('nama', e.target.value)} /></label>
          <label>Status Awardee<select value={value.statusAwardee || 'Aktif'} onChange={(e) => update('statusAwardee', e.target.value)}><option>Aktif</option><option>Alumni</option></select></label>
          <label>Status Tampil<select value={value.statusTampil || 'Aktif'} onChange={(e) => update('statusTampil', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select></label>
          <label>Angkatan<input value={value.angkatan || ''} onChange={(e) => update('angkatan', e.target.value)} /></label>
          <label>Program Studi<input value={value.prodi || ''} onChange={(e) => update('prodi', e.target.value)} /></label>
          <label className={styles.full}>Universitas<input value={value.universitas || ''} onChange={(e) => update('universitas', e.target.value)} /></label>
          <label className={styles.full}>Profil<textarea rows={8} value={value.profil || ''} onChange={(e) => update('profil', e.target.value)} /></label>
          <label>Posisi Foto<input value={value.fotoPosition || '50% 50%'} onChange={(e) => update('fotoPosition', e.target.value)} /></label>
          <label>Urutan<input type="number" min="1" value={value.urutan || 1} onChange={(e) => update('urutan', Number(e.target.value))} /></label>
          <label className={styles.full}>URL Foto<input value={value.foto || ''} onChange={(e) => update('foto', e.target.value)} /></label>
          <label className={styles.full}>Upload Foto Baru<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
          <label className={styles.full}>Portofolio / CV URL<input value={value.portofolio || ''} onChange={(e) => update('portofolio', e.target.value)} /></label>
        </> : null}

        {tab === 'Hero' ? <>
          <label className={styles.full}>Judul<input value={value.judul || ''} onChange={(e) => update('judul', e.target.value)} placeholder="Judul slide (opsional)" /></label>
          <label className={styles.full}>Subjudul<textarea rows={4} value={value.subjudul || ''} onChange={(e) => update('subjudul', e.target.value)} /></label>
          <label>Status<select value={value.status || 'Aktif'} onChange={(e) => update('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select></label>
          <label>Urutan<input type="number" min="1" value={value.urutan || 1} onChange={(e) => update('urutan', Number(e.target.value))} /></label>
          <label>Posisi Foto<input value={value.posisi || '50% 50%'} onChange={(e) => update('posisi', e.target.value)} /></label>
          <label>Tautan<input value={value.tautan || ''} onChange={(e) => update('tautan', e.target.value)} placeholder="/program atau https://..." /></label>
          <label className={styles.full}>URL Foto<input value={value.foto || ''} onChange={(e) => update('foto', e.target.value)} /></label>
          <label className={styles.full}>Upload Foto Baru<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        </> : null}

        {tab === 'ProgramFoto' ? <>
          <label className={styles.full}>Program<select value={value.programId || ''} onChange={(e) => update('programId', e.target.value)}><option value="">Pilih program</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.nama}</option>)}</select></label>
          <label className={styles.full}>Caption<input value={value.caption || ''} onChange={(e) => update('caption', e.target.value)} /></label>
          <label>Status<select value={value.status || 'Aktif'} onChange={(e) => update('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select></label>
          <label>Urutan<input type="number" min="1" value={value.urutan || 1} onChange={(e) => update('urutan', Number(e.target.value))} /></label>
          <label>Posisi Foto<input value={value.posisi || '50% 50%'} onChange={(e) => update('posisi', e.target.value)} /></label>
          <label className={styles.checkboxLabel}><span>Set sebagai preview program</span><input type="checkbox" checked={Boolean(value.setAsPreview)} onChange={(e) => update('setAsPreview', e.target.checked)} /></label>
          <label className={styles.full}>URL Foto<input value={value.foto || ''} onChange={(e) => update('foto', e.target.value)} /></label>
          <label className={styles.full}>Upload Foto Baru<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        </> : null}
      </div>

      <div className={styles.editorActions}>
        <button className={styles.saveButton} onClick={save} disabled={loading || (tab === 'Artikel' && !value.id)}>{loading ? 'Menyimpan…' : tab === 'Artikel' && value.status === 'Approved' ? 'Simpan & Terbitkan' : 'Simpan Perubahan'}</button>
        <span className={styles.smallStatus}>{value.id ? `ID ${value.id}` : tab === 'Artikel' ? 'Pilih tulisan untuk direview' : 'Data baru'}</span>
      </div>
    </div>
  );
}
