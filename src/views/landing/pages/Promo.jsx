import PageContainer from 'src/components/container/PageContainer';
import HeroPromo from './promo/HeroPromo';
import KartuPromo from './promo/KartuPromo';
import IsiPromo from './promo/IsiPromo';
import SyaratPromo from './promo/SyaratPromo';
import CtaPromo from './promo/CtaPromo';
import { META } from '../data/promo';

// Promo `/produk/promo`: hanya menyusun seksi. Teks di data/promo.js, tampilan
// di pages/promo/. Hitung mundur memakai nilai statis dummy (data/promo.js).
export default function Promo() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroPromo />
      <KartuPromo />
      <IsiPromo />
      <SyaratPromo />
      <CtaPromo />
    </PageContainer>
  );
}
