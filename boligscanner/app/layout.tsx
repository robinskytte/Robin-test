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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-warm-white text-warm-gray-900 font-sans antialiased">
        {children}
        <footer className="border-t border-warm-gray-200 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs text-warm-gray-500">
              BoligScanner er i betaversion. Simulerede data anvendes hvor API-adgang kræver registrering.
              Brug ikke rapporten som grundlag for købsbeslutninger uden professionel rådgivning.
            </p>
            <p className="text-xs text-warm-gray-500 mt-1">
              Powered by BoligScanner — beta version
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
