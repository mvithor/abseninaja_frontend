import PageContainer from 'src/components/container/PageContainer';
import HeroKerjaSama from './kerja-sama/HeroKerjaSama';
import BentukKerjaSama from './kerja-sama/BentukKerjaSama';
import FormulirKerjaSama from './kerja-sama/FormulirKerjaSama';
import CtaKerjaSama from './kerja-sama/CtaKerjaSama';
import { META } from '../data/kerjaSama';

// Kerja Sama `/kerja-sama`: hanya menyusun seksi. Teks di data/kerjaSama.js dan
// data/formulir.js, tampilan di pages/kerja-sama/. Halaman ini hanya terdaftar
// bila gerbang rilis Perusahaan menyala (lib/gerbang.js, routes.jsx).
export default function KerjaSama() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroKerjaSama />
      <BentukKerjaSama />
      <FormulirKerjaSama />
      <CtaKerjaSama />
    </PageContainer>
  );
}
