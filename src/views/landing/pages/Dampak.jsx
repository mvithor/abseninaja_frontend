import PageContainer from 'src/components/container/PageContainer';
import HeroDampak from './dampak/HeroDampak';
import RingkasanDampak from './dampak/RingkasanDampak';
import StudiKasus from './dampak/StudiKasus';
import CtaDampak from './dampak/CtaDampak';
import { META } from '../data/dampak';

// Dampak `/bukti/dampak`: hanya menyusun seksi. Teks di data/dampak.js,
// tampilan di pages/dampak/. Halaman ini hanya terdaftar bila gerbang rilis
// Bukti menyala (lib/gerbang.js, routes.jsx); seluruh angka dummy dari desain.
export default function Dampak() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroDampak />
      <RingkasanDampak />
      <StudiKasus />
      <CtaDampak />
    </PageContainer>
  );
}
