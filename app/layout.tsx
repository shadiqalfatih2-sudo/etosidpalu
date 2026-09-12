import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DrawerLayerSafety } from '@/components/native/DrawerLayerSafety';
import { NavigationFeedback } from '@/components/native/NavigationFeedback';
import './design-system.css';
import './navigation-performance.css';
import './motion-system.css';
import './homepage-2026.css';
import './homepage-final-polish.css';
import './homepage-visual-fix.css';
import './premium-public.css';
import './card-system-2026.css';
import './publication-editorial-2026.css';
import './portrait-premium-2026.css';
import './portrait-about-story-2026.css';
import './ux-final-2026.css';
// Final public visual layer: typography consistency + restrained green accents.
import './final-accent-typography-2026.css';
// Final edge alignment + compact portrait footer.
import './final-edge-polish-2026.css';
// Final directory drawer visibility + compact desktop partner feature.
import './final-drawer-partner-fix-2026.css';

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
  icons: {
    icon: [
      {
        url: '/etos-favicon.png?v=2',
        type: 'image/png',
        sizes: '512x512',
      },
    ],
    shortcut: '/etos-favicon.png?v=2',
    apple: '/etos-favicon.png?v=2',
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <NavigationFeedback />
        <DrawerLayerSafety />
        {children}
      </body>
    </html>
  );
}
