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
  return { title: `${program.name} | Etos ID Palu`, description: program.summary, robots: { index: false, follow: false } };
}

export default async function NativeProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const program = await getNativeProgramDetail(decodeURIComponent(id));
  if (!program) notFound();
  return <ProgramDetail program={program} />;
}
