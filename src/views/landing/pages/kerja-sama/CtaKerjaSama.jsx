import BannerCta from '../../components/BannerCta';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { CTA as D } from '../../data/kerjaSama';

// Banner penutup Kerja Sama. Jarak bawah 96 px di semua lebar (desain web dan
// seluler). Tombol kedua menaut ke jangkar formulir di halaman ini (simpangan dari
// desain; lihat data/kerjaSama.js).
export default function CtaKerjaSama() {
  return (
    <BannerCta
      judul={D.judul}
      sub={renderTeks(D.sub)}
      aksiUtama={{ label: D.aksiUtama.label, ...propsAksi(D.aksiUtama.rute) }}
      aksiKedua={{ label: D.aksiKedua.label, href: D.aksiKedua.href }}
      sx={{ pb: '96px' }}
    />
  );
}
