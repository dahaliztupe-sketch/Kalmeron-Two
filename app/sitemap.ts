import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://ais-dev-cmism2r4ts7kuphx6lzf5x-152637699957.europe-west1.run.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://ais-dev-cmism2r4ts7kuphx6lzf5x-152637699957.europe-west1.run.app/chat',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
