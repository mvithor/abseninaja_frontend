import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import PenandaVerifikasi from '../components/PenandaVerifikasi';
import { colors, huruf, peraga, radius } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Peraga "Perlu perhatian" untuk banner analitik pembelajaran (halaman Fitur).
// Data dummy, dekoratif: aria-hidden. Bentuk data: lihat MOCK_PERHATIAN di
// data/fitur.js. `sx` menyesuaikan kartu (halaman Akun Guru Mandiri memakai
// kartu putih bertepi di latar terang).
export default function PerhatianMock({ data, sx }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'relative',
        boxSizing: 'border-box',
        p: '22px',
        borderRadius: radius.kartuSedang,
        background: colors.white,
        color: colors.body,
        boxShadow: peraga.bayangan.perhatian,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <Box component="span" sx={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>
          {data.judul}
        </Box>
        <PenandaVerifikasi verifikasi={data.verifikasi} />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
          gap: '10px',
          mt: '14px',
        }}
      >
        {data.ringkasan.map((r) => (
          <Box
            key={r.label}
            sx={{
              p: '10px 12px',
              borderRadius: radius.kartuStat,
              background: colors.tint,
              border: `1px solid ${colors.kartuTintGaris}`,
            }}
          >
            <Box sx={{ fontSize: '11px', color: colors.muted }}>{r.label}</Box>
            <Box sx={{ color: colors.ink, ...huruf.angkaKartuTeks }}>{r.nilai}</Box>
          </Box>
        ))}
      </Box>
      <Box component="ul" role="list" sx={{ ...resetDaftar, mt: '12px', fontSize: '13px' }}>
        {data.baris.map((b, i) => (
          <Box
            key={b.teks}
            component="li"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              p: i === data.baris.length - 1 ? '11px 0 0' : '11px 0',
              borderTop: `1px solid ${colors.borderSoft}`,
            }}
          >
            <Box component="span" sx={{ minWidth: 0, color: colors.ink }}>
              {b.teks}
            </Box>
            <Box component="span" sx={{ flex: 'none', color: colors.muted }}>
              {b.aksi}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

PerhatianMock.propTypes = {
  data: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    ringkasan: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, nilai: PropTypes.string })).isRequired,
    baris: PropTypes.arrayOf(PropTypes.shape({ teks: PropTypes.string, aksi: PropTypes.string })).isRequired,
  }).isRequired,
  sx: PropTypes.object,
};
