import { useId } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import HeroArtikel from './blog-artikel/HeroArtikel';
import IsiArtikel from './blog-artikel/IsiArtikel';
import TerkaitArtikel from './blog-artikel/TerkaitArtikel';
import CtaArtikel from './blog-artikel/CtaArtikel';
import { AKHIRAN_JUDUL, ARTIKEL } from '../data/blog';
import { cariBySlug } from '../lib/blog.js';

// Artikel Blog `/blog/:slug`: hanya menyusun seksi. Slug yang tidak dikenal
// dialihkan ke halaman 404 aplikasi (rute /404 di src/routes/Router.jsx, yang juga
// dipakai semua alamat tak dikenal lain); tidak ada halaman 404 baru. Halaman ini
// hanya terdaftar bila gerbang rilis alat menyala (lib/gerbang.js, routes.jsx).
export default function BlogArtikel() {
  const { slug } = useParams();
  const idJudul = useId();
  const artikel = cariBySlug(ARTIKEL, slug);
  if (!artikel) return <Navigate to="/404" replace />;
  return (
    <PageContainer title={`${artikel.judul}${AKHIRAN_JUDUL}`} description={artikel.ringkasan}>
      <HeroArtikel artikel={artikel} idJudul={idJudul} />
      <IsiArtikel artikel={artikel} />
      <TerkaitArtikel slug={artikel.slug} />
      <CtaArtikel />
    </PageContainer>
  );
}
