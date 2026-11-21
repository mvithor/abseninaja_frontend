import PageContainer from 'src/components/container/PageContainer';
import HeroLegalitas from './legalitas/HeroLegalitas';
import DokumenLegalitas from './legalitas/DokumenLegalitas';
import KebijakanLegalitas from './legalitas/KebijakanLegalitas';
import CtaLegalitas from './legalitas/CtaLegalitas';
import { META } from '../data/legalitas';

// Legalitas `/bukti/legalitas`: hanya menyusun seksi. Teks di data/legalitas.js,
// tampilan di pages/legalitas/. Halaman ini hanya terdaftar bila gerbang rilis
// Bukti menyala (lib/gerbang.js, routes.jsx); seluruh isinya dummy dari desain.
export default function Legalitas() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroLegalitas />
      <DokumenLegalitas />
      <KebijakanLegalitas />
      <CtaLegalitas />
    </PageContainer>
  );
}
