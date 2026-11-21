import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KotakIkon from '../../components/KotakIkon';
import TandaPenanda from '../../components/TandaPenanda';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { PENANDA as D } from '../../data/analitik';
import { colors, peragaLad, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { JARAK_ISI, sxJangkar, sxSubLad } from './gaya';

// Lima penanda: tiap kartu memuat kode dan nama penanda, kapan muncul, dan apa
// yang dilihat guru. Kartu keenam (Data belum cukup) bergaris putus: murid di
// sana belum bisa dinilai, bukan aman. Di bawahnya catatan "bukan diagnosis".
// Aturan ditulis tanpa angka ambang (diatur server). Sasaran jangkar #penanda.
const sxJudulKartu = { m: 0, color: colors.ink, fontSize: { xs: '16px', md: '18px' }, fontWeight: 600, lineHeight: 1.3 };
const sxIsi = { m: 0, fontSize: '13px', lineHeight: 1.65, color: colors.muted };

function Baris({ label, teks }) {
  return (
    <Box component="p" sx={sxIsi}>
      <Box component="b" sx={{ color: peragaLad.inkSedang }}>
        {label}
      </Box>{' '}
      {renderTeks(teks)}
    </Box>
  );
}

Baris.propTypes = { label: PropTypes.string.isRequired, teks: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired };

export default function LimaPenanda() {
  const BelumCukup = D.belumCukup;
  const IkonCatatan = D.catatan.ikon;
  return (
    <Seksi varian="terang" id={D.id} sx={sxJangkar} aria-labelledby="judul-penanda">
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-penanda" sx={sxSubLad} />
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
          gap: '20px',
          mt: JARAK_ISI,
        }}
      >
        {D.kartu.map((k) => (
          <Box
            key={k.kode}
            component="li"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              p: '26px 24px',
              borderRadius: radius.kartuSedang,
              background: colors.white,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.kartu,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TandaPenanda kode={k.kode} nada={k.nada} />
              <Box component="h3" sx={sxJudulKartu}>
                {k.judul}
              </Box>
            </Box>
            <Baris label={D.labelMuncul} teks={k.muncul} />
            <Baris label={D.labelLihat} teks={k.lihat} />
            <PenandaVerifikasi verifikasi={k.verifikasi} sx={{ alignSelf: 'flex-start' }} />
          </Box>
        ))}
        <Box
          component="li"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxSizing: 'border-box',
            p: '26px 24px',
            borderRadius: radius.kartuSedang,
            background: peragaLad.catatanBg,
            border: `1.5px dashed ${peragaLad.belumCukupGaris}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <KotakIkon ikon={BelumCukup.ikon} ukuran={40} ikonUkuran={20} sudut="12px" />
            <Box component="h3" sx={sxJudulKartu}>
              {BelumCukup.judul}
            </Box>
          </Box>
          <Box component="p" sx={sxIsi}>
            {renderTeks(BelumCukup.teks)}
          </Box>
          <PenandaVerifikasi verifikasi={BelumCukup.verifikasi} sx={{ alignSelf: 'flex-start' }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: '28px' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            p: '12px 16px',
            borderRadius: radius.tombol,
            background: peragaLad.catatanBg,
            border: `1px solid ${colors.border}`,
            fontSize: '13px',
            color: colors.body,
          }}
        >
          <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', flex: 'none', color: colors.accent }}>
            <IkonCatatan size={18} stroke={2} />
          </Box>
          <span>{renderTeks(D.catatan.teks)}</span>
        </Box>
      </Box>
    </Seksi>
  );
}
