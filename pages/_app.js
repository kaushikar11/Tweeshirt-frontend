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

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <div 
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}
        style={{ background: 'transparent' }}
      >
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}

export default MyApp;