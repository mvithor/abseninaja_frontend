import { useId, useState } from 'react';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import Eyebrow from '../../components/Eyebrow';
import BarTabGradasi from '../../components/BarTabGradasi';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { idTab } from '../../components/idTab';
import { renderTeks } from '../../components/renderTeks';
import { KELOMPOK, MODUL } from '../../data/fitur';
import { colors, gradients, huruf } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Daftar modul: bar tab gradasi (empat kelompok dengan jumlah) menyaring dua
// belas kartu modul tanpa muat ulang. Satu tabpanel dipakai bersama (id panel
// ada selama halaman tampil), isinya berganti mengikuti tab aktif.
// Kartu: satu kolom di bawah md, tiga kolom di md ke atas.
const TAB = KELOMPOK.daftar.map((k) => ({
  id: k.id,
  label: k.nama,
  jumlah: k.id === 'semua' ? MODUL.length : MODUL.filter((m) => m.kelompok === k.id).length,
}));

export default function DaftarModul() {
  const dasar = useId();
  const [aktif, setAktif] = useState(KELOMPOK.daftar[0].id);
  const kelompok = KELOMPOK.daftar.find((k) => k.id === aktif) ?? KELOMPOK.daftar[0];
  const tampil = kelompok.id === 'semua' ? MODUL : MODUL.filter((m) => m.kelompok === kelompok.id);
  const idPanel = `${dasar}-panel`;
  const idJudul = `${dasar}-judul`;

  return (
    <Seksi
      varian="terang"
      id="modul"
      padAtas="0px"
      padBawah="88px"
      sx={{ background: gradients.hero }}
      aria-labelledby={idJudul}
    >
      <BarTabGradasi
        tab={TAB}
        aktif={kelompok.id}
        onUbah={setAktif}
        label={KELOMPOK.labelTab}
        idDasar={dasar}
        idPanel={idPanel}
      />
      <Box role="tabpanel" id={idPanel} aria-labelledby={idTab(dasar, kelompok.id)} tabIndex={0}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: { xs: '24px', md: '48px' },
            mt: '56px',
            pb: '20px',
            borderBottom: `1px solid ${colors.outline}`,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
            <Eyebrow component="p" sx={{ m: 0 }}>
              {KELOMPOK.eyebrow}
            </Eyebrow>
            <Box component="h2" id={idJudul} sx={{ m: 0, color: colors.ink, textWrap: 'balance', ...huruf.judulBagian }}>
              {kelompok.judul}
            </Box>
          </Box>
          <Box
            component="p"
            sx={{ m: 0, maxWidth: 420, color: colors.muted, textWrap: 'pretty', ...huruf.subjudul, fontSize: { xs: '15px', md: '16px' } }}
          >
            {renderTeks(kelompok.deskripsi)}
          </Box>
        </Box>
        <Box
          component="ul"
          sx={{
            ...resetDaftar,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
            gap: '20px',
            mt: '32px',
          }}
        >
          {tampil.map((m) => (
            <Box key={m.judul} component="li" sx={{ display: 'flex' }}>
              <KartuIkon
                tata="sebaris"
                ikon={m.ikon}
                judul={m.judul}
                deskripsi={renderTeks(m.deskripsi)}
                tag={m.tag}
                status={m.status}
                penanda={<PenandaVerifikasi verifikasi={m.verifikasi} />}
                sx={{ flex: 1, minWidth: 0 }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Seksi>
  );
}
