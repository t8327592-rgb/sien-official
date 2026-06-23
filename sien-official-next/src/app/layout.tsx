import type { Metadata } from "next";
import { Noto_Sans_JP, Jost } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sien-Official | 歌ってみたMIX・オリジナル楽曲制作",
  description: "歌ってみたMIX、オリジナル楽曲制作、ボーカルエディットなど。Sien-Officialのポートフォリオサイトです。",
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: "Sien-Official | 歌ってみたMIX・オリジナル楽曲制作",
    description: "歌ってみたMIX、オリジナル楽曲制作、ボーカルエディットなど。Sien-Officialのポートフォリオサイトです。",
    url: "https://sien-official.com",
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
    description: "歌ってみたMIX、オリジナル楽曲制作、ボーカルエディットなど。Sien-Officialのポートフォリオサイトです。",
    images: ["/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className={`${notoSansJP.variable} ${jost.variable} antialiased min-h-screen flex flex-col bg-[#FAFAFA] text-[#1D1D1F]`}>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
