import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { TEKS_FORMULIR } from '../data/formulir';
import { colors, layout, radius } from '../theme/tokens';
import { resetDaftar, resetTombol } from '../theme/sx';

// Pemilih "Lihat keadaan:" dari desain, untuk pratinjau keempat keadaan
// formulir. HANYA DEV: FormulirKonversi memuatnya lewat import dinamis di
// bawah import.meta.env.DEV dan merendernya hanya bila
// flags.pratinjauTombolAktif. Tidak ada di bundel produksi.
export default function PemilihKeadaan({ status, onPilih }) {
  const { label, keadaan } = TEKS_FORMULIR.pratinjau;
  return (
    <Box
      sx={{
        mt: '18px',
        pt: '14px',
        borderTop: `1px dashed ${colors.outline}`,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Box component="span" sx={{ fontSize: '12px', color: colors.muted }}>
        {label}
      </Box>
      <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {keadaan.map((k) => {
          const aktif = status === k.status;
          return (
            <li key={k.status}>
              <Box
                component="button"
                type="button"
                aria-pressed={aktif}
                onClick={() => onPilih(k.status)}
                sx={{
                  ...resetTombol,
                  minHeight: layout.targetSentuh,
                  px: '14px',
                  borderRadius: radius.tombol,
                  fontSize: '12px',
                  fontWeight: 600,
                  background: aktif ? colors.accent : colors.white,
                  color: aktif ? colors.white : colors.accent,
                  border: `1px solid ${aktif ? colors.accent : colors.outline}`,
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

PemilihKeadaan.propTypes = {
  status: PropTypes.string.isRequired,
  onPilih: PropTypes.func.isRequired,
};
