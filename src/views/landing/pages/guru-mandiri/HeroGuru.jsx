import HeroHalaman from '../../components/HeroHalaman';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import { renderTeks } from '../../components/renderTeks';
import { HERO as D } from '../../data/guruMandiri';

// Hero Akun Guru Mandiri: dua tombol tautan jangkar (ke formulir dan ke cara
// memakai) dan empat kartu fakta (seluler: dua kolom tanpa ikon).
export default function HeroGuru() {
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
      <BarisKartuFakta butir={D.fakta} varian="fakta" />
    </HeroHalaman>
  );
}
