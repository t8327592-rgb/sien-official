import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OpeningAnimation } from "@/components/ui/OpeningAnimation";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from '@next/third-parties/google';

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sien-official.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Sien-Official | 歌ってみたMIX・オリジナル楽曲制作",
  description: "【実績800件以上】あなたの歌声に、プロの説得力を。ボーカルMIX・マスタリングからオリジナル楽曲制作まで、業界標準のクオリティで制作をサポートします。",
  openGraph: {
    title: "Sien-Official | 歌ってみたMIX・オリジナル楽曲制作",
    description: "【実績800件以上】あなたの歌声に、プロの説得力を。ボーカルMIX・マスタリングからオリジナル楽曲制作まで、業界標準のクオリティで制作をサポートします。",
    url: baseUrl,
    siteName: "Sien-Official",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "Sien-Official OGP",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sien-Official | 歌ってみたMIX・オリジナル楽曲制作",
    description: "【実績800件以上】あなたの歌声に、プロの説得力を。ボーカルMIX・マスタリングからオリジナル楽曲制作まで、業界標準のクオリティで制作をサポートします。",
    images: ["/ogp.png"],
    creator: "@sien_mc09",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Sien-Official",
  "image": `${baseUrl}/logo.png`,
  "url": baseUrl,
  "description": "ボーカルMIX・マスタリングからオリジナル楽曲制作まで、業界標準のクオリティで制作をサポートします。",
  "priceRange": "¥"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        <OpeningAnimation />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-center" />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}
