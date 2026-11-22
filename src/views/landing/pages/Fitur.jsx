import PageContainer from 'src/components/container/PageContainer';
import HeroFitur from './fitur/HeroFitur';
import DaftarPeran from './fitur/DaftarPeran';
import BannerAnalitik from './fitur/BannerAnalitik';
import StripPrakersa from './fitur/StripPrakersa';
import BlokKeamanan from './fitur/BlokKeamanan';
import CtaFitur from './fitur/CtaFitur';
import { META } from '../data/fitur';

// Fitur Lengkap per peran `/produk/fitur` (v2): hanya menyusun seksi (hero, daftar peran
// dengan sepuluh tab, banner Analitik, blok Prakersa, keamanan, CTA). Teks di
// data/fitur.js, tampilan di pages/fitur/. Tidak digerbang bendera: halaman ini
// menggantikan Fitur Lengkap lama dengan klaim yang lebih konservatif.
export default function Fitur() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroFitur />
      <DaftarPeran />
      <BannerAnalitik />
      <StripPrakersa />
      <BlokKeamanan />
      <CtaFitur />
    </PageContainer>
  );
}
