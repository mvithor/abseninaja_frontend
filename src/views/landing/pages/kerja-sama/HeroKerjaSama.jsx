import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import { renderTeks } from '../../components/renderTeks';
import { HERO as D } from '../../data/kerjaSama';

// Hero Kerja Sama: judul dua warna, subjudul, dan empat kartu penanda (seluler:
// dua kolom tanpa ikon). Tanpa tombol, sesuai desain.
export default function HeroKerjaSama() {
  return (
    <HeroHalaman
      eyebrow={D.eyebrow}
      judul={D.judul}
      sub={renderTeks(D.sub)}
      maxJudul={860}
      maxSub={560}
      padBawah={{ xs: '32px', md: '64px' }}
    >
      <BarisKartuFakta butir={D.fakta} varian="fakta" />
    </HeroHalaman>
  );
}
