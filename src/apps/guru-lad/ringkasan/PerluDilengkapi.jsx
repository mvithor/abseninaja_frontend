import { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KartuBagian from './KartuBagian';
import { gayaTautan, warnaRingkasan } from './gayaRingkasan';
import { butirLengkapi } from './ringkasan';

/**
 * Apa yang masih kosong dan menahan penilaian. Kartu ini bergaris putus-putus: ia tidak boleh dibaca sebagai
 * kabar baik saat kosong, dan selama ada isinya, siswa terkait tidak dinyatakan aman.
 */
const PerluDilengkapi = forwardRef(({ data, onBuka }, ref) => {
  const w = warnaRingkasan(useTheme());
  const butir = useMemo(() => butirLengkapi(data), [data]);
  return (
    <KartuBagian
      id="lengkapi"
      judul="Yang perlu dilengkapi"
      keterangan={butir.length > 0
        ? 'Selama bagian ini terisi, siswa terkait tidak dinyatakan aman.'
        : 'Semua isian yang dibutuhkan pola sudah lengkap.'}
      gaya="putus"
    >
      <Box ref={ref} tabIndex={-1} sx={{ outline: 'none', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {butir.length === 0 && (
          <Typography sx={{ fontSize: 14, color: w.sekunder, lineHeight: 1.5 }}>
            Tidak ada TP atau proyek yang kosong, dan tidak ada siswa yang polanya belum bisa dinilai.
          </Typography>
        )}
        {butir.map((b) => (
          <Box
            key={b.kunci}
            sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: { md: 'center' }, gap: { xs: 0.75, md: 1.5 }, borderTop: `1px solid ${w.garis}`, borderRadius: 0, pt: 1.25,
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            <Box sx={{ flex: { md: '1 1 200px' }, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, lineHeight: '20px', color: w.ink }}>{b.teks}</Typography>
              {b.rinci && b.rinci.length > 0 && (
                <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.25, fontSize: 13, lineHeight: '19px', color: w.sekunder }}>
                  {b.rinci.map((r) => <li key={r}>{r}</li>)}
                </Box>
              )}
            </Box>
            <Box component="button" type="button" onClick={() => onBuka(b)} sx={gayaTautan(w)}>{b.aksi}</Box>
          </Box>
        ))}
      </Box>
    </KartuBagian>
  );
});
PerluDilengkapi.displayName = 'PerluDilengkapi';
PerluDilengkapi.propTypes = { data: PropTypes.object.isRequired, onBuka: PropTypes.func.isRequired };

export default PerluDilengkapi;
