import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html style={{ background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)', backgroundAttachment: 'fixed' }}>
      <Head>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html {
              background: linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%) !important;
              background-attachment: fixed !important;
              background-size: 100% 100% !important;
              background-repeat: no-repeat !important;
              min-height: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            html::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%);
              z-index: -9999;
              pointer-events: none;
            }
            body {
              background: linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%) !important;
              background-attachment: fixed !important;
              background-size: 100% 100% !important;
              background-repeat: no-repeat !important;
              min-height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow-x: hidden;
            }
            body::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%);
              z-index: -9998;
              pointer-events: none;
            }
            #__next {
              background: transparent !important;
              min-height: 100vh !important;
              position: relative !important;
            }
            #__next::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%);
              z-index: -9997;
              pointer-events: none;
            }
            main {
              background: transparent !important;
            }
            div[class*="min-h-screen"] {
              background: transparent !important;
            }
            div[class*="font-sans"] {
              background: transparent !important;
            }
          `
        }} />
      </Head>
      <body style={{ background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)', backgroundAttachment: 'fixed' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

