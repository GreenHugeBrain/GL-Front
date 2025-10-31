// app/layout.jsx - OPTIMIZED VERSION
import './globals.css'

export const metadata = {
  title: 'პროფესიული პლატფორმა',
  description: 'დაუკავშირდით საუკეთესო კლიენტებს და აჩვენეთ თქვენი პროფესიული გამოცდილება',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <head>
        {/* Preload critical resources */}
        <link 
          rel="preload" 
          href="/fonts/bpg-ingiri.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous"
        />
        
        {/* Critical CSS Inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical above-the-fold CSS */
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background-color: #F8F8F8;
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            /* Font face definitions with font-display: swap */
            @font-face {
              font-family: 'BPG Ingiri';
              src: url('/fonts/bpg-ingiri.woff2') format('woff2'),
                   url('/fonts/bpg-ingiri.woff') format('woff');
              font-display: swap;
              font-weight: normal;
              font-style: normal;
            }
            
            /* Reduce layout shift with fallback fonts */
            .font-loading {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .font-loaded {
              font-family: 'BPG Ingiri', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            /* Hero section minimal styles */
            .hero-section {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 400px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              text-align: center;
            }
            
            /* Reduce motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }
          `
        }} />
        
        {/* Non-critical CSS loaded asynchronously */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.min.css"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.min.css"
          media="print"
          onLoad="this.media='all'"
        />
        <noscript>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.min.css" />
        </noscript>
      </head>
      <body className="font-loading">
        {children}
        
        {/* Optimized font loading script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Optimized font loading
              (function() {
                try {
                  if ('fonts' in document) {
                    // Use Font Loading API for modern browsers
                    document.fonts.load('1em "BPG Ingiri"').then(function() {
                      document.documentElement.classList.remove('font-loading');
                      document.documentElement.classList.add('font-loaded');
                    }).catch(function() {
                      // Fallback if font loading fails
                      document.documentElement.classList.add('font-loaded');
                    });
                  } else {
                    // Fallback for older browsers
                    setTimeout(function() {
                      document.documentElement.classList.add('font-loaded');
                    }, 100);
                  }
                } catch (error) {
                  document.documentElement.classList.add('font-loaded');
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}