import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Tag from './Tag';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, gradients, radius, shadows } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Langkah bernomor. Hanya untuk isi yang memang berurutan (daftar berurutan <ol>).
// Varian (`varian`):
//  kartu    : kotak nomor gradasi + garis penghubung mendatar, di bawahnya
//             kartu; disusun `kolom` kolom (bawaan).
//  linimasa : lajur nomor dengan garis tegak di kiri, kartu di kanan (satu
//             kolom, selebar maks 820). Butir boleh memuat `label` (label
//             status), `tag` (daftar chip), dan `verifikasi` (penanda desain).
function Nomor({ i, sx }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        borderRadius: radius.ikon,
        background: gradients.brand,
        color: colors.white,
        fontWeight: 700,
        ...sx,
      }}
    >
      {String(i + 1).padStart(2, '0')}
    </Box>
  );
}

Nomor.propTypes = { i: PropTypes.number.isRequired, sx: PropTypes.object };

function Linimasa({ langkah, sx }) {
  const n = langkah.length;
  return (
    // role="list": Safari dan VoiceOver membuang semantik daftar bila list-style: none.
    <Box component="ol" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', maxWidth: 820, mx: 'auto', ...sx }}>
      {langkah.map((l, i) => {
        const akhir = i === n - 1;
        return (
          <Box key={l.judul} component="li" sx={{ display: 'flex', alignItems: 'stretch', gap: '24px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Nomor i={i} sx={{ width: 52, height: 52, fontSize: '16px', boxShadow: shadows.tombol }} />
              {!akhir && (
                <Box
                  aria-hidden="true"
                  sx={{ flex: 1, width: '2px', mt: '8px', minHeight: 40, background: gradients.stepLineVertikal }}
                />
              )}
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                boxSizing: 'border-box',
                p: { xs: '24px 20px', md: '24px 28px' },
                mb: akhir ? 0 : '20px',
                borderRadius: radius.kartuSedang,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              {l.label && (
                <Tag varian="status" sx={{ background: colors.tint, color: colors.accent }}>
                  {l.label}
                </Tag>
              )}
              <Box
                component="h3"
                sx={{ m: '12px 0 0', fontSize: { xs: '17px', md: '20px' }, fontWeight: 600, color: colors.ink }}
              >
                {l.judul}
              </Box>
              <Box component="p" sx={{ m: '6px 0 0', fontSize: '14px', lineHeight: 1.7, color: colors.muted }}>
                {l.deskripsi}
              </Box>
              {(l.tag?.length > 0 || l.verifikasi) && (
                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', mt: '14px' }}>
                  {l.tag?.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                  <PenandaVerifikasi verifikasi={l.verifikasi} />
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

Linimasa.propTypes = {
  langkah: PropTypes.arrayOf(PropTypes.object).isRequired,
  sx: PropTypes.object,
};

// Tambahan varian kartu: `jarak` (gap kisi, bawaan 24 seluler dan 20 web),
// `sxJudul` (penyesuaian judul kartu, mis. ukuran huruf seluler halaman LAD), dan
// `sxKartu` (penyesuaian kartu, mis. padding). Butir boleh memuat `verifikasi`
// (penanda desain di bawah deskripsi; tidak menambah apa pun bila penanda mati).
export default function LangkahBernomor({
  langkah,
  kolom = 3,
  varian = 'kartu',
  jarak = { xs: '24px', md: '20px' },
  sxJudul,
  sxKartu,
  sx,
}) {
  if (varian === 'linimasa') return <Linimasa langkah={langkah} sx={sx} />;
  return (
    <Box
      component="ol"
      // role="list": Safari dan VoiceOver membuang semantik daftar bila list-style: none.
      role="list"
      sx={{
        ...resetDaftar,
        display: 'grid',
        gap: jarak,
        gridTemplateColumns: {
          xs: 'minmax(0,1fr)',
          md: `repeat(${kolom}, minmax(0,1fr))`,
        },
        ...sx,
      }}
    >
      {langkah.map((l, i) => (
        <Box key={l.judul} component="li" sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Nomor i={i} sx={{ width: 48, height: 48, fontSize: '15px' }} />
            <Box aria-hidden="true" sx={{ flex: 1, height: '2px', background: gradients.stepLine }} />
          </Box>
          <Box
            sx={{
              p: { xs: '22px 20px', md: '22px 24px' },
              borderRadius: radius.kartuSedang,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: 'none',
              flex: 1,
              ...sxKartu,
            }}
          >
            <Box
              component="h3"
              sx={{ m: 0, fontSize: { xs: '17px', md: '18px' }, fontWeight: 600, color: colors.ink, ...sxJudul }}
            >
              {l.judul}
            </Box>
            <Box component="p" sx={{ m: '6px 0 0', fontSize: '14px', lineHeight: 1.7, color: colors.muted }}>
              {l.deskripsi}
            </Box>
            <PenandaVerifikasi verifikasi={l.verifikasi} sx={{ mt: '10px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

LangkahBernomor.propTypes = {
  langkah: PropTypes.arrayOf(
    PropTypes.shape({
      judul: PropTypes.string.isRequired,
      deskripsi: PropTypes.node,
      label: PropTypes.string,
      tag: PropTypes.arrayOf(PropTypes.string),
      verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    }),
  ).isRequired,
  kolom: PropTypes.number,
  varian: PropTypes.oneOf(['kartu', 'linimasa']),
  jarak: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sxJudul: PropTypes.object,
  sxKartu: PropTypes.object,
  sx: PropTypes.object,
};
