import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseServer } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://etosidpalu.com';
const LEGACY_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZW52eXJ0c3djbWxscGhlc3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDUzOTgsImV4cCI6MjEwMzgyMTM5OH0.js7c2dYjWyges7PV16x1M-uqNm7jdUPss7Akj-y6FE4';

type AnyRow = Record<string, any>;

function driveId(url: string) {
  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]{10,})/, /\/d\/([a-zA-Z0-9_-]{10,})/, /[?&]id=([a-zA-Z0-9_-]{10,})/, /googleusercontent\.com\/d\/([a-zA-Z0-9_-]{10,})/];
  for (const p of patterns) { const m = url.match(p); if (m?.[1]) return m[1]; }
  return '';
}
function imageUrl(value: unknown) {
  const raw = String(value || '').trim();
  const id = driveId(raw);
  return id ? `https://lh3.googleusercontent.com/d/${id}=w2000` : raw;
}
function stripHtml(value: unknown) {
  return String(value || '').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/\s+/g,' ').trim();
}
function displayDate(v: unknown) {
  if (!v) return '';
  try { return new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Makassar',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(String(v))).replace(',', ''); } catch { return String(v); }
}
function publicPath(kind: string, slug: string) { return `/${kind.toLowerCase()==='berita'?'berita':'opini'}/${encodeURIComponent(slug)}`; }
function publicUrl(kind: string, slug: string) { return SITE_URL + publicPath(kind, slug); }
function clientKey(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const ua = req.headers.get('user-agent') || '';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex');
}
async function activePrograms() {
  const db = supabaseServer();
  const [{ data: programs, error: pe }, { data: photos, error: phe }] = await Promise.all([
    db.from('programs').select('*').order('sort_order'),
    db.from('program_photos').select('*').order('sort_order')
  ]);
  if (pe) throw pe; if (phe) throw phe;
  const byProgram = new Map<string, AnyRow[]>();
  for (const ph of photos || []) {
    const arr = byProgram.get(ph.program_id) || [];
    arr.push({ id:ph.id, url:imageUrl(ph.photo_url), rawUrl:ph.photo_url, caption:ph.caption||'', order:ph.sort_order||1, position:ph.photo_position||'50% 50%' });
    byProgram.set(ph.program_id, arr);
  }
  return (programs || []).map((p:AnyRow) => {
    let list = (byProgram.get(p.id)||[]).slice().sort((a,b)=>a.order-b.order);
    const legacy = [p.legacy_photo_1,p.legacy_photo_2,p.legacy_photo_3,p.legacy_photo_4].filter(Boolean).map((u:string,i:number)=>({id:`LEGACY-${p.id}-${i+1}`,url:imageUrl(u),rawUrl:u,caption:'',order:901+i,position:'50% 50%'}));
    for(const l of legacy) if(!list.some(x=>x.url===l.url)) list.push(l);
    const real = list.filter(x=>!String(x.rawUrl||x.url).toLowerCase().includes('placehold.co') && !String(x.caption||'').toLowerCase().includes('ganti dengan dokumentasi'));
    if(real.length) list=real;
    list.sort((a,b)=>a.order-b.order);
    let preview=imageUrl(p.preview_url);
    if((!preview || preview.includes('placehold.co')) && list.length) preview=list[0].url;
    if(preview && !list.some(x=>x.url===preview)) list.unshift({id:`PREVIEW-${p.id}`,url:preview,rawUrl:p.preview_url||preview,caption:'',order:0,position:'50% 50%'});
    return { id:p.id,nama:p.name,kategori:p.category||'Program Pembinaan Wilayah',ringkasan:p.summary||stripHtml(p.description).slice(0,175),deskripsi:p.description||'',preview,icon:p.icon||'ph-sparkle',urutan:p.sort_order||1,photos:list };
  });
}
async function publicAwardees() {
  const db=supabaseServer(); const {data,error}=await db.from('awardees').select('*').order('sort_order'); if(error) throw error;
  return (data||[]).map((a:AnyRow)=>({id:a.id,nama:a.name,statusAwardee:/alumni|lulus/i.test(a.awardee_status||'')?'Alumni':'Aktif',angkatan:a.cohort||'',prodi:a.study_program||'',universitas:a.university||'',profil:a.profile_summary||'',foto:imageUrl(a.photo_url),fotoRaw:a.photo_url||'',fotoPosition:a.photo_position||'50% 50%',portofolio:a.portfolio_url||'',urutan:a.sort_order||1,statusTampil:'Aktif'}));
}
async function heroSlides() {
  const db=supabaseServer(); const {data,error}=await db.from('hero_slides').select('*').order('sort_order').limit(5); if(error) throw error;
  return (data||[]).map((h:AnyRow)=>({id:h.id,foto:imageUrl(h.photo_url),fotoRaw:h.photo_url,judul:h.title||'',subjudul:h.subtitle||'',posisi:h.photo_position||'50% 50%',urutan:h.sort_order||1,tautan:h.link_url||''}));
}
async function publications(offset=0, limit=10) {
  const db=supabaseServer();
  const [{data:news,error:ne},{data:articles,error:ae}] = await Promise.all([db.from('news').select('*'),db.from('articles').select('*')]);
  if(ne) throw ne; if(ae) throw ae;
  const combined:any[]=[];
  for(const n of news||[]) { const excerpt=stripHtml(n.content_html).slice(0,320); combined.push({jenis:'Berita',id:n.id,tanggal:displayDate(n.published_at||n.created_at),judul:n.title,slug:n.slug,isi:excerpt,excerpt,thumb:imageUrl(n.thumbnail_url),thumbPosition:n.thumbnail_position||'50% 50%',penulis:'Admin Etos ID',url:publicUrl('Berita',n.slug),_date:n.published_at||n.created_at}); }
  for(const a of articles||[]) { const excerpt=stripHtml(a.content_html).slice(0,320); combined.push({jenis:'Opini',id:a.id,tanggal:displayDate(a.published_at||a.created_at),penulis:a.author_name,aktivitas:a.activity||'',judul:a.title,slug:a.slug,isi:excerpt,excerpt,thumb:imageUrl(a.thumbnail_url),thumbPosition:a.thumbnail_position||'50% 50%',url:publicUrl('Opini',a.slug),_date:a.published_at||a.created_at}); }
  combined.sort((x,y)=>new Date(y._date||0).getTime()-new Date(x._date||0).getTime()); combined.forEach(x=>delete x._date);
  return {data:combined.slice(offset,offset+limit),hasMore:offset+limit<combined.length};
}
async function detail(slug:string) {
  const db=supabaseServer();
  const {data:n}=await db.from('news').select('*').eq('slug',slug).maybeSingle();
  if(n) return {id:n.id,slug:n.slug,jenis:'Berita',tanggal:displayDate(n.published_at||n.created_at),judul:n.title,isi:n.content_html||'',excerpt:stripHtml(n.content_html).slice(0,320),thumb:imageUrl(n.thumbnail_url),thumbPosition:n.thumbnail_position||'50% 50%',penulis:'Admin Etos ID',aktivitas:'',url:publicUrl('Berita',n.slug),path:publicPath('Berita',n.slug)};
  const {data:a}=await db.from('articles').select('*').eq('slug',slug).maybeSingle();
  if(a) return {id:a.id,slug:a.slug,jenis:'Opini',tanggal:displayDate(a.published_at||a.created_at),penulis:a.author_name||'Etos ID Palu',aktivitas:a.activity||'',judul:a.title,isi:a.content_html||'',excerpt:stripHtml(a.content_html).slice(0,320),thumb:imageUrl(a.thumbnail_url),thumbPosition:a.thumbnail_position||'50% 50%',url:publicUrl('Opini',a.slug),path:publicPath('Opini',a.slug)};
  return null;
}
function asJsonString(value:any){ return JSON.stringify(value); }

export async function POST(req: NextRequest) {
  try {
    const body=await req.json(); const fn=String(body?.fn||''); const args=Array.isArray(body?.args)?body.args:[];
    const token=req.headers.get('x-etos-admin-token')||''; const db=supabaseServer(); let result:any;
    switch(fn){
      case 'getPublicData': { const type=String(args[0]||''); if(type==='program') result=asJsonString(await activePrograms()); else if(type==='awardee') result=asJsonString(await publicAwardees()); else if(type==='hero') result=asJsonString(await heroSlides()); else if(type==='berita_opini') result=asJsonString(await publications(Number(args[1]||0),Number(args[2]||10))); else result='[]'; break; }
      case 'getDetailBySlug': result=asJsonString(await detail(String(args[0]||''))); break;
      case 'loginAdmin': { const {data,error}=await db.rpc('etos_open_admin_session',{p_username:String(args[0]||''),p_password:String(args[1]||''),p_client_key:clientKey(req)}); if(error) throw error; result=asJsonString(data||{status:'error',message:'Login gagal.'}); break; }
      case 'logoutAdmin': { if(token) await db.rpc('etos_close_admin_session',{p_token:token}); result=asJsonString({status:'success'}); break; }
      case 'getAdminData': { const {data,error}=await db.rpc('etos_admin_read',{p_token:token,p_type:String(args[0]||'')}); if(error) throw error; result=asJsonString(data||[]); break; }
      case 'getAdminProgramPhotos': { const {data,error}=await db.rpc('etos_admin_program_media',{p_token:token}); if(error) throw error; result=asJsonString(data); break; }
      case 'saveAwardeeAdmin': { const {data,error}=await db.rpc('etos_admin_mutation',{p_token:token,p_action:'save_awardee',p_data:args[0]||{}}); if(error) throw error; result=asJsonString(data); break; }
      case 'saveProgramPhotoAdmin': { const {data,error}=await db.rpc('etos_admin_mutation',{p_token:token,p_action:'save_program_photo',p_data:args[0]||{}}); if(error) throw error; result=asJsonString(data); break; }
      case 'saveBeritaAdmin': { const {data,error}=await db.rpc('etos_admin_mutation',{p_token:token,p_action:'save_news',p_data:args[0]||{}}); if(error) throw error; result=asJsonString(data); break; }
      case 'saveArtikelReview': { const {data,error}=await db.rpc('etos_admin_mutation',{p_token:token,p_action:'save_article_review',p_data:args[0]||{}}); if(error) throw error; result=asJsonString(data); break; }
      case 'updateArtikelStatus': { const payload={id:args[0],status:args[1],...(args.length>2?{content:args[2]}:{})}; const {data,error}=await db.rpc('etos_admin_mutation',{p_token:token,p_action:'update_article_status',p_data:payload}); if(error) throw error; result=asJsonString(data); break; }
      case 'submitArtikelUser': { const {data,error}=await db.rpc('etos_submit_article',{p_data:args[0]||{},p_client_key:clientKey(req)}); if(error) throw error; result=asJsonString(data); break; }
      case 'uploadImageToDrive': {
        const edge=await fetch(`${SUPABASE_URL}/functions/v1/etos-media-upload`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY,'Authorization':`Bearer ${LEGACY_ANON_KEY}`},body:JSON.stringify({dataUrl:String(args[0]||''),fileName:String(args[1]||'image'),adminToken:token,clientKey:clientKey(req)})});
        const data=await edge.json(); result=asJsonString(data); break;
      }
      default: throw new Error(`RPC ${fn} belum didukung.`);
    }
    return NextResponse.json({result});
  } catch(error:any) {
    return NextResponse.json({error:error?.message||String(error)},{status:400});
  }
}
