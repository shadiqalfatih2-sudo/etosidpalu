import type { Metadata } from 'next';
import { NativeHomePreview } from '@/components/native/HomePreview';
import { getNativeHomeData } from '@/lib/native-public';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Native Next.js Preview | Etos ID Palu',
  robots: { index: false, follow: false },
};

export default async function NativePreviewPage() {
  const { awardees, publications } = await getNativeHomeData();
  return <NativeHomePreview awardees={awardees} publications={publications} />;
}
