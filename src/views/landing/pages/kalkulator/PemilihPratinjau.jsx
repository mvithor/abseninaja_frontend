import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { JUMLAH_SOAL } from '../../data/kalkulator';
import { colors, layout, radius } from '../../theme/tokens';
import { resetDaftar, resetTombol } from '../../theme/sx';

const PRATINJAU = {
  label: 'Lihat keadaan:',
  keadaan: [
    { id: 'awal', label: 'Awal', langkah: 0, jawaban: [] },
    { id: 'soal', label: 'Soal', langkah: 3, jawaban: [2, 1] },
    { id: 'hasil', label: 'Hasil', langkah: JUMLAH_SOAL + 1, jawaban: [2, 1, 1, 0, 2, 1, 1] },
  ],
};

// Pemilih "Lihat keadaan:" dari desain, untuk melompat ke keadaan Awal, Soal, dan
// Hasil. Datanya (PRATINJAU) sengaja ada di berkas ini, bukan di data/kalkulator.js,
// supaya ikut terbuang dari bundel produksi bersama komponennya. Nilai sama dengan
// skrip desain: Soal = langkah 3 dengan dua jawaban, Hasil = semua soal terjawab.
// HANYA DEV: KartuKalkulator memuatnya lewat import dinamis di bawah
// import.meta.env.DEV dan merendernya hanya bila flags.pratinjauTombolAktif.
// Tidak ada di bundel produksi. `aktif` = id keadaan yang sedang tampil.
export default function PemilihPratinjau({ aktif, onPilih }) {
  return (
    <Box
      sx={{
        mt: '22px',
        pt: '14px',
        borderTop: `1px dashed ${colors.outline}`,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Box component="span" sx={{ fontSize: '12px', color: colors.muted }}>
        {PRATINJAU.label}
      </Box>
      <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {PRATINJAU.keadaan.map((k) => {
          const on = aktif === k.id;
          return (
            <li key={k.id}>
              <Box
                component="button"
                type="button"
                aria-pressed={on}
                onClick={() => onPilih(k)}
                sx={{
                  ...resetTombol,
                  minHeight: layout.targetSentuh,
                  px: '14px',
                  borderRadius: radius.tombol,
                  fontSize: '12px',
                  fontWeight: 600,
                  background: on ? colors.accent : colors.white,
                  color: on ? colors.white : colors.accent,
                  border: `1px solid ${on ? colors.accent : colors.outline}`,
                }}
              >
                {k.label}
              </Box>
            </li>
          );
        })}
      </Box>
    </Box>
  );
}

PemilihPratinjau.propTypes = {
  aktif: PropTypes.string.isRequired,
  onPilih: PropTypes.func.isRequired,
};
