import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, peragaLad, radius } from '../../theme/tokens';

// Peraga "Saran tindak lanjut" (bagian "Dari bukti ke langkah"): satu draf dengan
// empat kolom isian. Data contoh: DUMMY wajib diganti sebelum main
// (data/analitikMock.js). Dekoratif, aria-hidden: tombol dan tab di sini hanya
// gambar (span), tidak bisa difokus atau diklik.
const sxTab = { px: '9px', py: '5px', borderRadius: radius.menuItem, fontSize: '11px' };

export default function SaranTindakLanjutMock({ data }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        boxSizing: 'border-box',
        p: '20px',
        borderRadius: radius.kartuSedang,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: peragaLad.bayangan.kartuProfil,
      }}
    >
      <Box sx={{ fontSize: '15px', fontWeight: 700, color: colors.ink }}>{data.judul}</Box>
      <Box sx={{ mt: '2px', fontSize: '12px', color: colors.muted }}>{data.sub}</Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: '10px' }}>
        {data.tab.map((t) => (
          <Box
            key={t.kode}
            component="span"
            sx={{
              ...sxTab,
              ...(t.aktif
                ? { fontWeight: 700, color: colors.accent, border: `1px solid ${colors.accent}`, background: colors.tint }
                : { color: colors.body, border: `1px solid ${colors.border}` }),
            }}
          >
            {t.kode} {t.nama}
          </Box>
        ))}
      </Box>
      {data.kolom.map((k) => (
        <Box key={k.label} sx={{ mt: '10px' }}>
          <Box sx={{ fontSize: '12px', fontWeight: 700, color: colors.ink }}>
            {k.label}
            {k.wajib && (
              <Box component="span" sx={{ ml: '4px', color: peragaLad.wajib }}>
                *
              </Box>
            )}
          </Box>
          <Box
            sx={{
              mt: '4px',
              p: '9px 11px',
              borderRadius: '10px',
              background: peragaLad.belumCukupBg,
              border: `1px solid ${colors.border}`,
              fontSize: '12px',
              lineHeight: 1.5,
              color: peragaLad.inkSedang,
            }}
          >
            {k.isi}
          </Box>
        </Box>
      ))}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: '12px' }}>
        <Box
          component="span"
          sx={{ px: '14px', py: '8px', borderRadius: '10px', background: colors.brand, color: colors.white, fontSize: '12px', fontWeight: 700 }}
        >
          {data.aksi.pakai}
        </Box>
        <Box
          component="span"
          sx={{
            px: '14px',
            py: '8px',
            borderRadius: '10px',
            border: `1px solid ${peragaLad.batasAbu}`,
            color: colors.accent,
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {data.aksi.abaikan}
        </Box>
      </Box>
    </Box>
  );
}

SaranTindakLanjutMock.propTypes = {
  data: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    sub: PropTypes.string.isRequired,
    tab: PropTypes.array.isRequired,
    kolom: PropTypes.array.isRequired,
    aksi: PropTypes.shape({ pakai: PropTypes.string, abaikan: PropTypes.string }).isRequired,
  }).isRequired,
};
