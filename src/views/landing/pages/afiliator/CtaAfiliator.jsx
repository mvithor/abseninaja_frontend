import BannerCta from '../../components/BannerCta';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { CTA as D } from '../../data/afiliator';

// Banner penutup Afiliator. Jarak atas dan bawah 96 px di semua lebar (jarak atas
// menggantikan pengisi 96 px pada desain setelah FAQ). "Pelajari Cara Kerja" menaut
// ke jangkar tiga langkah di halaman ini.
export default function CtaAfiliator() {
  return (
    <BannerCta
      judul={D.judul}
      sub={renderTeks(D.sub)}
      penanda={<PenandaVerifikasi verifikasi={D.verifikasi} sx={{ position: 'relative' }} />}
      aksiUtama={{ label: D.aksiUtama.label, ...propsAksi(D.aksiUtama.rute) }}
      aksiKedua={{ label: D.aksiKedua.label, href: D.aksiKedua.href }}
      sx={{ pt: '96px', pb: '96px' }}
    />
  );
}
