import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { supabaseServer } from './supabase';

export type NativeHero = {
  id: string;
  title: string;
  subtitle: string;
  photo: string;
  photoPosition: string;
  link: string;
};

export type NativeProgramPhoto = {
  id: string;
  url: string;
  caption: string;
  position: string;
  order: number;
};

export type NativeProgram = {
  id: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  preview: string;
  icon: string;
  photos?: NativeProgramPhoto[];
};

export type NativeAwardee = {
  id: string;
  name: string;
  cohort: string;
  studyProgram: string;
  university: string;
  summary: string;
  photo: string;
  photoPosition: string;
  status?: string;
  portfolio?: string;
};

export type NativePublication = {
  id: string;
  kind: 'Berita' | 'Opini';
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  publishedAt: string;
};

export type NativePublicationDetail = NativePublication & {
  author: string;
  activity: string;
  contentHtml: string;
  thumbnailPosition: string;
};

export type NativeHomeStats = {
  awardees: number;
  programs: number;
  publications: number;
};

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

export function mediaUrl(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/,
    /\/d\/([a-zA-Z0-9_-]{10,})/,
    /[?&]id=([a-zA-Z0-9_-]{10,})/,
    /googleusercontent\.com\/d\/([a-zA-Z0-9_-]{10,})/,
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return `https://lh3.googleusercontent.com/d/${match[1]}=w2000`;
  }
  return raw;
}

function publicationDate(row: Record<string, unknown>) {
  return String(row.published_at || row.created_at || '');
}

function mapNews(row: Record<string, any>, full = false): NativePublication | NativePublicationDetail {
  const excerpt = stripHtml(row.content_html).slice(0, 180);
  const base: NativePublication = {
    id: String(row.id),
    kind: 'Berita',
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    excerpt,
    thumbnail: mediaUrl(row.thumbnail_url),
    publishedAt: publicationDate(row),
  };
  if (!full) return base;
  return {
    ...base,
    author: 'Admin Etos ID',
    activity: '',
    contentHtml: String(row.content_html || ''),
    thumbnailPosition: String(row.thumbnail_position || '50% 50%'),
  };
}

function mapArticle(row: Record<string, any>, full = false): NativePublication | NativePublicationDetail {
  const excerpt = stripHtml(row.content_html).slice(0, 180);
  const base: NativePublication = {
    id: String(row.id),
    kind: 'Opini',
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    excerpt,
    thumbnail: mediaUrl(row.thumbnail_url),
    publishedAt: publicationDate(row),
  };
  if (!full) return base;
  return {
    ...base,
    author: String(row.author_name || 'Etos ID Palu'),
    activity: String(row.activity || ''),
    contentHtml: String(row.content_html || ''),
    thumbnailPosition: String(row.thumbnail_position || '50% 50%'),
  };
}

const getNativeHomeDataCached = unstable_cache(
  async () => {
    const db = supabaseServer();
    const [
      { data: heroRows, error: heroError },
      { data: programRows, error: programError },
      { data: programPhotoRows, error: programPhotoError },
      { data: awardeeRows, error: awardeeError },
      { data: newsRows, error: newsError },
      { data: articleRows, error: articleError },
    ] = await Promise.all([
      db.from('hero_slides').select('id,title,subtitle,photo_url,photo_position,link_url,status,sort_order').order('sort_order'),
      db.from('programs').select('id,name,category,summary,description,preview_url,icon,status,sort_order').order('sort_order'),
      db.from('program_photos').select('id,program_id,photo_url,caption,photo_position,sort_order,status').order('sort_order'),
      db.from('awardees').select('id,name,cohort,study_program,university,profile_summary,photo_url,photo_position,display_status,awardee_status,portfolio_url,sort_order').order('sort_order'),
      db.from('news').select('id,title,slug,content_html,thumbnail_url,published_at,created_at,status').order('published_at', { ascending: false }),
      db.from('articles').select('id,title,slug,content_html,thumbnail_url,published_at,created_at,status').eq('status', 'Approved').order('published_at', { ascending: false }),
    ]);

    if (heroError) throw heroError;
    if (programError) throw programError;
    if (programPhotoError) throw programPhotoError;
    if (awardeeError) throw awardeeError;
    if (newsError) throw newsError;
    if (articleError) throw articleError;

    const photosByProgram = new Map<string, NativeProgramPhoto[]>();
    for (const row of programPhotoRows || []) {
      if (!active(row.status) || !row.photo_url) continue;
      const programId = String(row.program_id || '');
      if (!programId) continue;
      const current = photosByProgram.get(programId) || [];
      current.push({
        id: String(row.id),
        url: mediaUrl(row.photo_url),
        caption: String(row.caption || ''),
        position: String(row.photo_position || '50% 50%'),
        order: Number(row.sort_order || 1),
      });
      photosByProgram.set(programId, current);
    }

    const heroes: NativeHero[] = (heroRows || [])
      .filter((row) => active(row.status))
      .map((row) => ({
        id: String(row.id),
        title: String(row.title || 'Etos ID Palu'),
        subtitle: String(row.subtitle || ''),
        photo: mediaUrl(row.photo_url),
        photoPosition: String(row.photo_position || '50% 50%'),
        link: String(row.link_url || ''),
      }));

    const programs: NativeProgram[] = (programRows || [])
      .filter((row) => active(row.status))
      .map((row) => {
        const id = String(row.id);
        return {
          id,
          name: String(row.name || ''),
          category: String(row.category || 'Program Pembinaan Wilayah'),
          summary: String(row.summary || stripHtml(row.description).slice(0, 190)),
          description: stripHtml(row.description),
          preview: mediaUrl(row.preview_url),
          icon: String(row.icon || 'ph-sparkle'),
          photos: (photosByProgram.get(id) || [])
            .sort((a, b) => a.order - b.order)
            .slice(0, 8),
        };
      });

    const awardees: NativeAwardee[] = (awardeeRows || [])
      .filter((row) => active(row.display_status))
      .map((row) => ({
        id: String(row.id),
        name: String(row.name || ''),
        cohort: String(row.cohort || ''),
        studyProgram: String(row.study_program || ''),
        university: String(row.university || ''),
        summary: String(row.profile_summary || ''),
        photo: mediaUrl(row.photo_url),
        photoPosition: String(row.photo_position || '50% 50%'),
        status: String(row.awardee_status || 'Aktif'),
        portfolio: String(row.portfolio_url || ''),
      }));

    const publications: NativePublication[] = [
      ...(newsRows || []).filter((row) => active(row.status)).map((row) => mapNews(row, false) as NativePublication),
      ...(articleRows || []).map((row) => mapArticle(row, false) as NativePublication),
    ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const stats: NativeHomeStats = {
      awardees: awardees.length,
      programs: programs.length,
      publications: publications.length,
    };

    return {
      heroes: heroes.slice(0, 5),
      programs,
      awardees,
      publications: publications.slice(0, 6),
      stats,
    };
  },
  ['native-home-v5'],
  { revalidate: 300, tags: ['public-home'] },
);

export async function getNativeHomeData() {
  return getNativeHomeDataCached();
}

export const getNativePublicationDetail = cache(async (kindParam: string, slug: string) => {
  const kind = String(kindParam || '').toLowerCase();
  if (kind !== 'berita' && kind !== 'opini') return null;

  const db = supabaseServer();
  const table = kind === 'berita' ? 'news' : 'articles';
  const { data: row, error } = await db.from(table).select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!row) return null;

  if (kind === 'berita' && !active(row.status)) return null;
  if (kind === 'opini' && String(row.status || '').toLowerCase() !== 'approved') return null;

  const detail = (kind === 'berita' ? mapNews(row, true) : mapArticle(row, true)) as NativePublicationDetail;

  let relatedQuery = db.from(table).select('*').neq('slug', slug).order('published_at', { ascending: false }).limit(8);
  if (kind === 'opini') relatedQuery = relatedQuery.eq('status', 'Approved');
  const { data: relatedRows, error: relatedError } = await relatedQuery;
  if (relatedError) throw relatedError;

  const related = (relatedRows || [])
    .filter((item) => kind === 'opini' || active(item.status))
    .slice(0, 5)
    .map((item) => (kind === 'berita' ? mapNews(item, false) : mapArticle(item, false)) as NativePublication);

  return { detail, related };
});
