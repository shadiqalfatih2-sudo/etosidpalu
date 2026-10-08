import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { supabaseServer } from '@/lib/supabase';
import { mediaUrl } from '@/lib/native-public';
import { SiteHeader, Footer } from '@/components/native/HomePreview';
import '../../etos-feature-pages.css';

type Props = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

async function findProgram(id: string) {
  const db = supabaseServer();
  const { data, error } = await db.from('programs')
    .select('id,name,category,description,summary,preview_url,status').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data || !['aktif', 'active', 'published'].includes(String(data.status || '').toLowerCase())) return null;
  return data;
}

function summary(value: string) { return sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim(); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const program = await findProgram(id);
  if (!program) return { title: 'Program tidak ditemukan | Etos ID Palu', robots: { index: false } };
  const description = summary(program.summary || program.description || '').slice(0, 170);
  const canonical = `/program/${encodeURIComponent(program.id)}`;
  return { title: `${program.name} | Program Etos ID Palu`, description,
    alternates: { canonical }, robots: { index: true, follow: true },
    openGraph: { type: 'website', title: program.name, description, url: canonical,
      images: program.preview_url ? [{ url: mediaUrl(program.preview_url) }] : undefined } };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params;
  const program = await findProgram(id);
  if (!program) notFound();
  const { data: media } = await supabaseServer().from('program_photos')
    .select('id,photo_url,caption,photo_position,status').eq('program_id', id)
    .order('sort_order', { ascending: true }).limit(24);
  const photos = (media || []).filter((photo) => ['aktif', 'active', 'published'].includes(String(photo.status || '').toLowerCase()) && photo.photo_url);
  const html = sanitizeHtml(String(program.description || ''), {
    allowedTags: ['p','br','strong','b','em','i','ul','ol','li','h2','h3','a','blockquote'],
    allowedAttributes: { a: ['href','title','target','rel'] },
    allowedSchemes: ['https','http','mailto'],
  });
  return <>
    <SiteHeader />
    <main className="etos-feature-page">
      <div className="etos-feature-shell">
        <Link className="etos-feature-back" href="/#program">← Kembali ke Program</Link>
        <div className="etos-feature-lead">
          <div>
            <span className="etos-feature-eyebrow">PROGRAM ETOS ID PALU</span>
            <h1 className="etos-feature-title">{program.name}</h1>
            {program.category ? <div className="etos-feature-meta"><span>{program.category}</span></div> : null}
            {program.summary ? <p className="etos-feature-intro">{program.summary}</p> : null}
          </div>
          {program.preview_url ? <div className="etos-feature-media"><img src={mediaUrl(program.preview_url)} alt={program.name} /></div> : null}
        </div>
        {html ? <section className="etos-feature-content">
          <span className="etos-feature-eyebrow">PROSES DAN PEMBELAJARAN</span>
          <h2>Lebih dekat dengan program</h2>
          <div className="etos-feature-html" dangerouslySetInnerHTML={{ __html: html }} />
        </section> : null}
        {photos.length ? <section className="etos-feature-content">
          <span className="etos-feature-eyebrow">DOKUMENTASI PROGRAM</span>
          <h2>Galeri kegiatan</h2>
          <div className="etos-feature-photos">
            {photos.map((photo) => <figure key={photo.id}>
              <img src={mediaUrl(photo.photo_url)} alt={photo.caption || `Dokumentasi ${program.name}`} loading="lazy" style={{ objectPosition: photo.photo_position || '50% 50%' }} />
              {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
            </figure>)}
          </div>
        </section> : null}
      </div>
    </main>
    <Footer />
  </>;
}