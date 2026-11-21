import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import { renderTeks } from '../../components/renderTeks';
import { HERO } from '../../data/dampak';

// Hero Dampak: judul dua warna, subjudul, dan empat kartu fakta ringkasan
// (sekolah mitra, absensi otomatis, waktu terhemat, wali terinformasi). Kartu
// ini penanda isi halaman, bukan kontrol, jadi bukan tab.
export default function HeroDampak() {
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
