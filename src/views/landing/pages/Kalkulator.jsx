import PageContainer from 'src/components/container/PageContainer';
import HeroKalkulator from './kalkulator/HeroKalkulator';
import KartuKalkulator from './kalkulator/KartuKalkulator';
import LangkahBerikutnya from './kalkulator/LangkahBerikutnya';
import CtaKalkulator from './kalkulator/CtaKalkulator';
import { META } from '../data/kalkulator';

// Kalkulator Digitalisasi `/kalkulator`: hanya menyusun seksi. Teks dan data di
// data/kalkulator.js, rumus dan mesin keadaan di lib/kalkulator.js (murni, ada
// tesnya), tampilan di pages/kalkulator/. Jawaban tidak dikirim dan tidak
// disimpan (lihat KartuKalkulator). Halaman ini hanya terdaftar bila gerbang
// rilis alat menyala (lib/gerbang.js, routes.jsx).
export default function Kalkulator() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroKalkulator />
      <KartuKalkulator />
      <LangkahBerikutnya />
      <CtaKalkulator />
    </PageContainer>
  );
}
