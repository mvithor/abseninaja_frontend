import BannerSorot from '../../components/BannerSorot';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { SOROT as D } from '../../data/keamananData';

// Banner sorot di bawah hero: jaminan utama (data tiap sekolah terpisah) dan
// tombol putih ke tim kami.
export default function SorotKeamanan() {
  return (
    <BannerSorot
      id={D.id}
      ikon={D.ikon}
      judul={D.judul}
      teks={renderTeks(D.teks)}
      aksi={{ label: D.aksi.label, varian: 'putih', ...propsAksi(D.aksi.rute) }}
      penanda={<PenandaVerifikasi verifikasi={D.verifikasi} sx={{ mt: '10px' }} />}
    />
  );
}
