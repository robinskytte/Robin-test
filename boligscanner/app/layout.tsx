import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BoligScanner — Kend din bolig, før du køber',
  description: 'Samlet overblik over risici, potentiale og nabolag for enhver dansk adresse.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-warm-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
