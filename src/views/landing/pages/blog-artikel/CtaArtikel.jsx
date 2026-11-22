import BannerCta from '../../components/BannerCta';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { ARTIKEL_HALAMAN } from '../../data/blog';

const D = ARTIKEL_HALAMAN.cta;

// Banner penutup artikel. Jarak atas (pengganti pengisi 96 px pada desain) dan
// bawah 96 px di semua lebar. Tombol kedua kembali ke daftar Blog.
export default function CtaArtikel() {
  return (
    <BannerCta
      judul={D.judul}
      sub={renderTeks(D.sub)}
      aksiUtama={{ label: D.aksiUtama.label, ...propsAksi(D.aksiUtama.rute) }}
      aksiKedua={{ label: D.aksiKedua.label, ...propsAksi(D.aksiKedua.rute) }}
      sx={{ pt: '96px', pb: '96px' }}
    />
  );
}
