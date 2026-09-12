import { SiteHeader } from '@/components/native/HomePreview';

export default function LoadingOpiniDetail() {
  return (
    <main className="etos-public-loading native-publication">
      <SiteHeader />
      <div className="etos-loading-publication-compact" aria-hidden="true">
        <div className="etos-loading-line etos-loading-back" />
        <div className="etos-loading-line etos-loading-meta" />
        <div className="etos-loading-line etos-loading-article-title" />
        <div className="etos-loading-line etos-loading-article-title etos-loading-title-short" />
        <div className="etos-loading-line etos-loading-author" />
        <div className="etos-loading-media etos-loading-article-media" />
        <div className="etos-loading-reading-lines">
          <div className="etos-loading-line etos-loading-body-line" />
          <div className="etos-loading-line etos-loading-body-line line-1" />
          <div className="etos-loading-line etos-loading-body-line" />
          <div className="etos-loading-line etos-loading-body-line line-2" />
        </div>
      </div>
      <span className="sr-only">Memuat opini…</span>
    </main>
  );
}
