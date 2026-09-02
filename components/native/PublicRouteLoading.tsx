import { SiteHeader } from './HomePreview';

type LoadingKind = 'program' | 'awardee' | 'publication';

export function PublicRouteLoading({ kind }: { kind: LoadingKind }) {
  const isPublication = kind === 'publication';
  const cards = kind === 'awardee' ? 10 : 8;

  return (
    <main className={`etos-public-loading etos-public-loading-${kind}`} aria-busy="true" aria-live="polite">
      <SiteHeader />
      <section className="etos-loading-hero">
        <div className="etos-loading-line etos-loading-eyebrow" />
        <div className="etos-loading-hero-grid">
          <div>
            <div className="etos-loading-line etos-loading-title" />
            <div className="etos-loading-line etos-loading-title etos-loading-title-short" />
          </div>
          <div className="etos-loading-line etos-loading-copy" />
        </div>
      </section>

      {isPublication ? (
        <section className="etos-loading-publication">
          <div className="etos-loading-article-main">
            <div className="etos-loading-line etos-loading-meta" />
            <div className="etos-loading-line etos-loading-article-title" />
            <div className="etos-loading-line etos-loading-article-title etos-loading-title-short" />
            <div className="etos-loading-media etos-loading-article-media" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div className={`etos-loading-line etos-loading-body-line line-${index % 3}`} key={index} />
            ))}
          </div>
          <aside className="etos-loading-sidebar">
            {Array.from({ length: 4 }).map((_, index) => <div className="etos-loading-sidebar-item" key={index} />)}
          </aside>
        </section>
      ) : (
        <section className={`etos-loading-grid etos-loading-grid-${kind}`}>
          {Array.from({ length: cards }).map((_, index) => (
            <div className="etos-loading-card" key={index}>
              <div className="etos-loading-media" />
              <div className="etos-loading-card-copy">
                <div className="etos-loading-line etos-loading-meta" />
                <div className="etos-loading-line etos-loading-card-title" />
                <div className="etos-loading-line etos-loading-card-text" />
              </div>
            </div>
          ))}
        </section>
      )}
      <span className="sr-only">Memuat konten Etos ID Palu…</span>
    </main>
  );
}
