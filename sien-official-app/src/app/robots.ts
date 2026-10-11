import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/login', '/order', '/summer-sale/order'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sien-official.com'}/sitemap.xml`,
  };
}
