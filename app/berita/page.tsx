import type { Metadata } from 'next';
import { NewsIndex } from '@/components/native/NewsIndex';
import { getNativeNewsIndex } from '@/lib/native-news-index';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Berita | Etos ID Palu',
  description: 'Berita, kegiatan, dan perjalanan terbaru dari ekosistem Etos ID Palu.',
  alternates: { canonical: '/berita' },
  openGraph: {
    type: 'website',
    title: 'Berita | Etos ID Palu',
    description: 'Berita, kegiatan, dan perjalanan terbaru dari ekosistem Etos ID Palu.',
    url: '/berita',
    siteName: 'Etos ID Palu',
  },
  robots: { index: true, follow: true },
};

export default async function BeritaIndexPage() {
  const news = await getNativeNewsIndex();
  return <NewsIndex news={news} />;
}
