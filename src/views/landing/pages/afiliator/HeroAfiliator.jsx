import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import { renderTeks } from '../../components/renderTeks';
import { HERO as D } from '../../data/afiliator';

// Hero Afiliator: dua tombol tautan jangkar (ke formulir dan ke tiga langkah) dan
// empat kartu fakta (ikon tampil di semua lebar; satu kolom di seluler).
export default function HeroAfiliator() {
  return (
    <HeroHalaman
      eyebrow={D.eyebrow}
      judul={D.judul}
      sub={renderTeks(D.sub)}
      maxJudul={860}
      maxSub={560}
      padBawah={{ xs: '32px', md: '64px' }}
      aksi={[
        { label: D.aksiUtama.label, href: D.aksiUtama.href },
        { label: D.aksiKedua.label, varian: 'garis', href: D.aksiKedua.href },
      ]}
    >
      <BarisKartuFakta butir={D.fakta} varian="ikonLebar" />
    </HeroHalaman>
  );
}
