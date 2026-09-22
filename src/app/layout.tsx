import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import GlobalFooter from "@/components/GlobalFooter";
import { siteConfig } from "@/config/site";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | La Reina`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [
    {
      name: siteConfig.name,
    },
  ],
  keywords: [
    "Colegio Yangtsé",
    "Colegio La Reina",
    "Educación",
    "Admisión escolar",
    "Comunidad educativa",
  ],
  robots: {
    index: siteConfig.allowIndexing,
    follow: siteConfig.allowIndexing,
    googleBot: {
      index: siteConfig.allowIndexing,
      follow: siteConfig.allowIndexing,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | La Reina`,
    description: siteConfig.description,
    images: [
      {
        url: "/images/logo-colegio-yangtse.png",
        width: 333,
        height: 334,
        alt: `Emblema del ${siteConfig.name}`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} | La Reina`,
    description: siteConfig.description,
    images: ["/images/logo-colegio-yangtse.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
    >
      <body
        className={`${dmSans.variable} ${fraunces.variable}`}
      >
        {children}
        <GlobalFooter />
      </body>
    </html>
  );
}
