import type { Metadata } from 'next';
import { AdminAuditTrail } from '@/components/native/AdminAuditTrail';

export const metadata: Metadata = {
  title: 'Audit Trail | Admin Etos ID Palu',
  description: 'Riwayat aktivitas administratif Etos ID Palu.',
  robots: { index: false, follow: false },
};

export default function AdminAuditPage() {
  return <AdminAuditTrail />;
}
