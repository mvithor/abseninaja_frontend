import PageContainer from 'src/components/container/PageContainer';
import HeroAfiliator from './afiliator/HeroAfiliator';
import KeuntunganAfiliator from './afiliator/KeuntunganAfiliator';
import CaraAfiliator from './afiliator/CaraAfiliator';
import DaftarAfiliator from './afiliator/DaftarAfiliator';
import FaqAfiliator from './afiliator/FaqAfiliator';
import CtaAfiliator from './afiliator/CtaAfiliator';
import { META } from '../data/afiliator';

// Afiliator `/afiliator`: hanya menyusun seksi. Teks di data/afiliator.js dan
// data/formulir.js, tampilan di pages/afiliator/. Halaman ini hanya terdaftar
// bila gerbang rilis Perusahaan menyala (lib/gerbang.js, routes.jsx). Program
// afiliator belum ada sebagai produk: seluruh isinya dummy dari desain.
export default function Afiliator() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroAfiliator />
      <KeuntunganAfiliator />
      <CaraAfiliator />
      <DaftarAfiliator />
      <FaqAfiliator />
      <CtaAfiliator />
    </PageContainer>
  );
}
