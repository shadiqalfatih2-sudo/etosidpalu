import type { Metadata } from 'next';
import { NativeHomePreview } from '@/components/native/HomePreview';
import { getNativeHomeData } from '@/lib/native-public';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Etos ID Palu | We Are Resilient Leader',
  description: 'Portal resmi Etos ID Palu: pembinaan, program, awardee, berita, opini, dan cerita dampak dari ekosistem Etos ID Palu.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'Etos ID Palu | We Are Resilient Leader',
    description: 'Portal resmi Etos ID Palu: pembinaan, program, awardee, berita, opini, dan cerita dampak.',
    url: '/',
    siteName: 'Etos ID Palu',
  },
  robots: { index: true, follow: true },
};

export default async function HomePage() {
  const data = await getNativeHomeData();
  return <NativeHomePreview {...data} />;
}
