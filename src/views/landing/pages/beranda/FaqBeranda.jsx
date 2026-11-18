import { useId, useRef, useState } from 'react';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Faq from '../../components/Faq';
import { idTab } from '../../components/idTab';
import { FAQ as D } from '../../data/beranda';
import { colors, gradients, radius } from '../../theme/tokens';
import { resetTombol } from '../../theme/sx';
import { JARAK, PAD_SEKSI, sxJudulBeranda } from './gaya';

// FAQ bertab: panel gelap berisi tab vertikal (Tentang, Keamanan, Biaya) di
// kiri, akordeon Faq di kanan. Tab memakai roving tabindex dan panah atas
// bawah (juga kiri kanan), Home, End. Mengganti tab membuka butir pertama
// (Faq dipasang ulang lewat key).
export default function FaqBeranda() {
  const dasar = useId();
  const idPanel = `${dasar}-panel`;
  const refs = useRef([]);
  const { kelompok } = D;
  const [aktif, setAktif] = useState(kelompok[0].id);
  const indeksAktif = Math.max(0, kelompok.findIndex((k) => k.id === aktif));

  const pindah = (indeks) => {
    const n = (indeks + kelompok.length) % kelompok.length;
    setAktif(kelompok[n].id);
    refs.current[n]?.focus();
  };

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); pindah(i + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); pindah(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); pindah(0); }
    else if (e.key === 'End') { e.preventDefault(); pindah(kelompok.length - 1); }
  };

  return (
    <Seksi varian="tint" id={D.id} padAtas={PAD_SEKSI} padBawah={PAD_SEKSI} aria-labelledby="judul-faq">
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-faq" maxJudul={700} sx={sxJudulBeranda} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,0.75fr) minmax(0,1.25fr)' },
          gap: '28px',
          mt: JARAK.faq,
          alignItems: 'start',
        }}
      >
        <Box
          role="tablist"
          aria-label={D.labelTab}
          aria-orientation="vertical"
          sx={{ display: 'flex', flexDirection: 'column', gap: '6px', p: '16px', background: gradients.dark, borderRadius: radius.kartuBesar }}
        >
          {kelompok.map((k, i) => {
            const on = k.id === aktif;
            return (
              <Box
                key={k.id}
                component="button"
                type="button"
                role="tab"
                id={idTab(dasar, k.id)}
                aria-selected={on}
                aria-controls={idPanel}
                tabIndex={i === indeksAktif ? 0 : -1}
                ref={(el) => { refs.current[i] = el; }}
                onClick={() => setAktif(k.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                sx={{
                  ...resetTombol,
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 48,
                  p: '14px 16px',
                  borderRadius: radius.kartuKecil,
                  background: on ? colors.glassGaris : 'transparent',
                  color: colors.white,
                  fontSize: '15px',
                  fontWeight: on ? 600 : 500,
                  '&:hover': { background: on ? colors.glassGaris : colors.glass },
                }}
              >
                {k.nama}
              </Box>
            );
          })}
        </Box>
        <Box role="tabpanel" id={idPanel} aria-labelledby={idTab(dasar, aktif)}>
          <Faq key={aktif} butir={kelompok[indeksAktif].butir} sx={{ maxWidth: 'none', mx: 0 }} />
        </Box>
      </Box>
    </Seksi>
  );
}
