import { useId, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import HeroUntukSekolah from './untuk-sekolah/HeroUntukSekolah';
import PanelJenis from './untuk-sekolah/PanelJenis';
import Perbandingan from './untuk-sekolah/Perbandingan';
import CtaUntukSekolah from './untuk-sekolah/CtaUntukSekolah';
import { JENIS, META } from '../data/untukSekolah';

// Untuk Sekolah `/produk/untuk-sekolah`: menyusun seksi. Jenis sekolah aktif
// dipakai bersama oleh kartu tab di hero dan panel jenis (satu tablist, satu
// tabpanel). Teks di data/untukSekolah.js, tampilan di pages/untuk-sekolah/.
export default function UntukSekolah() {
  const idDasar = useId();
  const [aktif, setAktif] = useState(JENIS[0].id);
  const jenis = JENIS.find((j) => j.id === aktif) ?? JENIS[0];
  const idPanel = `${idDasar}-panel`;

  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroUntukSekolah aktif={jenis.id} onUbah={setAktif} idDasar={idDasar} idPanel={idPanel} />
      <PanelJenis jenis={jenis} idDasar={idDasar} idPanel={idPanel} />
      <Perbandingan />
      <CtaUntukSekolah />
    </PageContainer>
  );
}
