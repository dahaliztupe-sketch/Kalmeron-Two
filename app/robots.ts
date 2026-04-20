import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/private/'],
    },
    sitemap: 'https://ais-dev-cmism2r4ts7kuphx6lzf5x-152637699957.europe-west1.run.app/sitemap.xml',
  };
}
