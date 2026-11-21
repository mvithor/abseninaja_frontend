import { IconArrowRight } from '@tabler/icons-react';
import BannerSorot from '../../components/BannerSorot';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { SOROT as D } from '../../data/testimoni';
import { huruf } from '../../theme/tokens';

// Banner sorot di bawah hero: label status, "Dipercaya 120 sekolah", dan tombol
// kuning ke demo. Jarak atas 0, bawah 64 px (seluler 32 px).
export default function SorotTestimoni() {
  return (
    <BannerSorot
      id={D.id}
      tag={D.tag}
      judul={D.judul}
      teks={renderTeks(D.teks)}
      aksi={{
        label: D.aksi.label,
        varian: 'kuning',
        ikonAkhir: <IconArrowRight size={18} stroke={2.2} aria-hidden="true" />,
        ...propsAksi(D.aksi.rute),
      }}
      penanda={<PenandaVerifikasi verifikasi={D.verifikasi} sx={{ mt: '10px' }} />}
      ukuranJudul={huruf.judulSorotBesar}
      padMd="36px 44px"
      padAtas={0}
      padBawah={{ xs: '32px', md: '64px' }}
      maxTeks={620}
    />
  );
}
