import PageContainer from 'src/components/container/PageContainer';
import HeroGuru from './guru-mandiri/HeroGuru';
import ApaGuru from './guru-mandiri/ApaGuru';
import CaraGuru from './guru-mandiri/CaraGuru';
import AkunGuru from './guru-mandiri/AkunGuru';
import FaqGuru from './guru-mandiri/FaqGuru';
import CtaGuru from './guru-mandiri/CtaGuru';
import { META } from '../data/guruMandiri';

// Akun Guru Mandiri `/akun-guru-mandiri`: hanya menyusun seksi. Teks di
// data/guruMandiri.js dan data/formulir.js, tampilan di pages/guru-mandiri/.
export default function GuruMandiri() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroGuru />
      <ApaGuru />
      <CaraGuru />
      <AkunGuru />
      <FaqGuru />
      <CtaGuru />
    </PageContainer>
  );
}
