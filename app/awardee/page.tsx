import type { Metadata } from 'next';
import { AwardeeDirectory } from '@/components/native/DirectoryPages';
import { getNativeAwardees } from '@/lib/native-directory';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Awardee | Etos ID Palu',
  description: 'Profil awardee Etos ID Palu, perjalanan pembinaan, studi, dan kontribusi mereka.',
  alternates: { canonical: '/awardee' },
  robots: { index: true, follow: true },
};

export default async function AwardeePage() {
  const awardees = await getNativeAwardees();
  return <AwardeeDirectory awardees={awardees} />;
}
