import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { HERO } from '../../data/legalitas';

// Hero Legalitas: judul dua warna, subjudul, dan empat kartu fakta (dua kolom
// tanpa ikon di seluler). Jarak bawah 64 px (seluler 32 px).
export default function HeroLegalitas() {
  return (
    <HeroHalaman
      eyebrow={HERO.eyebrow}
      judul={HERO.judul}
      sub={renderTeks(HERO.sub)}
      maxJudul={860}
      maxSub={560}
      padBawah={{ xs: '32px', md: '64px' }}
    >
      <BarisKartuFakta butir={HERO.fakta} varian="fakta" />
      <PenandaVerifikasi verifikasi={HERO.verifikasi} />
    </HeroHalaman>
  );
}
