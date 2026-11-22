import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconCheck, IconUsers } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import Teks from '../../components/Teks';
import { PENDAMPINGAN as D } from '../../data/beranda';
import { colors, gradients, huruf, peraga, radius } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { JARAK, PAD_SEKSI, sxJudulBeranda } from './gaya';

// Bagian Pendampingan (id "pendampingan"): banner gradasi dan empat langkah
// berurutan (<ol>). Langkah pertama (Demo) disorot: kartu gradasi dengan
// garis kuning ke ungu. Nomor dipakai karena isinya memang berurutan.
function Langkah({ nomor, langkah, pertama }) {
  return (
    <Box component="li">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Box component="span" sx={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>
          {String(nomor).padStart(2, '0')}
        </Box>
        <Box
          aria-hidden="true"
          sx={{ flex: 1, height: '2px', background: pertama ? peraga.gradasi.garisLangkahPertama : colors.accent }}
        />
      </Box>
      <Box
        sx={
          pertama
            ? { mt: '16px', background: gradients.brand, color: colors.white, borderRadius: radius.kartuLangkah, p: '16px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }
            : { mt: '16px', background: colors.kartuTint, border: `1px solid ${colors.kartuTintGaris}`, borderRadius: radius.kartuLangkah, p: '16px 18px' }
        }
      >
        {pertama && (
          <Box
            component="span"
            aria-hidden="true"
            sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: radius.ikonKecil, background: colors.yellow, color: colors.yellowInk, flex: 'none' }}
          >
            <IconCheck size={14} stroke={3} />
          </Box>
        )}
        <Box>
          <Box component="h3" sx={{ m: 0, fontSize: '15px', fontWeight: 600, color: pertama ? colors.white : colors.ink }}>
            {langkah.judul}
          </Box>
          <Box component="p" sx={{ m: '2px 0 0', fontSize: '12px', color: pertama ? colors.white : colors.muted }}>
            {langkah.deskripsi}
          </Box>
          <PenandaVerifikasi verifikasi={langkah.verifikasi} sx={{ mt: '6px' }} />
        </Box>
      </Box>
    </Box>
  );
}

Langkah.propTypes = {
  nomor: PropTypes.number.isRequired,
  langkah: PropTypes.shape({
    judul: PropTypes.string,
    deskripsi: PropTypes.string,
    verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
  pertama: PropTypes.bool,
};

export default function PendampinganBeranda() {
  return (
    <Seksi varian="terang" id={D.id} padAtas={PAD_SEKSI} padBawah={PAD_SEKSI} aria-labelledby="judul-pendampingan">
      <JudulSeksi
        eyebrow={D.eyebrow}
        judul={D.judul}
        sub={<Teks web={D.sub.web} seluler={D.sub.mobile} />}
        id="judul-pendampingan"
        maxJudul={700}
        maxSub={520}
        sx={sxJudulBeranda}
      />
      <Box
        sx={{
          mt: JARAK.pendampingan,
          background: gradients.brand,
          borderRadius: radius.kartuSedang,
          p: { xs: '18px 20px', md: '22px 28px' },
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          color: colors.white,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: radius.ikon, background: colors.tabGelapJumlah, flex: 'none' }}
        >
          <IconUsers size={24} stroke={2} />
        </Box>
        <Box>
          <Box component="h3" sx={{ m: 0, fontSize: { xs: '17px', md: '20px' }, fontWeight: 600, color: colors.white }}>
            {D.banner.judul}
          </Box>
          <Box component="p" sx={{ m: '2px 0 0', ...huruf.isi, lineHeight: 1.5, color: colors.white }}>
            <Teks web={D.banner.deskripsi.web} seluler={D.banner.deskripsi.mobile} />
          </Box>
        </Box>
      </Box>
      <Box
        component="ol"
        aria-label="Tahap pendampingan"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
          gap: '20px',
          mt: '36px',
        }}
      >
        {D.langkah.map((l, i) => (
          <Langkah key={l.judul} nomor={i + 1} langkah={l} pertama={i === 0} />
        ))}
      </Box>
    </Seksi>
  );
}
