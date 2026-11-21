import HeroHalaman from '../../components/HeroHalaman';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { HERO } from '../../data/keamananData';

// Hero Keamanan Data: label, judul dua warna, subjudul. Tanpa kartu fakta;
// jarak bawah 48 px (seluler 24 px).
export default function HeroKeamanan() {
  return (
    <HeroHalaman
      eyebrow={HERO.eyebrow}
      judul={HERO.judul}
      sub={renderTeks(HERO.sub)}
      maxJudul={820}
      maxSub={520}
      padBawah={{ xs: '24px', md: '48px' }}
    >
      <PenandaVerifikasi verifikasi={HERO.verifikasi} />
    </HeroHalaman>
  );
}
