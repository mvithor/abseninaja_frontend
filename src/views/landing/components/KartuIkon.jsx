import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Tag from './Tag';
import { colors, gradients, huruf, radius, shadows } from '../theme/tokens';

// Kartu ikon. Varian (`varian`):
//  terang : kartu putih bertepi, ikon dalam kotak gradasi merek (latar terang)
//  kaca   : kartu kaca di latar gelap, ikon dalam kotak kuning; `aksen`
//           mengisi kartu dengan gradasi merek.
// Tata letak (`tata`):
//  tumpuk : ikon di atas judul (bawaan)
//  sebaris: ikon di kiri judul, kartu sudut 24 (kartu modul halaman Fitur)
// Tambahan: `status` = label status berteks setelah tag, `penanda` = penanda
// desain (PenandaVerifikasi) di baris tag, `ikonSx` = penyesuaian kotak ikon.
export default function KartuIkon({
  ikon,
  judul,
  deskripsi,
  tag = [],
  status,
  penanda,
  varian = 'terang',
  aksen = false,
  tata = 'tumpuk',
  tingkatJudul = 'h3',
  ekstra,
  ikonSx,
  sx,
}) {
  const Ikon = ikon;
  const kaca = varian === 'kaca';
  const sebaris = tata === 'sebaris';
  const adaBarisTag = tag.length > 0 || Boolean(status) || Boolean(penanda);

  const kotakIkon = (
    <Box
      aria-hidden="true"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sebaris ? { xs: 46, md: 52 } : { xs: 48, md: 56 },
        height: sebaris ? { xs: 46, md: 52 } : { xs: 48, md: 56 },
        flex: 'none',
        borderRadius: sebaris ? { xs: '14px', md: radius.ikon } : radius.ikon,
        background: kaca ? colors.yellow : gradients.brand,
        color: kaca ? colors.yellowInk : colors.white,
        alignSelf: sebaris ? 'center' : 'flex-start',
        ...ikonSx,
      }}
    >
      <Ikon size={26} stroke={1.8} />
    </Box>
  );

  const judulEl = (
    <Box
      component={tingkatJudul}
      sx={{ m: 0, color: kaca ? colors.white : colors.ink, ...(sebaris ? huruf.judulModul : huruf.judulKartu) }}
    >
      {judul}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxSizing: 'border-box',
        p: sebaris ? '26px 24px' : { xs: '26px 20px', md: '28px 26px' },
        borderRadius: sebaris ? radius.kartuSedang : radius.kartuBesar,
        ...(kaca
          ? {
              background: aksen ? gradients.brand : colors.glass,
              border: `1px solid ${colors.glassLine}`,
            }
          : {
              background: colors.white,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.kartu,
            }),
        ...sx,
      }}
    >
      {sebaris ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {kotakIkon}
          {judulEl}
        </Box>
      ) : (
        <>
          {kotakIkon}
          {judulEl}
        </>
      )}
      <Box
        component="p"
        sx={{
          m: 0,
          color: kaca ? colors.onDarkSoft : colors.muted,
          ...huruf.isi,
          ...(sebaris ? { lineHeight: 1.65 } : null),
        }}
      >
        {deskripsi}
      </Box>
      {ekstra}
      {adaBarisTag && (
        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', mt: sebaris ? '2px' : 'auto' }}>
          {tag.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          {status && <Tag varian="status">{status}</Tag>}
          {penanda}
        </Box>
      )}
    </Box>
  );
}

KartuIkon.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  judul: PropTypes.node.isRequired,
  deskripsi: PropTypes.node,
  tag: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.string,
  penanda: PropTypes.node,
  varian: PropTypes.oneOf(['terang', 'kaca']),
  aksen: PropTypes.bool,
  tata: PropTypes.oneOf(['tumpuk', 'sebaris']),
  tingkatJudul: PropTypes.oneOf(['h2', 'h3', 'h4', 'div']),
  ekstra: PropTypes.node,
  ikonSx: PropTypes.object,
  sx: PropTypes.object,
};
