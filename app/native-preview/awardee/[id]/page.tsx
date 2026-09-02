import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AwardeeProfile } from '@/components/native/DirectoryPages';
import { getNativeAwardeeDetail } from '@/lib/native-directory';

type PageProps = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const awardee = await getNativeAwardeeDetail(decodeURIComponent(id));
  if (!awardee) return { title: 'Awardee tidak ditemukan | Etos ID Palu', robots: { index: false, follow: false } };
  return { title: `${awardee.name} | Etos ID Palu`, description: awardee.summary.slice(0, 160), robots: { index: false, follow: false } };
}

export default async function NativeAwardeeProfilePage({ params }: PageProps) {
  const { id } = await params;
  const awardee = await getNativeAwardeeDetail(decodeURIComponent(id));
  if (!awardee) notFound();
  return <AwardeeProfile awardee={awardee} />;
}
