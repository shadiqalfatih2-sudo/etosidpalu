import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import { mediaUrl } from '@/lib/native-public';
import { SiteHeader, Footer } from '@/components/native/HomePreview';
import '../../etos-feature-pages.css';

type Props = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

async function getAwardee(id: string) {
  const { data, error } = await supabaseServer().from('awardees')
    .select('id,name,cohort,study_program,university,profile_summary,photo_url,photo_position,portfolio_url,awardee_status,display_status')
    .eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data || !['aktif', 'active', 'published'].includes(String(data.display_status || '').toLowerCase())) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await getAwardee(id);
  if (!person) return { title: 'Awardee tidak ditemukan | Etos ID Palu', robots: { index: false } };
  const description = String(person.profile_summary || `Kenali perjalanan ${person.name}, awardee Etos ID Palu.`).slice(0, 160);
  const canonical = `/awardee/${encodeURIComponent(person.id)}`;
  return { title: `${person.name} | Awardee Etos ID Palu`, description,
    alternates: { canonical }, robots: { index: true, follow: true },
    openGraph: { type: 'profile', title: `${person.name} | Etos ID Palu`, description, url: canonical,
      images: person.photo_url ? [{ url: mediaUrl(person.photo_url) }] : undefined } };
}

export default async function AwardeePage({ params }: Props) {
  const { id } = await params;
  const person = await getAwardee(id);
  if (!person) notFound();
  const portfolio = /^https?:\/\//i.test(person.portfolio_url || '') ? person.portfolio_url : '';
  return <>
    <SiteHeader />
    <main className="etos-feature-page">
      <div className="etos-feature-shell">
        <Link className="etos-feature-back" href="/#awardee">← Kembali ke Awardee</Link>
        <div className="etos-feature-lead">
          <div>
            <span className="etos-feature-eyebrow">PEOPLE OF ETOS · PALU</span>
            <h1 className="etos-feature-title">{person.name}</h1>
            <div className="etos-feature-meta">
              {person.cohort ? <span>Angkatan {person.cohort}</span> : null}
              {person.study_program ? <span>{person.study_program}</span> : null}
              {person.university ? <span>{person.university}</span> : null}
            </div>
            <p className="etos-feature-intro">Mengenal perjalanan, pembelajaran, dan kontribusi awardee Etos ID Palu.</p>
            {portfolio ? <a className="etos-feature-cta" href={portfolio} target="_blank" rel="noopener noreferrer">Lihat portofolio ↗</a> : null}
          </div>
          {person.photo_url ? <div className="etos-feature-media"><img src={mediaUrl(person.photo_url)} alt={person.name} style={{ objectPosition: person.photo_position || '50% 50%' }} /></div> : null}
        </div>
        {person.profile_summary ? <section className="etos-feature-content">
          <span className="etos-feature-eyebrow">PERJALANAN AWARDEE</span>
          <h2>Profil dan perjalanan</h2>
          <p>{person.profile_summary}</p>
        </section> : null}
      </div>
    </main>
    <Footer />
  </>;
}