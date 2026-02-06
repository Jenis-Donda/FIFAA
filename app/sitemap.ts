import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://example.com';
  
  // Static routes
  const staticRoutes = [
    '',
    '/news',
    '/world-rankings',
    '/match-score',
    '/tournaments',
    '/tournaments/mens/football/worldcup2026',
    '/tournaments/mens/football/worldcup2026/scores-fixtures',
    '/tournaments/mens/football/worldcup2026/standings',
    '/tournaments/mens/football/worldcup2026/teams',
    '/tournaments/mens/football/worldcup2026/host-cities',
  ];

  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    staticRoutes.forEach((route) => {
      const url = `${baseUrl}/${locale}${route}`;
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : route === '/news' ? 'hourly' : 'weekly',
        priority: route === '' ? 1.0 : route === '/news' ? 0.9 : 0.8,
      });
    });
  });

  return sitemapEntries;
}

