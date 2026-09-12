import Link from 'next/link';
import type { NativePublication } from '@/lib/native-public';
import { Footer, SiteHeader } from './HomePreview';
import { HomepageMotion } from './HomepageMotion';

function formatDate(value: string) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

function href(item: NativePublication) {
  return `/berita/${encodeURIComponent(item.slug)}`;
}

export function NewsIndex({ news }: { news: NativePublication[] }) {
  const [lead, ...rest] = news;

  return (
    <main className="native-news-index">
      <HomepageMotion />
      <SiteHeader />

      <section className="etos-news-index-shell">
        <a href="/" data-etos-section-target="publikasi" className="etos-news-index-back">
          ← Kembali ke Berita &amp; Opini
        </a>

        <header className="etos-news-index-head" data-etos-reveal="soft">
          <div>
            <span className="etos-news-index-eyebrow">Berita Etos ID Palu</span>
            <h1>Cerita, kegiatan, dan perjalanan dari ekosistem Etos ID Palu.</h1>
          </div>
          <p>Semua berita yang telah diterbitkan, disusun kronologis agar mudah dibaca dan ditelusuri.</p>
        </header>

        {!lead ? (
          <div className="etos-news-empty">Belum ada berita yang diterbitkan.</div>
        ) : (
          <>
            <Link href={href(lead)} className="etos-news-lead" data-etos-reveal="media" prefetch>
              <div className="etos-news-lead-media">
                {lead.thumbnail ? <img src={lead.thumbnail} alt="" loading="eager" fetchPriority="high" decoding="async" /> : null}
              </div>
              <div className="etos-news-lead-copy">
                <small>{formatDate(lead.publishedAt)}</small>
                <h2>{lead.title}</h2>
                {lead.excerpt ? <p>{lead.excerpt}</p> : null}
                <span>Baca berita <b>→</b></span>
              </div>
            </Link>

            {rest.length ? (
              <div className="etos-news-list" data-etos-stagger="news-list">
                {rest.map((item) => (
                  <Link href={href(item)} className="etos-news-row" key={item.id} data-etos-reveal="soft" prefetch>
                    <div className="etos-news-row-media">
                      {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" decoding="async" fetchPriority="low" /> : null}
                    </div>
                    <div className="etos-news-row-copy">
                      <small>{formatDate(item.publishedAt)}</small>
                      <h2>{item.title}</h2>
                      {item.excerpt ? <p>{item.excerpt}</p> : null}
                      <span>Baca <b>→</b></span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
