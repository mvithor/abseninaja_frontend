import BannerCta from '../../components/BannerCta';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { CTA as D } from '../../data/sekolahMitra';

// Banner penutup Sekolah Mitra. Jarak atas dan bawah 96 px di semua lebar.
export default function CtaSekolahMitra() {
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
