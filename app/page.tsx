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

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.etosidpalu.com/#organization',
      name: 'Etos ID Palu',
      url: 'https://www.etosidpalu.com',
      logo: 'https://www.etosidpalu.com/assets/etos-id.png',
      sameAs: ['https://www.instagram.com/etosidpalu/'],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Palu',
        addressRegion: 'Sulawesi Tengah',
        addressCountry: 'ID',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.etosidpalu.com/#website',
      url: 'https://www.etosidpalu.com',
      name: 'Etos ID Palu',
      publisher: { '@id': 'https://www.etosidpalu.com/#organization' },
      inLanguage: 'id-ID',
    },
  ],
};

export default async function HomePage() {
  const data = await getNativeHomeData();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <NativeHomePreview {...data} />
    </>
  );
}
