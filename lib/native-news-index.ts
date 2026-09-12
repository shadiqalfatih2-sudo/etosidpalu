import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { NativePublication } from './native-public';
import { mediaUrl } from './native-public';
import { supabaseServer } from './supabase';

function stripHtml(value: unknown) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function active(value: unknown) {
  const status = String(value || 'Aktif').trim().toLowerCase();
  return !['nonaktif', 'inactive', 'draft', 'hidden'].includes(status);
}

const getNativeNewsIndexCached = unstable_cache(
  async () => {
    const db = supabaseServer();
    const { data, error } = await db
      .from('news')
      .select('id,title,slug,content_html,thumbnail_url,published_at,created_at,status')
      .order('published_at', { ascending: false });

    if (error) throw error;

    return (data || [])
      .filter((row) => row.slug && active(row.status))
      .map((row): NativePublication => ({
        id: String(row.id),
        kind: 'Berita',
        title: String(row.title || ''),
        slug: String(row.slug || ''),
        excerpt: stripHtml(row.content_html).slice(0, 200),
        thumbnail: mediaUrl(row.thumbnail_url),
        publishedAt: String(row.published_at || row.created_at || ''),
      }));
  },
  ['native-news-index-v1'],
  { revalidate: 300, tags: ['public-publications', 'public-news-index'] },
);

export const getNativeNewsIndex = cache(() => getNativeNewsIndexCached());
