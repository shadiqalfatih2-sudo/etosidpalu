import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: '#f7faf8', color: '#183127', display: 'grid', placeItems: 'center', padding: '32px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <section style={{ width: 'min(760px, 100%)', background: '#fff', border: '1px solid #dfe8e3', borderRadius: '28px', padding: 'clamp(28px, 6vw, 64px)', boxShadow: '0 24px 70px rgba(25, 79, 58, .08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '34px' }}>
          <img src="/assets/etos-id.png" alt="Etos ID" width="108" height="36" />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.16em', color: '#2b7659' }}>PALU</span>
        </div>
        <div style={{ color: '#2b7659', fontSize: '12px', fontWeight: 800, letterSpacing: '.14em', marginBottom: '12px' }}>404 • HALAMAN TIDAK DITEMUKAN</div>
        <h1 style={{ fontFamily: 'Georgia, Times New Roman, serif', fontSize: 'clamp(38px, 7vw, 70px)', lineHeight: 1.02, margin: '0 0 18px', fontWeight: 500, letterSpacing: '-.035em' }}>Sepertinya Anda mengambil jalan yang berbeda.</h1>
        <p style={{ maxWidth: '580px', fontSize: '17px', lineHeight: 1.8, color: '#627169', margin: '0 0 32px' }}>Alamat yang dibuka tidak tersedia atau sudah dipindahkan. Kembali ke portal utama, jelajahi program, atau temui awardee Etos ID Palu.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <Link href="/" style={{ textDecoration: 'none', background: '#1f6b50', color: '#fff', padding: '13px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 800 }}>Kembali ke Beranda</Link>
          <a href="/#program" style={{ textDecoration: 'none', border: '1px solid #d8e3dd', color: '#245f49', padding: '13px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 800 }}>Lihat Program</a>
          <a href="/#awardee" style={{ textDecoration: 'none', border: '1px solid #d8e3dd', color: '#245f49', padding: '13px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 800 }}>Lihat Awardee</a>
        </div>
      </section>
    </main>
  );
}
