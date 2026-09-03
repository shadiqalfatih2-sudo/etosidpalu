import { SiteHeader } from './HomePreview';

type LoadingKind = 'program' | 'awardee' | 'publication';

export function PublicRouteLoading({ kind }: { kind: LoadingKind }) {
  const isPublication = kind === 'publication';
  const cards = kind === 'awardee' ? 10 : 8;

  return (
    <main className={`etos-public-loading etos-public-loading-${kind}`} aria-busy="true" aria-live="polite">
      <SiteHeader />

      {isPublication ? (
        <section className="etos-loading-publication-compact">
          <div className="etos-loading-line etos-loading-back" />
          <div className="etos-loading-line etos-loading-meta" />
          <div className="etos-loading-line etos-loading-article-title" />
          <div className="etos-loading-line etos-loading-article-title etos-loading-title-short" />
          <div className="etos-loading-line etos-loading-author" />
          <div className="etos-loading-media etos-loading-article-media" />
          <div className="etos-loading-reading-lines">
            <div className="etos-loading-line etos-loading-body-line line-0" />
            <div className="etos-loading-line etos-loading-body-line line-1" />
            <div className="etos-loading-line etos-loading-body-line line-2" />
          </div>
        </section>
      ) : (
        <>
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
        </>
      )}
      <span className="sr-only">Memuat konten Etos ID Palu…</span>
    </main>
  );
}
