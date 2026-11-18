import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { HERO } from '../../data/pendampingan';

// Hero Pendampingan: judul tengah dan tiga kartu manfaat (satu kolom di bawah md).
export default function HeroPendampingan() {
  return (
    <HeroHalaman eyebrow={HERO.eyebrow} judul={HERO.judul} sub={renderTeks(HERO.sub)} maxSub={500}>
      <BarisKartuFakta butir={HERO.manfaat} varian="manfaat" />
      <PenandaVerifikasi verifikasi={HERO.verifikasi} />
    </HeroHalaman>
  );
}
