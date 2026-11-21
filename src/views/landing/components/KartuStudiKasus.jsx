import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Tag from './Tag';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, huruf, radius, shadows } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Kartu studi kasus sekolah (desain Dampak): tag jenjang dan wilayah, nama
// sekolah, ringkasan, tiga metrik (sebelum, sesudah, perubahan) dalam daftar
// definisi, dan sumber data. Dipakai di dalam <li>; nama sekolah h3.
// `deskripsi` boleh { web, mobile } yang sudah dirender pemanggil.
export default function KartuStudiKasus({ tag = [], nama, deskripsi, metrik, sumber, verifikasi }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        height: '100%',
        boxSizing: 'border-box',
        textAlign: 'left',
        p: { xs: '26px 20px', md: '34px 36px' },
        borderRadius: radius.kartuXL,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
      }}
    >
      <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tag.map((t) => (
          <li key={t}>
            <Tag>{t}</Tag>
          </li>
        ))}
      </Box>
      <Box component="h3" sx={{ m: 0, color: colors.ink, ...huruf.judulKartuBesar }}>
        {nama}
      </Box>
      <Box component="p" sx={{ m: 0, color: colors.muted, ...huruf.isi }}>
        {deskripsi}
      </Box>
      <Box
        component="dl"
        sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '10px' }}
      >
        {metrik.map((m) => (
          <Box
            key={m.label}
            sx={{
              minWidth: 0,
              background: colors.tint,
              border: `1px solid ${colors.kartuTintGaris}`,
              borderRadius: radius.kartuKecil,
              p: '14px 16px',
              // Lebar 360 px: tiga kolom hanya menyisakan sekitar 54 px; padding
              // dirapatkan agar kata "Perubahan" tidak keluar kotak.
              '@media (max-width:379px)': { px: '10px' },
            }}
          >
            <Box component="dt" sx={{ fontSize: '11px', color: colors.muted }}>
              {m.label}
            </Box>
            <Box component="dd" sx={{ m: 0, color: colors.ink, ...huruf.angkaStudi }}>
              {m.nilai}
            </Box>
          </Box>
        ))}
      </Box>
      <Box component="p" sx={{ m: 0, fontSize: '12px', color: colors.muted }}>
        {sumber}
      </Box>
      <PenandaVerifikasi verifikasi={verifikasi} sx={{ alignSelf: 'flex-start' }} />
    </Box>
  );
}

KartuStudiKasus.propTypes = {
  tag: PropTypes.arrayOf(PropTypes.string),
  nama: PropTypes.string.isRequired,
  deskripsi: PropTypes.node.isRequired,
  metrik: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, nilai: PropTypes.string.isRequired })).isRequired,
  sumber: PropTypes.string.isRequired,
  verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
