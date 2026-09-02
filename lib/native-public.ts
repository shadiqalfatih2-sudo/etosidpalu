import { supabaseServer } from './supabase';

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

function stripHtml(value: unknown) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function active(value: unknown) {
  const status = String(value || 'Aktif').toLowerCase();
  return !['nonaktif', 'inactive', 'draft', 'hidden'].includes(status);
}

function mediaUrl(value: unknown) {
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

export async function getNativeHomeData() {
  const db = supabaseServer();
  const [{ data: awardees, error: awardeeError }, { data: news, error: newsError }, { data: articles, error: articleError }] = await Promise.all([
    db.from('awardees').select('*').order('sort_order').limit(8),
    db.from('news').select('*').order('published_at', { ascending: false }).limit(8),
    db.from('articles').select('*').eq('status', 'Approved').order('published_at', { ascending: false }).limit(8),
  ]);

  if (awardeeError) throw awardeeError;
  if (newsError) throw newsError;
  if (articleError) throw articleError;

  const mappedAwardees: NativeAwardee[] = (awardees || []).filter((row) => active(row.display_status)).map((row) => ({
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
    ...(news || []).filter((row) => active(row.status)).map((row) => ({
      id: String(row.id), kind: 'Berita' as const, title: String(row.title || ''), slug: String(row.slug || ''),
      excerpt: stripHtml(row.content_html).slice(0, 170), thumbnail: mediaUrl(row.thumbnail_url), publishedAt: String(row.published_at || row.created_at || ''),
    })),
    ...(articles || []).map((row) => ({
      id: String(row.id), kind: 'Opini' as const, title: String(row.title || ''), slug: String(row.slug || ''),
      excerpt: stripHtml(row.content_html).slice(0, 170), thumbnail: mediaUrl(row.thumbnail_url), publishedAt: String(row.published_at || row.created_at || ''),
    })),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 6);

  return { awardees: mappedAwardees, publications };
}
