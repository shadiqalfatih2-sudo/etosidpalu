import type { Metadata } from 'next';
import { NativeSubmitForm } from '@/components/native/NativeSubmitForm';

export const metadata: Metadata = {
  title: 'Kirim Tulisan | Etos ID Palu',
  description: 'Kirim tulisan untuk direview oleh tim Etos ID Palu.',
  robots: { index: false, follow: false },
};

export default function NativeSubmitPage() {
  return <NativeSubmitForm />;
}
