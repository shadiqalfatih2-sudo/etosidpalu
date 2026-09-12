import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';
import type { NativePublication, NativePublicationDetail } from '@/lib/native-public';
import { SiteHeader } from './HomePreview';
import styles from './PublicationDetail.module.css';

function formatDate(value: string) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch { return ''; }
}

function href(item: NativePublication) {
  return `/${item.kind === 'Berita' ? 'berita' : 'opini'}/${encodeURIComponent(item.slug)}`;
}

function cleanArticleHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'iframe']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

export function NativePublicationDetailView({ detail, related }: { detail: NativePublicationDetail; related: NativePublication[] }) {
  const safeHtml = cleanArticleHtml(detail.contentHtml);
  const displayAuthor = detail.kind === 'Berita'
    ? 'Fasilitator Etos ID Palu'
    : (detail.author || 'Kontributor Etos ID Palu');
  const displayRole = detail.kind === 'Berita'
    ? 'Etos ID Palu'
    : (detail.activity || 'Kontributor Etos ID Palu');

  return (
    <main className={`${styles.page} native-publication`}>
      <SiteHeader />
      <div className={`${styles.shell} native-publication-shell`}>
        <Link
          href="/"
          className={styles.back}
          data-etos-smart-back="publication"
          data-etos-fallback-target="publikasi"
        >
          ← Kembali ke Berita &amp; Opini
        </Link>

        <div className={`${styles.contentGrid} native-publication-grid`}>
          <article className={`${styles.article} native-publication-article`}>
            <header className={styles.articleHeader}>
              <div className={styles.meta}>{detail.kind} <span>•</span> {formatDate(detail.publishedAt)}</div>
              <h1>{detail.title}</h1>
              <div className={styles.authorRow}>
                <div className={styles.avatar}>{displayAuthor.slice(0, 1).toUpperCase()}</div>
                <div>
                  <strong>{displayAuthor}</strong>
                  <span>{displayRole}</span>
                </div>
              </div>
            </header>

            {detail.thumbnail ? (
              <div className={`${styles.heroImage} native-publication-hero`}>
                <img
                  src={detail.thumbnail}
                  alt=""
                  style={{ objectPosition: detail.thumbnailPosition }}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
            ) : null}

            <div
              className={`${styles.articleBody} native-publication-body`}
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </article>

          <aside className={`${styles.sidebar} native-publication-sidebar`}>
            <div className={styles.sidebarLabel}>Tulisan Lainnya</div>
            <div className={styles.relatedList}>
              {related.map((item) => (
                <Link href={href(item)} className={`${styles.relatedItem} native-related-item`} key={`${item.kind}-${item.id}`} prefetch>
                  <div className={styles.relatedImage}>
                    {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" decoding="async" fetchPriority="low" /> : null}
                  </div>
                  <div className={styles.relatedCopy}>
                    <small>{item.kind} • {formatDate(item.publishedAt)}</small>
                    <h3>{item.title}</h3>
                    <span className={styles.relatedArrow}>Baca →</span>
                  </div>
                </Link>
              ))}
            </div>
            {detail.kind === 'Berita' ? (
              <Link href="/berita" className={styles.more} prefetch>Lihat semua berita →</Link>
            ) : (
              <Link href="/" data-etos-section-target="publikasi" className={styles.more}>Lihat semua publikasi →</Link>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
