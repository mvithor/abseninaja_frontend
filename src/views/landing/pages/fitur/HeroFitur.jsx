import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import Teks from '../../components/Teks';
import { renderJudul } from '../../components/renderJudul';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { HERO } from '../../data/fitur';

// Hero Fitur v2: judul dua versi (web dan seluler), dua tombol, dan tiga kartu fakta
// tanpa angka hitungan (tiga kolom sama lebar di md ke atas, bertumpuk di bawahnya, ikon
// hanya di md ke atas). Jarak bawah 48 px (seluler 32 px) sesuai desain.
export default function HeroFitur() {
  return (
    <HeroHalaman
      eyebrow={HERO.eyebrow}
      judul={<Teks web={renderJudul(HERO.judul.web)} seluler={renderJudul(HERO.judul.mobile)} />}
      sub={renderTeks(HERO.sub)}
      maxJudul={860}
      maxSub={600}
      padBawah={{ xs: '32px', md: '48px' }}
      aksi={[
        { label: HERO.aksiUtama.label, ...propsAksi(HERO.aksiUtama.rute) },
        { label: HERO.aksiKedua.label, varian: 'garis', ...propsAksi(HERO.aksiKedua.rute) },
      ]}
    >
      <BarisKartuFakta butir={HERO.statistik} varian="angkaDua" />
    </HeroHalaman>
  );
}
