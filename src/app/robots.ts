import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://raisy.app';
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
