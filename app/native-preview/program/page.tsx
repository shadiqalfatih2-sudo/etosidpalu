import type { Metadata } from 'next';
import { ProgramDirectory } from '@/components/native/DirectoryPages';
import { getNativePrograms } from '@/lib/native-directory';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Program | Etos ID Palu',
  description: 'Program pembinaan Etos ID Palu.',
  robots: { index: false, follow: false },
};

export default async function NativeProgramPage() {
  const programs = await getNativePrograms();
  return <ProgramDirectory programs={programs} />;
}
