import type { Metadata } from 'next';
import { ProgramDirectory } from '@/components/native/DirectoryPages';
import { getNativePrograms } from '@/lib/native-directory';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Program | Etos ID Palu',
  description: 'Program pembinaan Etos ID Palu yang menghubungkan karakter, spiritualitas, kepemimpinan, kolaborasi, dan pengabdian.',
  alternates: { canonical: '/program' },
  robots: { index: true, follow: true },
};

export default async function ProgramPage() {
  const programs = await getNativePrograms();
  return <ProgramDirectory programs={programs} />;
}
