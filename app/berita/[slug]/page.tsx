import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NativePublicationDetailView } from '@/components/native/PublicationDetail';
import { getNativePublicationDetail } from '@/lib/native-public';
import { supabaseServer } from '@/lib/supabase';

type PageProps = { params: Promise<{ slug: string }> };
export const revalidate = 300;
export const dynamicParams = true;

function isActive(value: unknown) {
  const status = String(value || 'Aktif').trim().toLowerCase();
  return !['nonaktif', 'inactive', 'draft', 'hidden'].includes(status);
}

export async function generateStaticParams() {
  try {
    const db = supabaseServer();
    const { data, error } = await db.from('news').select('slug,status').not('slug', 'is', null);
    if (error) return [];
    return (data || [])
      .filter((row) => row.slug && isActive(row.status))
      .map((row) => ({ slug: String(row.slug) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug);
  const result = await getNativePublicationDetail('berita', cleanSlug);
  if (!result) return { title: 'Berita tidak ditemukan | Etos ID Palu', robots: { index: false, follow: false } };
  const canonical = `/berita/${encodeURIComponent(result.detail.slug)}`;
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

export default async function BeritaPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getNativePublicationDetail('berita', decodeURIComponent(slug));
  if (!result) notFound();
  return <NativePublicationDetailView detail={result.detail} related={result.related} />;
}
