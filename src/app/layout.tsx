import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/google-analytics';
import { ServiceWorker } from '@/components/service-worker';
export const metadata: Metadata = {
  title: 'Gully Games — The bell can wait.',
  description:
    'Indian childhood games, brought back to life. Start with Pen Fight on a familiar school desk.',
  applicationName: 'Gully Games',
  appleWebApp: {
    capable: true,
    title: 'Gully Games',
    statusBarStyle: 'default',
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#284d40',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorker />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
