import BannerCta from '../../components/BannerCta';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { CTA as D } from '../../data/guruMandiri';

// Banner penutup Akun Guru Mandiri. Jarak atas dan bawah 96 px di semua lebar
// (jarak atas menggantikan pengisi 96 px pada desain setelah FAQ).
export default function CtaGuru() {
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
