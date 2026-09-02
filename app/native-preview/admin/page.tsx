import type { Metadata } from 'next';
import { NativeAdminDashboard } from '@/components/native/NativeAdminDashboard';

export const metadata: Metadata = {
  title: 'Admin | Etos ID Palu',
  description: 'Dashboard pengelolaan konten Etos ID Palu.',
  robots: { index: false, follow: false },
};

export default function NativeAdminPage() {
  return <NativeAdminDashboard />;
}
