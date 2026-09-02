import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabase';

const SITE = 'https://www.etosidpalu.com';

function isActive(value: unknown) {
  const status = String(value || 'Aktif').trim().toLowerCase();
  return !['nonaktif', 'inactive', 'draft', 'hidden'].includes(status);
}

function asDate(value: unknown) {
  const date = value ? new Date(String(value)) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = supabaseServer();
  const [newsResult, articleResult] = await Promise.all([
    db.from('news').select('slug,status,published_at,updated_at,created_at'),
    db.from('articles').select('slug,status,published_at,updated_at,created_at').eq('status', 'Approved'),
  ]);

  const base: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/kirim-tulisan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.55 },
  ];

  const news = (newsResult.data || [])
    .filter((row) => isActive(row.status) && row.slug)
    .map((row) => ({
      url: `${SITE}/berita/${encodeURIComponent(String(row.slug))}`,
      lastModified: asDate(row.updated_at || row.published_at || row.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  const articles = (articleResult.data || [])
    .filter((row) => row.slug)
    .map((row) => ({
      url: `${SITE}/opini/${encodeURIComponent(String(row.slug))}`,
      lastModified: asDate(row.updated_at || row.published_at || row.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }));

  return [...base, ...news, ...articles];
}
