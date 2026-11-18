import BannerCta from '../../components/BannerCta';
import Teks from '../../components/Teks';
import { propsAksi } from '../../data/aksi';
import { CTA as D } from '../../data/beranda';

// Banner penutup. Bagian atas 96 px (seluler 48 px) memisahkan banner dari
// bagian FAQ yang berlatar tint, seperti desain (section padding 96 0).
export default function CtaPenutup() {
  return (
    <BannerCta
      judul={D.judul}
      sub={<Teks web={D.sub.web} seluler={D.sub.mobile} />}
      aksiUtama={{ label: D.aksiUtama.label, ...propsAksi(D.aksiUtama.rute) }}
      aksiKedua={{ label: D.aksiKedua.label, ...propsAksi(D.aksiKedua.rute) }}
      sx={{ pt: { xs: '48px', md: '96px' } }}
    />
  );
}
