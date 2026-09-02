import type { Metadata } from 'next';
import { NativeSubmitForm } from '@/components/native/NativeSubmitForm';

export const metadata: Metadata = {
  title: 'Kirim Tulisan | Etos ID Palu',
  description: 'Kirim tulisan untuk direview oleh tim Etos ID Palu.',
  alternates: { canonical: '/kirim-tulisan' },
  robots: { index: false, follow: true },
};

export default function SubmitPage() {
  return <NativeSubmitForm />;
}
