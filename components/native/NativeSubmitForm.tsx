'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from './HomePreview';
import styles from './NativeForms.module.css';

type Feedback = { type: 'success' | 'error'; message: string } | null;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gambar gagal dibaca.'));
    reader.readAsDataURL(file);
  });
}

function plainTextToHtml(value: string) {
  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

async function uploadImage(file: File) {
  const dataUrl = await fileToDataUrl(file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, fileName: file.name }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Upload thumbnail gagal.');
  const result = JSON.parse(body.result || '{}');
  if (result.status !== 'success' || !result.url) throw new Error(result.message || 'Upload thumbnail gagal.');
  return String(result.url);
}

export function NativeSubmitForm() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('thumbnail');
    const nama = String(data.get('nama') || '').trim();
    const aktivitas = String(data.get('aktivitas') || '').trim();
    const judul = String(data.get('judul') || '').trim();
    const isi = String(data.get('isi') || '').trim();

    if (!nama || !judul || !isi || !(file instanceof File) || !file.size) {
      setFeedback({ type: 'error', message: 'Nama, judul, isi tulisan, dan thumbnail wajib diisi.' });
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
      setFeedback({ type: 'error', message: 'Thumbnail harus berupa JPG, PNG, WebP, atau GIF.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran thumbnail maksimal 10 MB.' });
      return;
    }

    setLoading(true);
    try {
      const thumbnail = await uploadImage(file);
      const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fn: 'submitArtikelUser',
          args: [{
            nama,
            aktivitas,
            judul,
            isi: plainTextToHtml(isi),
            thumbnail,
            thumbnailPosition: '50% 50%',
          }],
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Tulisan gagal dikirim.');
      const result = JSON.parse(body.result || '{}');
      if (result.status !== 'success') throw new Error(result.message || 'Tulisan gagal dikirim.');
      form.reset();
      setFeedback({ type: 'success', message: result.message || 'Tulisan berhasil dikirim dan menunggu review.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Tulisan gagal dikirim.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <SiteHeader />
      <section className={styles.submitShell}>
        <Link className={styles.back} href="/">← Kembali ke Beranda</Link>
        <div className={styles.submitGrid}>
          <div className={styles.intro}>
            <div className={styles.eyebrow}>KIRIM TULISAN</div>
            <h1>Bagikan gagasan, pengalaman, dan cerita yang layak tumbuh bersama.</h1>
            <p>Setiap tulisan akan masuk ke meja review admin terlebih dahulu sebelum diterbitkan sebagai Opini di portal Etos ID Palu.</p>
            <div className={styles.flow}>
              <div><strong>01</strong><span>Tulis dan unggah thumbnail</span></div>
              <div><strong>02</strong><span>Masuk ke proses review</span></div>
              <div><strong>03</strong><span>Diterbitkan setelah disetujui</span></div>
            </div>
          </div>
          <form className={styles.form} onSubmit={submit}>
            <label>Nama Penulis<input name="nama" autoComplete="name" placeholder="Nama lengkap" /></label>
            <label>Aktivitas / Peran<input name="aktivitas" placeholder="Contoh: Awardee Etos ID Palu 2023" /></label>
            <label className={styles.full}>Judul Tulisan<input name="judul" placeholder="Judul yang singkat dan kuat" /></label>
            <label className={styles.full}>Isi Tulisan<textarea name="isi" rows={13} placeholder="Tulis isi artikel di sini. Pisahkan paragraf dengan satu baris kosong." /></label>
            <label className={styles.full}>Thumbnail<input name="thumbnail" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
            {feedback ? <div className={`${styles.feedback} ${feedback.type === 'success' ? styles.success : styles.error}`}>{feedback.message}</div> : null}
            <button className={styles.submitButton} type="submit" disabled={loading}>{loading ? 'Mengirim tulisan…' : 'Kirim untuk Review →'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
