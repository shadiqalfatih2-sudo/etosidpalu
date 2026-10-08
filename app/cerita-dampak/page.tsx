import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, Footer } from '@/components/native/HomePreview';
import { getNativeHomeData } from '@/lib/native-public';
import './impact-editorial.css';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Perjalanan & Cerita Dampak | ETOS ID Palu',
  description: 'Kenali perjalanan pembinaan, kegiatan, dan dokumentasi dari ekosistem ETOS ID Palu. Jelajahi program serta publikasi yang mengisahkan proses belajar dan kontribusi.',
  alternates: { canonical: '/cerita-dampak' },
  openGraph: { title: 'Perjalanan & Cerita Dampak | ETOS ID Palu', description: 'Ruang cerita tentang proses, pembinaan, dan kontribusi ekosistem ETOS ID Palu.', url: '/cerita-dampak' },
};

export default async function ImpactEditorialPage() {
  const { programs, publications, awardees } = await getNativeHomeData();
  const featured = programs.filter(item => item.preview).slice(0, 6);
  const related = publications.filter(item => item.kind === 'Berita').slice(0, 3);
  const cover = featured[0]?.preview || awardees.find(item => item.photo)?.photo || '';
  return <>
    <SiteHeader />
    <main className="etos-impact-editorial">
      <div className="etos-impact-editorial-shell">
        <Link href="/#program" className="etos-impact-editorial-back">← Kembali ke Beranda</Link>
        <header className="etos-impact-editorial-head">
          <div className="etos-impact-editorial-intro">
            <span className="etos-impact-editorial-eyebrow">ETOS ID PALU / THE GROWTH JOURNEY</span>
            <h1>Di balik proses, ada cerita yang terus bertumbuh.</h1>
            <p>Ruang untuk menjelajahi pengalaman pembinaan, dokumentasi kegiatan, serta cerita dari orang-orang di dalam ekosistem ETOS ID Palu.</p>
            <a className="etos-impact-editorial-link" href="#perjalanan">Jelajahi perjalanan <span aria-hidden="true">↘</span></a>
          </div>
          {cover ? <div className="etos-impact-editorial-cover"><img src={cover} alt="Dokumentasi program ETOS ID Palu" fetchPriority="high" /></div> : null}
        </header>
        <section className="etos-impact-editorial-statement" aria-label="Nilai pembinaan">
          <div><span>01 — BERTUMBUH</span><p>Membangun karakter dan cara berpikir melalui proses belajar.</p></div>
          <div><span>02 — BERGERAK</span><p>Mengembangkan kemampuan untuk bekerja sama dan mengambil peran.</p></div>
          <div><span>03 — BERKONTRIBUSI</span><p>Mengarahkan pengalaman pembinaan menuju manfaat bagi sekitar.</p></div>
        </section>
        <section id="perjalanan" className="etos-impact-editorial-programs" aria-labelledby="perjalanan-title">
          <div className="etos-impact-editorial-section-head">
            <span className="etos-impact-editorial-eyebrow">DOKUMENTASI PERJALANAN</span>
            <h2 id="perjalanan-title">Program, proses, dan ruang tumbuh.</h2>
            <p>Telusuri catatan program dan dokumentasi yang tersedia. Setiap halaman menggunakan konten resmi yang dapat diperbarui oleh pengelola ETOS.</p>
          </div>
          {featured.length ? <div className="etos-impact-editorial-grid">
            {featured.map((program, index) => <Link href={`/program/${encodeURIComponent(program.id)}`} className="etos-impact-editorial-card" key={program.id}>
              <div className="etos-impact-editorial-image">{program.preview ? <img src={program.preview} alt={program.name} loading="lazy" /> : null}</div>
              <div className="etos-impact-editorial-card-body">
                <small>{String(index + 1).padStart(2, '0')} / {program.category || 'Program pembinaan'}</small>
                <h3>{program.name}</h3>
                {program.summary ? <p>{program.summary}</p> : null}
                <span>Jelajahi dokumentasi <span aria-hidden="true">↗</span></span>
              </div>
            </Link>)}
          </div> : <p>Dokumentasi program sedang disiapkan.</p>}
        </section>
        {related.length ? <section className="etos-impact-editorial-journal" aria-labelledby="impact-journal-title">
          <div className="etos-impact-editorial-section-head">
            <span className="etos-impact-editorial-eyebrow">ETOS JOURNAL</span>
            <h2 id="impact-journal-title">Catatan dari ekosistem.</h2>
          </div>
          <div className="etos-impact-editorial-articles">
            {related.map(item => <Link key={item.id} href={`/berita/${encodeURIComponent(item.slug)}`}>
              <span>{item.kind}</span><h3>{item.title}</h3><span>Baca tulisan ↗</span>
            </Link>)}
          </div>
        </section> : null}
        <div className="etos-impact-editorial-foot"><p>Setiap klaim hasil dan angka dampak perlu disertai data yang telah diverifikasi sebelum dipublikasikan sebagai capaian.</p><Link href="/#awardee">Kenali para awardee →</Link></div>
      </div>
    </main>
    <Footer />
  </>;
}
