import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './visual-polish.css';
import './visual-polish-v2.css';
import './visual-polish-v3.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.etosidpalu.com'),
  applicationName: 'Etos ID Palu',
  title: {
    default: 'Etos ID Palu | We Are Resilient Leader',
    template: '%s',
  },
  description: 'Portal resmi Etos ID Palu.',
  authors: [{ name: 'Etos ID Palu' }],
  creator: 'Etos ID Palu',
  publisher: 'Etos ID Palu',
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
