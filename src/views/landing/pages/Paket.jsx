import PageContainer from 'src/components/container/PageContainer';
import HeroPaket from './paket/HeroPaket';
import PaketLengkap from './paket/PaketLengkap';
import JalurPaket from './paket/JalurPaket';
import TermasukPaket from './paket/TermasukPaket';
import CtaPaket from './paket/CtaPaket';
import { META } from '../data/paket';

// Paket dan Harga `/produk/paket`: hanya menyusun seksi. Teks di data/paket.js,
// tampilan di pages/paket/. Tidak ada angka harga (harga dibahas saat demo).
export default function Paket() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroPaket />
      <PaketLengkap />
      <JalurPaket />
      <TermasukPaket />
      <CtaPaket />
    </PageContainer>
  );
}
