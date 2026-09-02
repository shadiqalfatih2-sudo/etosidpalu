import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProgramDetail } from '@/components/native/DirectoryPages';
import { getNativeProgramDetail } from '@/lib/native-directory';

type PageProps = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const program = await getNativeProgramDetail(decodeURIComponent(id));
  if (!program) return { title: 'Program tidak ditemukan | Etos ID Palu', robots: { index: false, follow: false } };
  const canonical = `/program/${encodeURIComponent(program.id)}`;
  return {
    title: `${program.name} | Etos ID Palu`,
    description: program.summary,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: program.name,
      description: program.summary,
      url: canonical,
      siteName: 'Etos ID Palu',
      images: program.preview ? [{ url: program.preview }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const program = await getNativeProgramDetail(decodeURIComponent(id));
  if (!program) notFound();
  return <ProgramDetail program={program} />;
}
