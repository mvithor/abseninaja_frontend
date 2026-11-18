import PageContainer from 'src/components/container/PageContainer';
import HeroDemo from './jadwalkan-demo/HeroDemo';
import BerikutnyaDemo from './jadwalkan-demo/BerikutnyaDemo';
import FaqDemo from './jadwalkan-demo/FaqDemo';
import { META } from '../data/jadwalkanDemo';

// Jadwalkan Demo `/jadwalkan-demo`: hanya menyusun seksi. Teks di
// data/jadwalkanDemo.js dan data/formulir.js, tampilan di pages/jadwalkan-demo/.
// Kartu afiliator disediakan footer halaman dalam (layout/rute.js); tidak ada
// banner CTA penutup, sesuai desain.
export default function JadwalkanDemo() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroDemo />
      <BerikutnyaDemo />
      <FaqDemo />
    </PageContainer>
  );
}
