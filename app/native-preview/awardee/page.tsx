import type { Metadata } from 'next';
import { AwardeeDirectory } from '@/components/native/DirectoryPages';
import { getNativeAwardees } from '@/lib/native-directory';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Awardee | Etos ID Palu',
  description: 'Profil awardee Etos ID Palu.',
  robots: { index: false, follow: false },
};

export default async function NativeAwardeePage() {
  const awardees = await getNativeAwardees();
  return <AwardeeDirectory awardees={awardees} />;
}
