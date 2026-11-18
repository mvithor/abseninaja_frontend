import BannerCta from '../../components/BannerCta';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { CTA as D } from '../../data/paket';

// Banner penutup Paket. Jarak atas 0 (bagian sebelumnya sudah memberi 96 px
// di bawah), jarak bawah 96 px di semua lebar.
export default function CtaPaket() {
  return (
    <BannerCta
      judul={D.judul}
      sub={renderTeks(D.sub)}
      aksiUtama={{ label: D.aksiUtama.label, ...propsAksi(D.aksiUtama.rute) }}
      aksiKedua={{ label: D.aksiKedua.label, ...propsAksi(D.aksiKedua.rute) }}
      sx={{ pt: 0, pb: '96px' }}
    />
  );
}
