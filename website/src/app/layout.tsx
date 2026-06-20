import type { Metadata } from "next";
import { Outfit, Nunito, Londrina_Solid } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ThemeSynchronizer from "@/components/ThemeSynchronizer";

// Zelf-gehoste fonts (next/font) i.p.v. de Google Fonts CDN — sneller en
// GDPR-vriendelijk (geen verbinding met Google bij paginabezoek).
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-outfit", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-nunito", display: "swap" });
const londrina = Londrina_Solid({ subsets: ["latin"], weight: ["300", "400", "900"], variable: "--font-londrina", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kriko-m.be";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Scouts Kriko-M",
    template: "%s · Scouts Kriko-M",
  },
  description: "Scouts & Gidsen Kriko-M uit Sint-Niklaas — info over de takken, kalender, Kriko Echo, verhuur en de webshop.",
  openGraph: {
    title: "Scouts Kriko-M",
    description: "Scouts & Gidsen Kriko-M uit Sint-Niklaas — takken, kalender, Kriko Echo, verhuur en webshop.",
    url: SITE_URL,
    siteName: "Scouts Kriko-M",
    locale: "nl_BE",
    type: "website",
    images: [{ url: "/images/logo-finaal.png", width: 512, height: 512, alt: "Scouts Kriko-M" }],
  },
  twitter: {
    card: "summary",
    title: "Scouts Kriko-M",
    description: "Scouts & Gidsen Kriko-M uit Sint-Niklaas.",
    images: ["/images/logo-finaal.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${outfit.variable} ${nunito.variable} ${londrina.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/png" href="/images/logo-finaal.png" />
      </head>
      <body suppressHydrationWarning>
        <ThemeSynchronizer />
        {children}
      </body>
    </html>
  );
}
