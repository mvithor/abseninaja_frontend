import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import TombolLanding from '../../components/TombolLanding';
import { renderTeks } from '../../components/renderTeks';
import { INTRO as D } from '../../data/kalkulator';
import { colors, gradients, radius } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Keadaan awal: pengantar, tiga butir (daftar berurutan; nomor tampil sebagai
// kotak gradasi, bukan bagian nama daftar), dan tombol mulai. Paragraf menjadi
// sasaran fokus saat kembali ke keadaan ini (tabIndex -1).
const LayarIntro = ({ onMulai, fokusRef }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
    <Box component="p" ref={fokusRef} tabIndex={-1} sx={{ m: 0, fontSize: '15px', lineHeight: 1.7, color: colors.muted }}>
      {renderTeks(D.paragraf)}
    </Box>
    <Box component="ol" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {D.butir.map((b, i) => (
        <Box
          key={b.teks}
          component="li"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxSizing: 'border-box',
            p: '12px 16px',
            borderRadius: radius.kartuKecil,
            background: colors.kartuLembut,
            fontSize: '14px',
            color: colors.ink,
          }}
        >
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              flex: 'none',
              borderRadius: radius.nomorKecil,
              background: gradients.brand,
              color: colors.white,
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </Box>
          <Box component="span" sx={{ minWidth: 0 }}>
            {b.teks}
            <PenandaVerifikasi verifikasi={b.verifikasi} sx={{ ml: '8px' }} />
          </Box>
        </Box>
      ))}
    </Box>
    <PenandaVerifikasi verifikasi={D.verifikasi} sx={{ alignSelf: 'flex-start' }} />
    <TombolLanding ukuran="xl" penuh onClick={onMulai} sx={{ mt: '8px' }}>
      {D.aksi}
    </TombolLanding>
  </Box>
);

LayarIntro.propTypes = {
  onMulai: PropTypes.func.isRequired,
  fokusRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default LayarIntro;
