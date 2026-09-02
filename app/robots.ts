import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/native-preview', '/native-preview/'],
      },
    ],
    sitemap: 'https://www.etosidpalu.com/sitemap.xml',
    host: 'https://www.etosidpalu.com',
  };
}
