import { useId, useState } from 'react';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import BarTabGradasi from '../../components/BarTabGradasi';
import Teks from '../../components/Teks';
import { idTab } from '../../components/idTab';
import { LABEL_PANAH, LABEL_TAB, PERAN } from '../../data/fitur';
import { buatTabPeran, cariPeran, idTabPeran } from '../../lib/fitur.js';
import PanelPeran from './PanelPeran';

// Daftar fitur per peran: bar tab gradasi (sepuluh peran, label web dan seluler lewat
// Teks) dengan dua tombol geser di kiri dan kanan memilih satu peran tanpa muat ulang.
// Satu tabpanel dipakai bersama (id panel ada selama halaman tampil), isinya berganti
// mengikuti tab aktif; PanelPeran dipasang ulang (key) tiap ganti tab sehingga status
// akordeon kembali ke bawaan. Id tab berbasis indeks (lib/fitur.js). Sepuluh tab tidak
// muat di lebar mana pun: bar bisa digeser dengan tombol, sentuhan, atau papan ketik
// (roving tabindex, panah, Home, End). Latar bagian ini putih polos dengan jarak 56 px
// (seluler 40 px) di atas bar tab supaya tidak menempel di batas hero.
const TAB = buatTabPeran(PERAN).map((t) => ({
  id: t.id,
  label: <Teks web={t.label.web} seluler={t.label.mobile} />,
}));

export default function DaftarPeran() {
  const dasar = useId();
  const [aktif, setAktif] = useState(idTabPeran(0));
  // Id aktif yang tidak ada (mustahil lewat UI) jatuh ke peran pertama.
  const { peran, id } = cariPeran(PERAN, aktif);
  const idPanel = `${dasar}-panel`;

  return (
    <Seksi varian="terang" padAtas={{ xs: '40px', md: '56px' }} padBawah={{ xs: '40px', md: '64px' }}>
      <BarTabGradasi
        tab={TAB}
        aktif={id}
        onUbah={setAktif}
        label={LABEL_TAB}
        idDasar={dasar}
        idPanel={idPanel}
        panah={LABEL_PANAH}
      />
      <Box role="tabpanel" id={idPanel} aria-labelledby={idTab(dasar, id)} tabIndex={0}>
        <PanelPeran key={id} peran={peran} idPanel={idPanel} />
      </Box>
    </Seksi>
  );
}
