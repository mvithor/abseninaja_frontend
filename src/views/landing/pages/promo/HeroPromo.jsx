import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import { renderTeks } from '../../components/renderTeks';
import { HERO as D } from '../../data/promo';

// Hero Promo: judul tengah dan empat kartu fakta (seluler: dua kolom tanpa ikon).
export default function HeroPromo() {
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
