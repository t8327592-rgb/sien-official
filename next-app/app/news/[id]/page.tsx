import { kv } from '@vercel/kv';
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

// Fetch news data
async function getNewsItem(id: string) {
  const newsList: any[] = (await kv.get('site_news_list')) || [];
  return newsList.find((n) => n.id === id);
}

// Generate dynamic metadata (SEO & OGP)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const news = await getNewsItem(params.id);

  if (!news) {
    return {
      title: 'お知らせが見つかりません | Sien-Official',
    };
  }

  // Optionally support image from KV if it exists, else default
  const ogImageUrl = news.imageUrl || 'https://sien-official.vercel.app/assets/ogp.png?v=20260203';
  const description = news.content 
    ? news.content.substring(0, 100) + '...' 
    : '【実績800件以上】あなたの歌声に、プロの説得力を。';

  return {
    title: `${news.title} | Sien-Official お知らせ`,
    description: description,
    openGraph: {
      title: `${news.title} | Sien-Official お知らせ`,
      description: description,
      url: `https://sien-official.vercel.app/news/${params.id}`,
      siteName: 'Sien-Official',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'ja_JP',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@sien_mc09',
    },
  };
}

// Page Component
export default async function NewsDetailPage({ params }: Props) {
  const news = await getNewsItem(params.id);

  if (!news) {
    notFound();
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>お知らせ詳細</h1>
          <p className="page-subtitle">News Detail</p>
        </div>
      </div>
      <section className="section bg-light-blue" style={{ minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
            <span className="news-date" style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '1.1rem' }}>
              {new Date(news.date).toLocaleDateString()}
            </span>
            <h1 style={{ fontSize: '2rem', marginTop: '10px', color: '#1e293b' }}>
              {news.title}
            </h1>
          </div>
          <div
            className="news-content-body"
            style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#334155' }}
            dangerouslySetInnerHTML={{ __html: news.content ? news.content.replace(/\n/g, '<br/>') : '' }}
          />
          <div className="text-center mt-5">
            <Link href="/news" className="btn btn-outline">
              お知らせ一覧へ戻る
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
