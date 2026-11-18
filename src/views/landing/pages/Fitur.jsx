import PageContainer from 'src/components/container/PageContainer';
import HeroFitur from './fitur/HeroFitur';
import BannerAnalitik from './fitur/BannerAnalitik';
import DaftarModul from './fitur/DaftarModul';
import StripKeamanan from './fitur/StripKeamanan';
import StripPrakersa from './fitur/StripPrakersa';
import CtaFitur from './fitur/CtaFitur';
import { META } from '../data/fitur';

// Fitur Lengkap `/produk/fitur`: hanya menyusun seksi. Teks di data/fitur.js,
// tampilan di pages/fitur/.
export default function Fitur() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroFitur />
      <BannerAnalitik />
      <DaftarModul />
      <StripKeamanan />
      <StripPrakersa />
      <CtaFitur />
    </PageContainer>
  );
}
