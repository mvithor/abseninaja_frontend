import PageContainer from 'src/components/container/PageContainer';
import Hero from './beranda/Hero';
import SebelumSesudah from './beranda/SebelumSesudah';
import FiturBeranda from './beranda/FiturBeranda';
import UntukSekolah from './beranda/UntukSekolah';
import Komunikasi from './beranda/Komunikasi';
import PendampinganBeranda from './beranda/PendampinganBeranda';
import FaqBeranda from './beranda/FaqBeranda';
import CtaPenutup from './beranda/CtaPenutup';
import { META } from '../data/beranda';

// Beranda `/`: hanya menyusun seksi. Teks di data/beranda.js, tampilan di
// pages/beranda/. Judul dan deskripsi sama dengan Landing.jsx lama.
export default function Beranda() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <Hero />
      <SebelumSesudah />
      <FiturBeranda />
      <UntukSekolah />
      <Komunikasi />
      <PendampinganBeranda />
      <FaqBeranda />
      <CtaPenutup />
    </PageContainer>
  );
}
