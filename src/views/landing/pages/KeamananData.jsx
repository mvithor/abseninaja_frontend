import PageContainer from 'src/components/container/PageContainer';
import HeroKeamanan from './keamanan-data/HeroKeamanan';
import SorotKeamanan from './keamanan-data/SorotKeamanan';
import PrinsipKeamanan from './keamanan-data/PrinsipKeamanan';
import TahapData from './keamanan-data/TahapData';
import DokumenRingkas from './keamanan-data/DokumenRingkas';
import CtaKeamanan from './keamanan-data/CtaKeamanan';
import { META } from '../data/keamananData';

// Keamanan Data `/bukti/keamanan-data`: hanya menyusun seksi. Teks di
// data/keamananData.js, tampilan di pages/keamanan-data/. Halaman ini hanya
// terdaftar bila gerbang rilis Bukti menyala (lib/gerbang.js, routes.jsx);
// seluruh isinya dummy dari desain.
export default function KeamananData() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroKeamanan />
      <SorotKeamanan />
      <PrinsipKeamanan />
      <TahapData />
      <DokumenRingkas />
      <CtaKeamanan />
    </PageContainer>
  );
}
