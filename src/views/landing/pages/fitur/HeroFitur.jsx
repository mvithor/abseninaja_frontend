import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import { renderTeks } from '../../components/renderTeks';
import { HERO } from '../../data/fitur';

// Hero Fitur: judul tengah dan baris empat kartu angka (1 kolom di seluler,
// 2 di sm, 4 di md ke atas). Jarak bawah hero 56 px (seluler 28 px).
export default function HeroFitur() {
  return (
    <HeroHalaman eyebrow={HERO.eyebrow} judul={HERO.judul} sub={renderTeks(HERO.sub)} maxSub={480}>
      <BarisKartuFakta butir={HERO.statistik} varian="angka" />
    </HeroHalaman>
  );
}
