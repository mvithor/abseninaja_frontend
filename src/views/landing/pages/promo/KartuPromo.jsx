import { Box } from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import Tag from '../../components/Tag';
import TombolLanding from '../../components/TombolLanding';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { DaftarBlob } from '../../components/Blob';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import useHitungMundur from '../../lib/useHitungMundur';
import { duaDigit } from '../../lib/hitungMundur';
import { AKHIR_PROMO_MS, KARTU as D, SATUAN_HITUNG } from '../../data/promo';
import { blobs, colors, gradients, huruf, radius, shadows } from '../../theme/tokens';

// Kartu promo: panel gradasi merek dengan tag, judul, keterangan, tombol kuning,
// dan tiga kotak hitung mundur. Sisa waktu dihitung dari AKHIR_PROMO (data/promo.js)
// saat mount dan diperbarui tiap menit; sebelum dihitung kotak menampilkan "--"
// (tinggi tetap, tanpa CLS) dan disembunyikan dari pembaca layar. Bila promo
// sudah berakhir, kotak disembunyikan dan tombol diganti keterangan jujur.
export default function KartuPromo() {
  const sisa = useHitungMundur(AKHIR_PROMO_MS);
  const berakhir = sisa?.berakhir === true;
  return (
    <Seksi
      varian="terang"
      id={D.id}
      padAtas="0px"
      padBawah={{ xs: '32px', md: '64px' }}
      aria-labelledby="judul-kartu-promo"
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: { xs: '24px', md: '36px' },
          p: { xs: '26px 20px', md: '48px 52px' },
          borderRadius: radius.kartuPromo,
          background: gradients.brand,
          color: colors.white,
          boxShadow: shadows.kartuAksen,
        }}
      >
        <DaftarBlob daftar={blobs.banner} />
        <Box sx={{ position: 'relative', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
          <Tag varian="status">{D.tag}</Tag>
          <Box id="judul-kartu-promo" component="h2" sx={{ m: 0, ...huruf.judulPromo }}>
            {D.judul}
          </Box>
          <Box component="p" sx={{ m: 0, fontSize: '15px', lineHeight: 1.7 }}>
            {renderTeks(D.deskripsi)}
          </Box>
          {berakhir ? (
            <Box component="p" role="status" sx={{ m: '6px 0 0', fontSize: '15px', fontWeight: 600 }}>
              {D.berakhir}
            </Box>
          ) : (
            <TombolLanding
              varian="kuning"
              sx={{ mt: '6px' }}
              ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" />}
              {...propsAksi(D.aksi.rute)}
            >
              {D.aksi.label}
            </TombolLanding>
          )}
          <PenandaVerifikasi verifikasi={D.verifikasi} />
        </Box>
        {/* Di seluler kotak melebar sama rata (desain 92 px x 3 melebihi lebar kartu di 360 px). */}
        {!berakhir && (
          <Box
            role="group"
            aria-label={D.labelHitung}
            aria-hidden={sisa === null ? 'true' : undefined}
            sx={{ position: 'relative', display: 'flex', gap: '12px', width: { xs: '100%', md: 'auto' } }}
          >
            {SATUAN_HITUNG.map((s) => (
              <Box
                key={s.kunci}
                sx={{
                  boxSizing: 'border-box',
                  flex: { xs: '1 1 0', md: 'none' },
                  minWidth: { xs: 0, md: 92 },
                  p: { xs: '16px 8px', md: '16px 22px' },
                  textAlign: 'center',
                  borderRadius: radius.kartu,
                  background: colors.glassPromo,
                  border: `1px solid ${colors.garisPromo}`,
                }}
              >
                <Box component="span" sx={{ display: 'block', ...huruf.angkaBesar }}>
                  {sisa ? duaDigit(sisa[s.kunci]) : '--'}
                </Box>
                <Box component="span" sx={{ display: 'block', mt: '4px', fontSize: '12px' }}>
                  {s.label}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Seksi>
  );
}
