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
  const canonical = `/awardee/${encodeURIComponent(awardee.id)}`;
  const description = awardee.summary ? awardee.summary.slice(0, 160) : `${awardee.name}, Awardee Etos ID Palu.`;
  return {
    title: `${awardee.name} | Etos ID Palu`,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'profile',
      title: awardee.name,
      description,
      url: canonical,
      siteName: 'Etos ID Palu',
      images: awardee.photo ? [{ url: awardee.photo }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function AwardeeProfilePage({ params }: PageProps) {
  const { id } = await params;
  const awardee = await getNativeAwardeeDetail(decodeURIComponent(id));
  if (!awardee) notFound();
  return <AwardeeProfile awardee={awardee} />;
}
