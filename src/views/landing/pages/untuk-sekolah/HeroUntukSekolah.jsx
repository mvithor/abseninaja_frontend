import PropTypes from 'prop-types';
import HeroHalaman from '../../components/HeroHalaman';
import BarTabGradasi from '../../components/BarTabGradasi';
import { renderTeks } from '../../components/renderTeks';
import { HERO, JENIS } from '../../data/untukSekolah';

// Hero Untuk Sekolah: judul tengah dan dua kartu tab jenis sekolah (satu
// kolom di bawah md). Jarak bawah hero 48 px (seluler 24 px).
const TAB = JENIS.map((j) => ({ id: j.id, label: j.nama, sub: j.sub, ikon: j.ikon }));

export default function HeroUntukSekolah({ aktif, onUbah, idDasar, idPanel }) {
  return (
    <HeroHalaman
      eyebrow={HERO.eyebrow}
      judul={HERO.judul}
      sub={renderTeks(HERO.sub)}
      maxSub={480}
      padBawah={{ xs: '24px', md: '48px' }}
    >
      <BarTabGradasi
        varian="kartu"
        tab={TAB}
        aktif={aktif}
        onUbah={onUbah}
        label={HERO.labelTab}
        idDasar={idDasar}
        idPanel={idPanel}
        sx={{ mt: '24px' }}
      />
    </HeroHalaman>
  );
}

HeroUntukSekolah.propTypes = {
  aktif: PropTypes.string.isRequired,
  onUbah: PropTypes.func.isRequired,
  idDasar: PropTypes.string.isRequired,
  idPanel: PropTypes.string.isRequired,
};
