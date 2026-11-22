import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import Tag from '../../components/Tag';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { REGISTRI_RUTE } from '../../data/nav';
import { ARTIKEL_HALAMAN as D } from '../../data/blog';
import { formatMenitBaca, formatTanggal } from '../../lib/blog.js';
import { colors, gradients, huruf, layout, radius } from '../../theme/tokens';
import { resetDaftar, resetTautan } from '../../theme/sx';

// Hero artikel: remah roti (Blog, kategori, judul), label kategori, h1 satu-satunya
// di halaman, dan baris penulis. Remah "Blog" menaut ke daftar; kategori hanya
// teks (belum ada halaman per kategori); butir terakhir aria-current="page".
// Tautan remah diberi tinggi sentuh 44 px; margin negatif mengembalikan jarak
// visual ke ukuran desain. Avatar inisial hanya hiasan (aria-hidden): nama penulis
// ada di teks.
const sxButir = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: layout.targetSentuh,
  maxWidth: '100%',
};

export default function HeroArtikel({ artikel, idJudul }) {
  const { judul, kategori, tanggal, menitBaca } = artikel;
  return (
    <Seksi varian="hero" padAtas={{ xs: '32px', md: '64px' }} padBawah={{ xs: '24px', md: '48px' }} aria-labelledby={idJudul}>
      <Box component="nav" aria-label={D.remah.label} sx={{ my: '-12px', maxWidth: '100%' }}>
        <Box
          component="ol"
          role="list"
          sx={{
            ...resetDaftar,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            columnGap: '8px',
            fontSize: '13px',
            color: colors.muted,
          }}
        >
          <Box component="li" sx={sxButir}>
            <Box component={RouterLink} to={REGISTRI_RUTE.blog.to} sx={{ ...resetTautan, ...sxButir, '&:hover': { textDecoration: 'underline' } }}>
              {D.remah.blog}
            </Box>
          </Box>
          <Box component="li" aria-hidden="true" sx={sxButir}>
            /
          </Box>
          <Box component="li" sx={sxButir}>
            {kategori}
          </Box>
          <Box component="li" aria-hidden="true" sx={sxButir}>
            /
          </Box>
          <Box component="li" aria-current="page" sx={{ ...sxButir, color: colors.accent, fontWeight: 600, textAlign: 'center' }}>
            {judul}
          </Box>
        </Box>
      </Box>
      <Tag varian="status">{kategori}</Tag>
      <Box
        component="h1"
        id={idJudul}
        sx={{ m: 0, maxWidth: 860, color: colors.ink, textWrap: 'balance', ...huruf.judulUtama, ...huruf.judulHeroArtikel }}
      >
        {judul}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: colors.muted }}>
        <Box
          aria-hidden="true"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            flex: 'none',
            borderRadius: radius.lingkaran,
            background: gradients.brand,
            color: colors.white,
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {D.penulis.inisial}
        </Box>
        <Box component="span">
          {D.penulis.nama}{' '}
          <Box component="span" aria-hidden="true">
            ·
          </Box>{' '}
          <time dateTime={tanggal}>{formatTanggal(tanggal)}</time>{' '}
          <Box component="span" aria-hidden="true">
            ·
          </Box>{' '}
          {formatMenitBaca(menitBaca)}
        </Box>
        <PenandaVerifikasi verifikasi={D.penulis.verifikasi} />
      </Box>
    </Seksi>
  );
}

HeroArtikel.propTypes = {
  artikel: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    kategori: PropTypes.string.isRequired,
    tanggal: PropTypes.string.isRequired,
    menitBaca: PropTypes.number.isRequired,
  }).isRequired,
  idJudul: PropTypes.string.isRequired,
};
