import BannerCta from '../../components/BannerCta';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { CTA as D } from '../../data/analitik';

// Banner penutup. Jarak atas 72 px (pengisi pada desain setelah FAQ) dan bawah
// 96 px di semua lebar, sesuai desain web dan seluler.
export default function CtaLad() {
  return (
    <BannerCta
      judul={D.judul}
      sub={renderTeks(D.sub)}
      aksiUtama={{ label: D.aksiUtama.label, ...propsAksi(D.aksiUtama.rute) }}
      aksiKedua={{ label: D.aksiKedua.label, href: D.aksiKedua.href }}
      sx={{ pt: '72px', pb: '96px' }}
    />
  );
}
