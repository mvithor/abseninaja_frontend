import PageContainer from 'src/components/container/PageContainer';
import HeroPendampingan from './pendampingan/HeroPendampingan';
import BandingPendampingan from './pendampingan/BandingPendampingan';
import AlurPendampingan from './pendampingan/AlurPendampingan';
import BentukPendampingan from './pendampingan/BentukPendampingan';
import FaqPendampingan from './pendampingan/FaqPendampingan';
import CtaPendampingan from './pendampingan/CtaPendampingan';
import { META } from '../data/pendampingan';

// Pendampingan `/produk/pendampingan`: hanya menyusun seksi. Teks di
// data/pendampingan.js, tampilan di pages/pendampingan/.
export default function Pendampingan() {
  return (
    <PageContainer title={META.title} description={META.description}>
      <HeroPendampingan />
      <BandingPendampingan />
      <AlurPendampingan />
      <BentukPendampingan />
      <FaqPendampingan />
      <CtaPendampingan />
    </PageContainer>
  );
}
