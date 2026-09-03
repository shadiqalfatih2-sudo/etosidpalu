import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NativePublicationDetailView } from '@/components/native/PublicationDetail';
import { getNativePublicationDetail } from '@/lib/native-public';

type PageProps = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug);
  const result = await getNativePublicationDetail('opini', cleanSlug);
  if (!result) return { title: 'Opini tidak ditemukan | Etos ID Palu', robots: { index: false, follow: false } };
  const canonical = `/opini/${encodeURIComponent(result.detail.slug)}`;
  return {
    title: `${result.detail.title} | Etos ID Palu`,
    description: result.detail.excerpt,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: result.detail.title,
      description: result.detail.excerpt,
      url: canonical,
      siteName: 'Etos ID Palu',
      publishedTime: result.detail.publishedAt || undefined,
      authors: result.detail.author ? [result.detail.author] : undefined,
      images: result.detail.thumbnail ? [{ url: result.detail.thumbnail }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: result.detail.title,
      description: result.detail.excerpt,
      images: result.detail.thumbnail ? [result.detail.thumbnail] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function OpiniPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getNativePublicationDetail('opini', decodeURIComponent(slug));
  if (!result) notFound();
  return <NativePublicationDetailView detail={result.detail} related={result.related} />;
}
