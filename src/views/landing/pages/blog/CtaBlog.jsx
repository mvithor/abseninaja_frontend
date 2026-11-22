import BannerCta from '../../components/BannerCta';
import { propsAksi } from '../../data/aksi';
import { CTA as D } from '../../data/blog';

// Banner penutup Blog. Jarak atas (pengganti pengisi 96 px pada desain) dan bawah
// 96 px di semua lebar.
export default function CtaBlog() {
  return (
    <BannerCta
      judul={D.judul}
      sub={D.sub}
      aksiUtama={{ label: D.aksiUtama.label, ...propsAksi(D.aksiUtama.rute) }}
      aksiKedua={{ label: D.aksiKedua.label, ...propsAksi(D.aksiKedua.rute) }}
      sx={{ pt: '96px', pb: '96px' }}
    />
  );
}
