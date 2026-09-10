import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import GlobalFooter from "@/components/GlobalFooter";
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
  title: {
    default: "Colegio Yangtsé | La Reina",
    template: "%s | Colegio Yangtsé",
  },
  description:
    "Colegio Yangtsé: información institucional, admisión, comunicados, reglamentos y contacto para nuestra comunidad educativa.",
  applicationName: "Colegio Yangtsé",
  authors: [
    {
      name: "Colegio Yangtsé",
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
    index: true,
    follow: true,
  },
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