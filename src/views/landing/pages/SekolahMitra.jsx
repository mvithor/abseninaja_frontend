import PageContainer from 'src/components/container/PageContainer';
import HeroSekolahMitra from './sekolah-mitra/HeroSekolahMitra';
import DaftarSekolah from './sekolah-mitra/DaftarSekolah';
import PenghargaanMitra from './sekolah-mitra/PenghargaanMitra';
import CtaSekolahMitra from './sekolah-mitra/CtaSekolahMitra';
import { META } from '../data/sekolahMitra';

// Sekolah Mitra `/bukti/sekolah-mitra`: hanya menyusun seksi. Teks di
// data/sekolahMitra.js, tampilan di pages/sekolah-mitra/. Halaman ini hanya
// terdaftar bila gerbang rilis Bukti menyala (lib/gerbang.js, routes.jsx);
// seluruh nama sekolah, angka, dan penghargaan dummy dari desain.
export default function SekolahMitra() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroSekolahMitra />
      <DaftarSekolah />
      <PenghargaanMitra />
      <CtaSekolahMitra />
    </PageContainer>
  );
}
