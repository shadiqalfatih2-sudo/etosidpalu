import type { Metadata } from 'next';
import { NativeHomePreview } from '@/components/native/HomePreview';
import { getNativeHomeData } from '@/lib/native-public';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Native Next.js Preview | Etos ID Palu',
  description: 'Preview migrasi native Next.js Etos ID Palu.',
  robots: { index: false, follow: false },
};

export default async function NativePreviewPage() {
  const data = await getNativeHomeData();
  return <NativeHomePreview {...data} />;
}
