import { cache } from 'react';
import { supabaseServer } from './supabase';
import { mediaUrl, type NativeAwardee, type NativeProgram } from './native-public';

export type NativeAwardeeProfile = NativeAwardee & {
  status: string;
  portfolio: string;
};

export type NativeProgramPhoto = {
  id: string;
  url: string;
  caption: string;
  position: string;
  order: number;
};

export type NativeProgramDetail = NativeProgram & {
  photos: NativeProgramPhoto[];
};

function active(value: unknown) {
  const status = String(value || 'Aktif').trim().toLowerCase();
  return !['nonaktif', 'inactive', 'draft', 'hidden'].includes(status);
}

function stripHtml(value: unknown) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapAwardee(row: Record<string, any>): NativeAwardeeProfile {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    status: String(row.awardee_status || 'Aktif'),
    cohort: String(row.cohort || ''),
    studyProgram: String(row.study_program || ''),
    university: String(row.university || ''),
    summary: String(row.profile_summary || ''),
    photo: mediaUrl(row.photo_url),
    photoPosition: String(row.photo_position || '50% 50%'),
    portfolio: String(row.portfolio_url || ''),
  };
}

function mapProgram(row: Record<string, any>): NativeProgram {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    category: String(row.category || 'Program Pembinaan Wilayah'),
    summary: String(row.summary || stripHtml(row.description).slice(0, 190)),
    description: String(row.description || ''),
    preview: mediaUrl(row.preview_url),
    icon: String(row.icon || 'ph-sparkle'),
  };
}

export async function getNativeAwardees(): Promise<NativeAwardeeProfile[]> {
  const db = supabaseServer();
  const { data, error } = await db.from('awardees').select('*').order('sort_order');
  if (error) throw error;
  return (data || []).filter((row) => active(row.display_status)).map(mapAwardee);
}

export const getNativeAwardeeDetail = cache(async (id: string): Promise<NativeAwardeeProfile | null> => {
  const db = supabaseServer();
  const { data, error } = await db.from('awardees').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data || !active(data.display_status)) return null;
  return mapAwardee(data);
});

export async function getNativePrograms(): Promise<NativeProgram[]> {
  const db = supabaseServer();
  const { data, error } = await db.from('programs').select('*').order('sort_order');
  if (error) throw error;
  return (data || []).filter((row) => active(row.status)).map(mapProgram);
}

export const getNativeProgramDetail = cache(async (id: string): Promise<NativeProgramDetail | null> => {
  const db = supabaseServer();
  const [{ data: program, error: programError }, { data: photos, error: photosError }] = await Promise.all([
    db.from('programs').select('*').eq('id', id).maybeSingle(),
    db.from('program_photos').select('*').eq('program_id', id).order('sort_order'),
  ]);

  if (programError) throw programError;
  if (photosError) throw photosError;
  if (!program || !active(program.status)) return null;

  const mappedPhotos: NativeProgramPhoto[] = (photos || [])
    .filter((photo) => active(photo.status) && photo.photo_url)
    .map((photo) => ({
      id: String(photo.id),
      url: mediaUrl(photo.photo_url),
      caption: String(photo.caption || ''),
      position: String(photo.photo_position || '50% 50%'),
      order: Number(photo.sort_order || 1),
    }));

  const base = mapProgram(program);
  if (base.preview && !mappedPhotos.some((photo) => photo.url === base.preview)) {
    mappedPhotos.unshift({
      id: `preview-${base.id}`,
      url: base.preview,
      caption: '',
      position: '50% 50%',
      order: 0,
    });
  }

  return { ...base, photos: mappedPhotos };
});
