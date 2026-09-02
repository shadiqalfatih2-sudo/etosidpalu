'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './AdminAudit.module.css';

const TOKEN_KEY = 'etos_admin_session_token';
type AuditRow = {
  id: string;
  username: string;
  role: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type Context = {
  username?: string;
  role?: string;
  capabilities?: Record<string, boolean>;
};

async function adminRpc(type: string, token: string) {
  const response = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Etos-Admin-Token': token },
    body: JSON.stringify({ fn: 'getAdminData', args: [type] }),
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || 'Request gagal.'), { status: response.status });
  return typeof body.result === 'string' ? JSON.parse(body.result) : body.result;
}

function actionLabel(action: string) {
  if (action === 'create') return 'Dibuat';
  if (action === 'update') return 'Diperbarui';
  if (action === 'review') return 'Direview';
  if (action === 'status') return 'Ubah Status';
  return action || 'Aktivitas';
}

function entityLabel(entity: string) {
  const map: Record<string, string> = {
    news: 'Berita', article: 'Opini', awardee: 'Awardee', program: 'Program',
    program_photo: 'Foto Program', hero: 'Hero Slider',
  };
  return map[entity] || entity || 'Data';
}

export function AdminAuditShortcut() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY) || '';
    if (!token) return;
    adminRpc('Context', token)
      .then((ctx: Context) => setVisible(Boolean(ctx?.capabilities?.viewAudit) || String(ctx?.role).toLowerCase() === 'superadmin'))
      .catch(() => setVisible(false));
  }, []);
  if (!visible) return null;
  return <Link className={styles.auditShortcut} href="/admin/audit">Audit Trail ↗</Link>;
}

export function AdminAuditTrail() {
  const [context, setContext] = useState<Context>({});
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('Semua');
  const [lastSync, setLastSync] = useState('');

  const load = useCallback(async (silent = false) => {
    const token = localStorage.getItem(TOKEN_KEY) || '';
    if (!token) {
      setError('Sesi admin tidak ditemukan. Silakan login kembali.');
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const [ctx, audit] = await Promise.all([adminRpc('Context', token), adminRpc('Audit', token)]);
      setContext(ctx || {});
      setRows(Array.isArray(audit) ? audit : []);
      setError('');
      setLastSync(new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()));
    } catch (e) {
      const status = Number((e as { status?: number })?.status || 0);
      if (status === 401) localStorage.removeItem(TOKEN_KEY);
      setError(e instanceof Error ? e.message : 'Audit trail gagal dimuat.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(true), 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const canView = Boolean(context?.capabilities?.viewAudit) || String(context.role || '').toLowerCase() === 'superadmin';
  const entities = useMemo(() => Array.from(new Set(rows.map((row) => entityLabel(row.entityType)))).sort(), [rows]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const entity = entityLabel(row.entityType);
      const haystack = [row.username, row.role, actionLabel(row.action), entity, row.entityId, row.summary, row.createdAt].join(' ').toLowerCase();
      return (!q || haystack.includes(q)) && (entityFilter === 'Semua' || entity === entityFilter);
    });
  }, [rows, search, entityFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    create: rows.filter((x) => x.action === 'create').length,
    update: rows.filter((x) => x.action === 'update').length,
    review: rows.filter((x) => x.action === 'review' || x.action === 'status').length,
  }), [rows]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <Link href="/admin" className={styles.back}>← Dashboard Admin</Link>
          <span className={styles.eyebrow}>SUPERADMIN • SECURITY & GOVERNANCE</span>
          <h1>Audit Trail</h1>
          <p>Riwayat perubahan administratif yang dicatat langsung oleh database.</p>
        </div>
        <div className={styles.identity}>
          <span>Session</span>
          <strong>{context.username || '—'}</strong>
          <small>{context.role || 'Memverifikasi…'} • sync {lastSync || '—'}</small>
          <button onClick={() => void load()} disabled={loading}>{loading ? 'Sinkron…' : '↻ Sinkronkan'}</button>
        </div>
      </header>

      {error ? <section className={styles.notice}><strong>Akses belum tersedia</strong><p>{error}</p><Link href="/admin">Kembali ke login/dashboard</Link></section> : null}

      {!error && !loading && !canView ? (
        <section className={styles.notice}><strong>Hak akses dibatasi</strong><p>Audit Trail hanya tersedia untuk SuperAdmin. Pembatasan ini juga diberlakukan di database, bukan hanya di tampilan.</p><Link href="/admin">Kembali ke Dashboard</Link></section>
      ) : null}

      {!error && canView ? <>
        <section className={styles.statGrid}>
          <div><span>Aktivitas tercatat</span><strong>{stats.total}</strong><small>100 aktivitas terbaru</small></div>
          <div><span>Data dibuat</span><strong>{stats.create}</strong><small>create events</small></div>
          <div><span>Data diperbarui</span><strong>{stats.update}</strong><small>update events</small></div>
          <div><span>Editorial review</span><strong>{stats.review}</strong><small>review + status</small></div>
        </section>

        <section className={styles.filters}>
          <label><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari user, ID, judul, atau aksi..." /></label>
          <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}><option>Semua</option>{entities.map((entity) => <option key={entity}>{entity}</option>)}</select>
          <small>{filtered.length} hasil</small>
        </section>

        <section className={styles.timeline}>
          {filtered.length ? filtered.map((row) => (
            <article className={styles.event} key={row.id}>
              <div className={`${styles.actionMark} ${styles[`action_${row.action}`] || ''}`}>{String(row.action || '?').slice(0, 1).toUpperCase()}</div>
              <div className={styles.eventMain}>
                <div className={styles.eventMeta}><span>{actionLabel(row.action)}</span><b>{entityLabel(row.entityType)}</b><small>{row.createdAt}</small></div>
                <h2>{row.summary || row.entityId || entityLabel(row.entityType)}</h2>
                <p>{[row.entityId ? `ID ${row.entityId}` : '', row.username ? `oleh ${row.username}` : '', row.role].filter(Boolean).join(' • ')}</p>
              </div>
              <div className={styles.eventRole}>{row.role}</div>
            </article>
          )) : <div className={styles.empty}>{loading ? 'Memuat audit trail…' : 'Belum ada aktivitas yang cocok.'}</div>}
        </section>
      </> : null}
    </main>
  );
}
