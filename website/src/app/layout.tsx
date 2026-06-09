import type { Metadata } from "next";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export const metadata: Metadata = {
  title: "Scouts Kriko-M",
  description: "Scouts Kriko-M — Sint-Niklaas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/images/logo-finaal.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@300;400;900&family=Nunito:wght@600;700;800;900&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              if (window.location.pathname.startsWith('/portaal')) {
                document.body.classList.add('portal-theme', 'portaal');
                document.body.style.paddingTop = '0';
                document.body.style.backgroundColor = '#EEF5F1';
              }
            } catch (e) {}
          })();
        ` }} />
        {children}
      </body>
    </html>
  );
}
