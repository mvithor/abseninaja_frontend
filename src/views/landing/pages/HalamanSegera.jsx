import PageContainer from 'src/components/container/PageContainer';
import Seksi from '../components/Seksi';
import JudulSeksi from '../components/JudulSeksi';
import TombolLanding from '../components/TombolLanding';

// Halaman placeholder "Segera hadir" untuk rute yang belum dibangun. Hanya
// terdaftar saat import.meta.env.DEV (lihat routes.jsx), jadi tidak ikut build
// produksi. Teksnya teks pengembangan, bukan copy produk.
export default function HalamanSegera() {
  return (
    <PageContainer title="Segera hadir | Absenin Aja" description="Halaman ini belum dibangun.">
      <Seksi varian="hero" padAtas={{ xs: '64px', md: '120px' }} padBawah={{ xs: '64px', md: '120px' }}>
        <JudulSeksi
          tingkat="h1"
          judul="Segera hadir"
          sub="Halaman ini belum dibangun. Rute ini hanya terdaftar di mode pengembangan."
        />
        <TombolLanding varian="gradasi" to="/">
          Kembali ke Beranda
        </TombolLanding>
      </Seksi>
    </PageContainer>
  );
}
