import { IconArrowRight } from '@tabler/icons-react';
import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { HERO as D } from '../../data/paket';

// Hero Paket: dua tombol (utama dengan panah, kedua bergaris) dan empat kartu
// fakta (seluler: dua kolom tanpa ikon). Tombol menumpuk penuh di seluler.
export default function HeroPaket() {
  return (
    <HeroHalaman
      eyebrow={D.eyebrow}
      judul={D.judul}
      sub={renderTeks(D.sub)}
      maxJudul={860}
      maxSub={560}
      padBawah={{ xs: '32px', md: '64px' }}
      aksi={[
        {
          label: D.aksiUtama.label,
          ikonAkhir: <IconArrowRight size={18} stroke={2.2} aria-hidden="true" />,
          ...propsAksi(D.aksiUtama.rute),
        },
        { label: D.aksiKedua.label, varian: 'garis', ...propsAksi(D.aksiKedua.rute) },
      ]}
    >
      <BarisKartuFakta butir={D.fakta} varian="fakta" />
    </HeroHalaman>
  );
}
