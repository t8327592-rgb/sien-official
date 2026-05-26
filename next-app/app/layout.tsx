import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sien-Official | ミックス／マスタリングエンジニア",
  description:
    "【実績800件以上】あなたの歌声に、プロの説得力を。ボーカルMIX・マスタリングからオリジナル楽曲制作まで、業界標準のクオリティで制作をサポートします。",
  openGraph: {
    title: "Sien-Official | 歌ってみたMIX・オリジナル楽曲制作",
    description:
      "【実績800件以上】あなたの歌声に、プロの説得力を。ボーカルMIX・マスタリングからオリジナル楽曲制作まで、業界標準のクオリティで制作をサポートします。",
    url: "https://sien-official.vercel.app/",
    siteName: "Sien-Official",
    images: [
      {
        url: "https://sien-official.vercel.app/assets/ogp.png?v=20260203",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@sien_mc09",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script src="https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.min.js"></script>
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
