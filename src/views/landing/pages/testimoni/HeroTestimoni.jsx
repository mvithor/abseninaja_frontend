import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import { renderTeks } from '../../components/renderTeks';
import { HERO } from '../../data/testimoni';

// Hero Testimoni: judul dua warna, subjudul, dan empat kartu fakta peran
// pemberi testimoni. Kartu ini penanda, bukan kontrol, jadi bukan tab.
export default function HeroTestimoni() {
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
    </HeroHalaman>
  );
}
