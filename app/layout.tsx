import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NavigationFeedback } from '@/components/native/NavigationFeedback';
import './design-system.css';
import './navigation-performance.css';
import './motion-system.css';
import './homepage-refinement.css';
import './partner-section.css';

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
      <body>
        <NavigationFeedback />
        {children}
      </body>
    </html>
  );
}
