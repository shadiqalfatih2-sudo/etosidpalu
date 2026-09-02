import { supabaseServer } from './supabase';

export type NativeHero = {
  id: string;
  title: string;
  subtitle: string;
  photo: string;
  photoPosition: string;
  link: string;
};

export type NativeProgram = {
  id: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  preview: string;
  icon: string;
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

export async function getNativeHomeData() {
  const db = supabaseServer();
  const [
    { data: heroRows, error: heroError },
    { data: programRows, error: programError },
    { data: awardeeRows, error: awardeeError },
    { data: newsRows, error: newsError },
    { data: articleRows, error: articleError },
  ] = await Promise.all([
    db.from('hero_slides').select('*').order('sort_order'),
    db.from('programs').select('*').order('sort_order'),
    db.from('awardees').select('*').order('sort_order'),
    db.from('news').select('*').order('published_at', { ascending: false }),
    db.from('articles').select('*').eq('status', 'Approved').order('published_at', { ascending: false }),
  ]);

  if (heroError) throw heroError;
  if (programError) throw programError;
  if (awardeeError) throw awardeeError;
  if (newsError) throw newsError;
  if (articleError) throw articleError;

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
    .map((row) => ({
      id: String(row.id),
      name: String(row.name || ''),
      category: String(row.category || 'Program Pembinaan Wilayah'),
      summary: String(row.summary || stripHtml(row.description).slice(0, 190)),
      description: String(row.description || ''),
      preview: mediaUrl(row.preview_url),
      icon: String(row.icon || 'ph-sparkle'),
    }));

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
    }));

  const publications: NativePublication[] = [
    ...(newsRows || [])
      .filter((row) => active(row.status))
      .map((row) => ({
        id: String(row.id),
        kind: 'Berita' as const,
        title: String(row.title || ''),
        slug: String(row.slug || ''),
        excerpt: stripHtml(row.content_html).slice(0, 180),
        thumbnail: mediaUrl(row.thumbnail_url),
        publishedAt: publicationDate(row),
      })),
    ...(articleRows || []).map((row) => ({
      id: String(row.id),
      kind: 'Opini' as const,
      title: String(row.title || ''),
      slug: String(row.slug || ''),
      excerpt: stripHtml(row.content_html).slice(0, 180),
      thumbnail: mediaUrl(row.thumbnail_url),
      publishedAt: publicationDate(row),
    })),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const stats: NativeHomeStats = {
    awardees: awardees.length,
    programs: programs.length,
    publications: publications.length,
  };

  return {
    heroes: heroes.slice(0, 5),
    programs: programs.slice(0, 8),
    awardees: awardees.slice(0, 8),
    publications: publications.slice(0, 6),
    stats,
  };
}
