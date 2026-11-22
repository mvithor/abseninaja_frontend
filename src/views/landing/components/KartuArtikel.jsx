import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import Tag from './Tag';
import { formatMenitBaca, formatTanggal } from '../lib/blog.js';
import { colors, gradients, huruf, radius, shadows } from '../theme/tokens';
import { resetTautan } from '../theme/sx';

// Kartu artikel Blog (daftar dan "Baca juga"): seluruh kartu adalah satu tautan
// ke artikelnya (tanpa tautan bersarang), jadi seluruh kartu bisa diklik dan
// hanya satu perhentian papan ketik. Urutan baca: kategori, waktu baca dan tanggal,
// judul (heading, bawaan h3), ringkasan, lalu ajakan. Nama tautan sengaja dibiarkan
// berasal dari isi kartu (tanpa aria-labelledby) supaya kata "Baca selengkapnya"
// yang terlihat ikut menjadi namanya. Kotak gambar hanya hiasan (aria-hidden); ikon
// dipilih pemanggil menurut kategori.
// Props: artikel { judul, kategori, tanggal, menitBaca, ringkasan }, `ikon`
// (komponen Tabler), `tujuan` (path artikel), `teksBaca` (ajakan di dasar kartu),
// `tingkatJudul` (h2 sampai h4).
export default function KartuArtikel({ artikel, ikon, tujuan, teksBaca, tingkatJudul = 'h3' }) {
  const Ikon = ikon;
  const { judul, kategori, tanggal, menitBaca, ringkasan } = artikel;
  return (
    <Box
      component={RouterLink}
      to={tujuan}
      sx={{
        ...resetTautan,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxSizing: 'border-box',
        flex: 1,
        minWidth: 0,
        p: '16px',
        textAlign: 'left',
        borderRadius: radius.kartuBesar,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
        '&:hover': { borderColor: colors.outline },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 150,
          boxSizing: 'border-box',
          borderRadius: radius.kartu,
          background: gradients.tint,
          border: `1px solid ${colors.border}`,
          color: colors.accent,
        }}
      >
        <Ikon size={36} stroke={1.6} />
      </Box>
      <Box>
        <Tag varian="status">{kategori}</Tag>
      </Box>
      <Box sx={{ fontSize: '12px', color: colors.muted }}>
        {formatMenitBaca(menitBaca)}{' '}
        <Box component="span" aria-hidden="true">
          ·
        </Box>{' '}
        <time dateTime={tanggal}>{formatTanggal(tanggal)}</time>
      </Box>
      <Box component={tingkatJudul} sx={{ m: 0, color: colors.ink, ...huruf.judulKartuArtikel }}>
        {judul}
      </Box>
      <Box component="p" sx={{ m: 0, fontSize: '13px', lineHeight: 1.7, color: colors.muted }}>
        {ringkasan}
      </Box>
      <Box
        component="span"
        sx={{ mt: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: colors.accent }}
      >
        {teksBaca}
        <IconArrowRight size={16} stroke={2.2} aria-hidden="true" style={{ flex: 'none' }} />
      </Box>
    </Box>
  );
}

KartuArtikel.propTypes = {
  artikel: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    kategori: PropTypes.string.isRequired,
    tanggal: PropTypes.string.isRequired,
    menitBaca: PropTypes.number.isRequired,
    ringkasan: PropTypes.string.isRequired,
  }).isRequired,
  ikon: PropTypes.elementType.isRequired,
  tujuan: PropTypes.string.isRequired,
  teksBaca: PropTypes.string.isRequired,
  tingkatJudul: PropTypes.oneOf(['h2', 'h3', 'h4']),
};
