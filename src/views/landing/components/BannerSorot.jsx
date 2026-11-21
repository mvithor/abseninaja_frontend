import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Kontainer from './Kontainer';
import KotakIkon from './KotakIkon';
import Tag from './Tag';
import TombolLanding from './TombolLanding';
import { DaftarBlob } from './Blob';
import { blobs, colors, gradients, huruf, radius, shadows } from '../theme/tokens';

// Banner sorot (desain Keamanan dan Testimoni): kartu gradasi merek sudut 32
// dengan kilau, di kiri blok teks (ikon kuning ATAU label status di atas judul),
// di kanan satu tombol. Judul h2. Satu tombol saja (`aksi`:
// { label, varian?, ikonAkhir?, ...props TombolLanding }). `penanda` = penanda
// desain (PenandaVerifikasi) di bawah teks.
//  ikon  : kotak ikon kuning 64 di kiri teks (Keamanan)
//  tag   : label status di atas judul (Testimoni)
//  padMd : padding web (seluler selalu 26px 20px)
export default function BannerSorot({
  id,
  ikon,
  tag,
  judul,
  teks,
  aksi,
  penanda,
  ukuranJudul = huruf.judulSorot,
  padMd = '36px 40px',
  padAtas = { xs: '4px', md: '8px' },
  padBawah = { xs: '28px', md: '56px' },
  maxTeks = 720,
}) {
  const { label, varian = 'putih', ...propsAksi } = aksi;
  return (
    <Box component="section" aria-labelledby={id} sx={{ pt: padAtas, pb: padBawah }}>
      <Kontainer>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '28px',
            boxSizing: 'border-box',
            p: { xs: '26px 20px', md: padMd },
            borderRadius: radius.kartuXL,
            background: gradients.brand,
            color: colors.white,
            boxShadow: shadows.kartuAksen,
          }}
        >
          <DaftarBlob daftar={blobs.banner} />
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '20px', maxWidth: maxTeks, minWidth: 0 }}>
            {ikon && (
              <KotakIkon
                ikon={ikon}
                ukuran={64}
                ikonUkuran={32}
                sudut="20px"
                latar={colors.yellow}
                warna={colors.yellowInk}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              {tag && <Tag varian="status">{tag}</Tag>}
              <Box component="h2" id={id} sx={{ m: 0, mt: tag ? '12px' : 0, color: colors.white, ...ukuranJudul }}>
                {judul}
              </Box>
              <Box component="p" sx={{ m: 0, mt: '6px', fontSize: '15px', lineHeight: 1.65, color: colors.white }}>
                {teks}
              </Box>
              {penanda}
            </Box>
          </Box>
          <TombolLanding varian={varian} sx={{ position: 'relative' }} {...propsAksi}>
            {label}
          </TombolLanding>
        </Box>
      </Kontainer>
    </Box>
  );
}

BannerSorot.propTypes = {
  id: PropTypes.string.isRequired,
  ikon: PropTypes.elementType,
  tag: PropTypes.string,
  judul: PropTypes.node.isRequired,
  teks: PropTypes.node.isRequired,
  aksi: PropTypes.shape({ label: PropTypes.string.isRequired }).isRequired,
  penanda: PropTypes.node,
  ukuranJudul: PropTypes.object,
  padMd: PropTypes.string,
  padAtas: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  padBawah: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  maxTeks: PropTypes.number,
};
