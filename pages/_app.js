import { SessionProvider } from 'next-auth/react';
import { Inter, Space_Grotesk } from 'next/font/google';
import '../styles/global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

function AppLayout({ children }) {
  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen bg-transparent`}>
      <div className="w-full">{children}</div>
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider 
      session={pageProps.session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
      basePath={process.env.NEXT_PUBLIC_BASE_PATH || undefined}
    >
      <AppLayout>
        <div className="w-full min-h-screen flex flex-col">
          <div className="flex-1 pt-20">
            <Component {...pageProps} />
          </div>
          <footer className="text-center py-8 text-slate-400/60 text-sm border-t border-white/5 mt-16">
            © 2026 Kaushik Alaguvadivel Ramya - Powered by nextgen AI models
          </footer>
        </div>
      </AppLayout>
    </SessionProvider>
  );
}

export default MyApp;