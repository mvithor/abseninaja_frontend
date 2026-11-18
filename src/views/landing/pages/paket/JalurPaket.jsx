import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Tag from '../../components/Tag';
import TombolLanding from '../../components/TombolLanding';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { JALUR as D } from '../../data/paket';
import { colors, gradients, radius, shadows } from '../../theme/tokens';

const sxJudulKartu = { m: 0, fontSize: { xs: '20px', md: '26px' }, fontWeight: 600, lineHeight: 1.3 };
const sxHarga = { m: '8px 0 0', fontSize: { xs: '22px', md: '34px' }, fontWeight: 700, lineHeight: 1.2 };
const sxIsiKartu = { m: 0, fontSize: '15px', lineHeight: 1.7 };

// "Lengkap atau modular": dua kartu besar sejajar (satu kolom di bawah md).
// Kartu lengkap berlatar gradasi merek dengan label "Rekomendasi"; kartu
// modular putih bertepi dengan tag modul tambahan. Kolom harga berisi
// "Hubungi kami" (tidak ada angka harga di desain).
export default function JalurPaket() {
  const { lengkap, modular } = D;
  return (
    <Seksi varian="terang" id={D.id} sx={{ background: gradients.hero }} aria-labelledby="judul-jalur">
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-jalur" maxJudul={720} maxSub={540} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '28px',
          mt: '48px',
        }}
      >
        <Box
          sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            p: { xs: '26px 20px', md: '40px 36px' },
            borderRadius: radius.kartuXL,
            background: gradients.brand,
            color: colors.white,
            boxShadow: shadows.kartuAksen,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <Box component="h3" sx={sxJudulKartu}>
              {lengkap.judul}
            </Box>
            <Tag varian="status">{lengkap.status}</Tag>
          </Box>
          <Box component="p" sx={sxIsiKartu}>
            {renderTeks(lengkap.deskripsi)}
          </Box>
          <Box component="p" sx={sxHarga}>
            {lengkap.harga}
          </Box>
          <TombolLanding varian="putih" sx={{ mt: 'auto', alignSelf: 'flex-start' }} {...propsAksi(lengkap.aksi.rute)}>
            {lengkap.aksi.label}
          </TombolLanding>
        </Box>

        <Box
          sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            p: { xs: '26px 20px', md: '40px 36px' },
            borderRadius: radius.kartuXL,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.kartu,
          }}
        >
          <Box component="h3" sx={{ ...sxJudulKartu, color: colors.ink }}>
            {modular.judul}
          </Box>
          <Box component="p" sx={{ ...sxIsiKartu, color: colors.muted }}>
            {renderTeks(modular.deskripsi)}
          </Box>
          <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {modular.tag.map((t) => (
              <Tag key={t} sx={{ height: 30, fontSize: '13px' }}>
                {t}
              </Tag>
            ))}
          </Box>
          <Box component="p" sx={{ ...sxHarga, color: colors.ink }}>
            {modular.harga}
          </Box>
          <TombolLanding varian="garis" sx={{ mt: 'auto', alignSelf: 'flex-start' }} {...propsAksi(modular.aksi.rute)}>
            {modular.aksi.label}
          </TombolLanding>
        </Box>
      </Box>
    </Seksi>
  );
}
