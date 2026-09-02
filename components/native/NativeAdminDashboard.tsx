'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './NativeForms.module.css';

const TOKEN_KEY = 'etos_admin_session_token';
type Tab = 'Berita' | 'Artikel' | 'Awardee' | 'ProgramFoto';
type AnyRow = Record<string, any>;
type Feedback = { type: 'success' | 'error'; message: string } | null;

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
  if (tab === 'Berita') return { id: '', judul: '', isi: '', thumbnail: '', thumbnailPosition: '50% 50%' };
  if (tab === 'Artikel') return { id: '', penulis: '', aktivitas: '', judul: '', isi: '', thumbnail: '', thumbnailPosition: '50% 50%', status: 'Pending' };
  if (tab === 'Awardee') return { id: '', nama: '', statusAwardee: 'Aktif', angkatan: '', prodi: '', universitas: 'Universitas Tadulako', profil: '', foto: '', fotoPosition: '50% 50%', portofolio: '', urutan: 1, statusTampil: 'Aktif' };
  return { id: '', programId: '', foto: '', caption: '', urutan: 1, status: 'Aktif', posisi: '50% 50%', setAsPreview: false };
}

export function NativeAdminDashboard() {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('Berita');
  const [data, setData] = useState<Record<string, any>>({ Berita: [], Artikel: [], Awardee: [], ProgramFoto: { programs: [], photos: [] } });
  const [selected, setSelected] = useState<AnyRow>(newRow('Berita'));
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setRole('');
  }, []);

  const loadAll = useCallback(async (sessionToken: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const [berita, artikel, awardee, programMedia] = await Promise.all([
        rpc('getAdminData', ['Berita'], sessionToken),
        rpc('getAdminData', ['Artikel'], sessionToken),
        rpc('getAdminData', ['Awardee'], sessionToken),
        rpc('getAdminProgramPhotos', [], sessionToken),
      ]);
      setData({ Berita: berita || [], Artikel: artikel || [], Awardee: awardee || [], ProgramFoto: programMedia || { programs: [], photos: [] } });
    } catch (error) {
      if (Number((error as any)?.status) === 401 || /sesi admin/i.test(String((error as Error)?.message))) clearSession();
      else setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Data admin gagal dimuat.' });
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY) || '';
    if (saved) {
      setToken(saved);
      void loadAll(saved);
    }
  }, [loadAll]);

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
    setSelected(newRow(next));
    setFile(null);
    setFeedback(null);
  }

  const list: AnyRow[] = useMemo(() => {
    if (tab === 'ProgramFoto') return data.ProgramFoto?.photos || [];
    return data[tab] || [];
  }, [data, tab]);

  function selectRow(row: AnyRow) {
    if (tab === 'Berita') setSelected({ ...row, thumbnail: row.thumb || row.thumbnail || '', thumbnailPosition: row.thumbPosition || '50% 50%' });
    else if (tab === 'Artikel') setSelected({ ...row, thumbnail: row.thumb || row.thumbnail || '', thumbnailPosition: row.thumbPosition || '50% 50%' });
    else if (tab === 'Awardee') setSelected({ ...row, foto: row.fotoRaw || row.foto || '', fotoPosition: row.fotoPosition || '50% 50%' });
    else setSelected({ ...row, programId: row.programId || '', foto: row.fotoRaw || row.foto || '', posisi: row.posisi || '50% 50%', setAsPreview: false });
    setFile(null);
    setFeedback(null);
  }

  async function save() {
    if (!token) return;
    setLoading(true);
    setFeedback(null);
    try {
      const payload = { ...selected };
      if (file) {
        const url = await uploadImage(file, token);
        if (tab === 'Berita' || tab === 'Artikel') payload.thumbnail = url;
        else payload.foto = url;
      }

      let result: AnyRow;
      if (tab === 'Berita') result = await rpc('saveBeritaAdmin', [payload], token);
      else if (tab === 'Artikel') {
        if (!payload.id) throw new Error('Tulisan baru dikirim melalui menu Kirim Tulisan. Admin hanya mereview tulisan yang sudah masuk.');
        result = await rpc('saveArtikelReview', [payload], token);
      } else if (tab === 'Awardee') result = await rpc('saveAwardeeAdmin', [payload], token);
      else result = await rpc('saveProgramPhotoAdmin', [payload], token);

      if (result?.status !== 'success') throw new Error(result?.message || 'Perubahan gagal disimpan.');
      setFeedback({ type: 'success', message: result.message || 'Perubahan berhasil disimpan.' });
      setFile(null);
      await loadAll(token);
      if (!selected.id) setSelected(newRow(tab));
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Perubahan gagal disimpan.' });
    } finally {
      setLoading(false);
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
              <h1>Kelola konten dari satu ruang kerja yang lebih bersih.</h1>
              <p>Login menggunakan akun admin yang sama. Session diverifikasi di Supabase melalui gateway server yang sudah dikunci dari akses anonim langsung.</p>
            </div>
            <div className={styles.loginCard}>
              <h2>Masuk Dashboard</h2>
              <form className={styles.loginForm} onSubmit={login}>
                <label>Username<input name="username" autoComplete="username" /></label>
                <label>Password<input name="password" type="password" autoComplete="current-password" /></label>
                {feedback ? <div className={`${styles.feedback} ${styles.error}`}>{feedback.message}</div> : null}
                <button className={styles.loginButton} disabled={loginLoading}>{loginLoading ? 'Memverifikasi…' : 'Masuk →'}</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.adminShell}>
        <div className={styles.adminTop}>
          <div><div className={styles.eyebrow}>ADMIN WORKSPACE • {role || 'ADMIN'}</div><h1>Dashboard Konten</h1></div>
          <div className={styles.adminActions}><Link className={styles.ghostButton} href="/">Lihat Portal</Link><button className={styles.ghostButton} onClick={logout}>Keluar</button></div>
        </div>

        <div className={styles.dashboardStats}>
          <div><strong>{(data.Berita || []).length}</strong><span>Berita</span></div>
          <div><strong>{(data.Artikel || []).length}</strong><span>Tulisan / Opini</span></div>
          <div><strong>{(data.Awardee || []).length}</strong><span>Awardee</span></div>
        </div>

        <div className={styles.tabs}>
          {(['Berita', 'Artikel', 'Awardee', 'ProgramFoto'] as Tab[]).map((item) => <button key={item} className={tab === item ? styles.activeTab : ''} onClick={() => changeTab(item)}>{item === 'ProgramFoto' ? 'Foto Program' : item}</button>)}
          <button onClick={() => { setSelected(newRow(tab)); setFile(null); setFeedback(null); }}>+ Baru</button>
        </div>

        {feedback ? <div className={`${styles.feedback} ${feedback.type === 'success' ? styles.success : styles.error}`}>{feedback.message}</div> : null}
        {loading && !list.length ? <div className={styles.loading}>Memuat data…</div> : null}

        <div className={styles.adminGrid}>
          <div className={styles.listPanel}>
            {list.length ? list.map((row) => (
              <div className={styles.listItem} key={row.id || `${row.judul}-${row.nama}`} onClick={() => selectRow(row)}>
                <small>{row.status || row.statusTampil || row.programName || tab}</small>
                <h3>{row.judul || row.nama || row.caption || row.programName || row.id}</h3>
                <p>{row.id || ''}{row.penulis ? ` • ${row.penulis}` : ''}</p>
              </div>
            )) : <div className={styles.empty}>Belum ada data pada modul ini.</div>}
          </div>
          <Editor tab={tab} value={selected} setValue={setSelected} programs={data.ProgramFoto?.programs || []} setFile={setFile} save={save} loading={loading} />
        </div>
      </section>
    </main>
  );
}

function Editor({ tab, value, setValue, programs, setFile, save, loading }: { tab: Tab; value: AnyRow; setValue: (row: AnyRow) => void; programs: AnyRow[]; setFile: (file: File | null) => void; save: () => void; loading: boolean }) {
  const update = (key: string, val: any) => setValue({ ...value, [key]: val });
  return (
    <div className={styles.editor}>
      <h2>{value.id ? 'Edit' : 'Tambah'} {tab === 'ProgramFoto' ? 'Foto Program' : tab}</h2>
      <div className={styles.editorGrid}>
        {tab === 'Berita' ? <>
          <label className={styles.full}>Judul<input value={value.judul || ''} onChange={(e) => update('judul', e.target.value)} /></label>
          <label className={styles.full}>Isi Berita (HTML)<textarea rows={13} value={value.isi || ''} onChange={(e) => update('isi', e.target.value)} /></label>
          <label className={styles.full}>URL Thumbnail<input value={value.thumbnail || ''} onChange={(e) => update('thumbnail', e.target.value)} /></label>
          <label>Posisi Thumbnail<input value={value.thumbnailPosition || '50% 50%'} onChange={(e) => update('thumbnailPosition', e.target.value)} /></label>
          <label>Upload Gambar<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        </> : null}
        {tab === 'Artikel' ? <>
          <label>Penulis<input value={value.penulis || ''} onChange={(e) => update('penulis', e.target.value)} /></label>
          <label>Aktivitas<input value={value.aktivitas || ''} onChange={(e) => update('aktivitas', e.target.value)} /></label>
          <label className={styles.full}>Judul<input value={value.judul || ''} onChange={(e) => update('judul', e.target.value)} /></label>
          <label className={styles.full}>Isi (HTML)<textarea rows={12} value={value.isi || ''} onChange={(e) => update('isi', e.target.value)} /></label>
          <label>Status<select value={value.status || 'Pending'} onChange={(e) => update('status', e.target.value)}><option>Pending</option><option>Approved</option><option>Rejected</option></select></label>
          <label>Upload Thumbnail<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
          <label className={styles.full}>URL Thumbnail<input value={value.thumbnail || ''} onChange={(e) => update('thumbnail', e.target.value)} /></label>
        </> : null}
        {tab === 'Awardee' ? <>
          <label className={styles.full}>Nama<input value={value.nama || ''} onChange={(e) => update('nama', e.target.value)} /></label>
          <label>Status Awardee<select value={value.statusAwardee || 'Aktif'} onChange={(e) => update('statusAwardee', e.target.value)}><option>Aktif</option><option>Alumni</option></select></label>
          <label>Status Tampil<select value={value.statusTampil || 'Aktif'} onChange={(e) => update('statusTampil', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select></label>
          <label>Angkatan<input value={value.angkatan || ''} onChange={(e) => update('angkatan', e.target.value)} /></label>
          <label>Program Studi<input value={value.prodi || ''} onChange={(e) => update('prodi', e.target.value)} /></label>
          <label className={styles.full}>Universitas<input value={value.universitas || ''} onChange={(e) => update('universitas', e.target.value)} /></label>
          <label className={styles.full}>Profil<textarea rows={8} value={value.profil || ''} onChange={(e) => update('profil', e.target.value)} /></label>
          <label className={styles.full}>URL Foto<input value={value.foto || ''} onChange={(e) => update('foto', e.target.value)} /></label>
          <label>Upload Foto<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
          <label>Urutan<input type="number" value={value.urutan || 1} onChange={(e) => update('urutan', Number(e.target.value))} /></label>
          <label className={styles.full}>Portofolio / CV URL<input value={value.portofolio || ''} onChange={(e) => update('portofolio', e.target.value)} /></label>
        </> : null}
        {tab === 'ProgramFoto' ? <>
          <label className={styles.full}>Program<select value={value.programId || ''} onChange={(e) => update('programId', e.target.value)}><option value="">Pilih program</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.nama}</option>)}</select></label>
          <label className={styles.full}>Caption<input value={value.caption || ''} onChange={(e) => update('caption', e.target.value)} /></label>
          <label className={styles.full}>URL Foto<input value={value.foto || ''} onChange={(e) => update('foto', e.target.value)} /></label>
          <label>Upload Foto<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
          <label>Urutan<input type="number" value={value.urutan || 1} onChange={(e) => update('urutan', Number(e.target.value))} /></label>
          <label>Status<select value={value.status || 'Aktif'} onChange={(e) => update('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select></label>
          <label>Posisi<input value={value.posisi || '50% 50%'} onChange={(e) => update('posisi', e.target.value)} /></label>
          <label className={styles.full}><span>Set sebagai preview</span><input type="checkbox" checked={Boolean(value.setAsPreview)} onChange={(e) => update('setAsPreview', e.target.checked)} /></label>
        </> : null}
      </div>
      <div className={styles.editorActions}><button className={styles.saveButton} onClick={save} disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan Perubahan'}</button><span className={styles.smallStatus}>{value.id ? `ID ${value.id}` : 'Data baru'}</span></div>
    </div>
  );
}
