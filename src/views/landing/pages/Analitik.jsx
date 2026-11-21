import PageContainer from 'src/components/container/PageContainer';
import NavJangkar from './analitik/NavJangkar';
import HeroAnalitik from './analitik/HeroAnalitik';
import PitaFakta from './analitik/PitaFakta';
import SebelumSesudahLad from './analitik/SebelumSesudahLad';
import CaraKerja from './analitik/CaraKerja';
import FiturLad from './analitik/FiturLad';
import LimaPenanda from './analitik/LimaPenanda';
import KelasTerbaca from './analitik/KelasTerbaca';
import ProfilSaran from './analitik/ProfilSaran';
import Janji from './analitik/Janji';
import JalurAkun from './analitik/JalurAkun';
import KelasLatihan from './analitik/KelasLatihan';
import FaqLad from './analitik/FaqLad';
import CtaLad from './analitik/CtaLad';
import { META } from '../data/analitik';

// Analitik Pembelajaran `/analitik-pembelajaran`: hanya menyusun seksi. Teks di
// data/analitik.js, data contoh peraga di data/analitikMock.js, tampilan di
// pages/analitik/ dan mock/lad/. Halaman ini hanya terdaftar bila gerbang rilis
// LAD menyala (lib/gerbang.js, routes.jsx).
// Header, bar pengumuman, footer, bar tab seluler, dan tombol ke atas milik
// LandingLayout; tidak digandakan di sini.
export default function Analitik() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <NavJangkar />
      <HeroAnalitik />
      <PitaFakta />
      <SebelumSesudahLad />
      <CaraKerja />
      <FiturLad />
      <LimaPenanda />
      <KelasTerbaca />
      <ProfilSaran />
      <Janji />
      <JalurAkun />
      <KelasLatihan />
      <FaqLad />
      <CtaLad />
    </PageContainer>
  );
}
