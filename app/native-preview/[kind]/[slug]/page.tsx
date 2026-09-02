import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NativePublicationDetailView } from '@/components/native/PublicationDetail';
import { getNativePublicationDetail } from '@/lib/native-public';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ kind: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kind, slug } = await params;
  const result = await getNativePublicationDetail(kind, decodeURIComponent(slug));
  if (!result) return { title: 'Publikasi tidak ditemukan | Etos ID Palu', robots: { index: false, follow: false } };
  return {
    title: `${result.detail.title} | Etos ID Palu`,
    description: result.detail.excerpt,
    robots: { index: false, follow: false },
  };
}

export default async function NativePublicationPage({ params }: PageProps) {
  const { kind, slug } = await params;
  const result = await getNativePublicationDetail(kind, decodeURIComponent(slug));
  if (!result) notFound();
  return <NativePublicationDetailView detail={result.detail} related={result.related} />;
}
