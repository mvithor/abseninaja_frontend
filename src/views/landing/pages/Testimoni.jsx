import PageContainer from 'src/components/container/PageContainer';
import HeroTestimoni from './testimoni/HeroTestimoni';
import SorotTestimoni from './testimoni/SorotTestimoni';
import DaftarTestimoni from './testimoni/DaftarTestimoni';
import CtaTestimoni from './testimoni/CtaTestimoni';
import { META } from '../data/testimoni';

// Testimoni `/bukti/testimoni`: hanya menyusun seksi. Teks di
// data/testimoni.js, tampilan di pages/testimoni/. Halaman ini hanya terdaftar
// bila gerbang rilis Bukti menyala (lib/gerbang.js, routes.jsx); seluruh nama
// dan kutipan dummy dari desain.
export default function Testimoni() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroTestimoni />
      <SorotTestimoni />
      <DaftarTestimoni />
      <CtaTestimoni />
    </PageContainer>
  );
}
