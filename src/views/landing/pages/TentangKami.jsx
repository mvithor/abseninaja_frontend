import PageContainer from 'src/components/container/PageContainer';
import HeroTentang from './tentang-kami/HeroTentang';
import PendiriTentang from './tentang-kami/PendiriTentang';
import KutipanPendiri from './tentang-kami/KutipanPendiri';
import PerjalananTentang from './tentang-kami/PerjalananTentang';
import NilaiTentang from './tentang-kami/NilaiTentang';
import HubungiKami from './tentang-kami/HubungiKami';
import CtaTentang from './tentang-kami/CtaTentang';
import { META } from '../data/tentangKami';

// Tentang Kami `/tentang-kami`: hanya menyusun seksi. Teks di data/tentangKami.js,
// kontak di data/kontak.js, tampilan di pages/tentang-kami/. Halaman ini hanya
// terdaftar bila gerbang rilis Perusahaan menyala (lib/gerbang.js, routes.jsx);
// seluruh isinya dummy dari desain.
export default function TentangKami() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroTentang />
      <PendiriTentang />
      <KutipanPendiri />
      <PerjalananTentang />
      <NilaiTentang />
      <HubungiKami />
      <CtaTentang />
    </PageContainer>
  );
}
