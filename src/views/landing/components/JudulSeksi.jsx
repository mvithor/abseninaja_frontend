import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Eyebrow from './Eyebrow';
import { renderJudul } from './renderJudul';
import { colors, huruf } from '../theme/tokens';

// Eyebrow + judul + subjudul. `tingkat` h1 dipakai satu kali per halaman (hero).
export default function JudulSeksi({
  eyebrow,
  judul,
  sub,
  gelap = false,
  rata = 'tengah',
  tingkat = 'h2',
  id,
  penanda,
  maxJudul = 720,
  maxSub = 540,
  sx,
}) {
  const tengah = rata === 'tengah';
  const hero = tingkat === 'h1';
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: tengah ? 'center' : 'flex-start',
        textAlign: tengah ? 'center' : 'left',
        gap: '18px',
        ...sx,
      }}
    >
      {eyebrow && (
        <Eyebrow gelap={gelap} component="p" sx={{ m: 0 }}>
          {eyebrow}
        </Eyebrow>
      )}
      <Box
        component={tingkat}
        id={id}
        sx={{
          m: 0,
          maxWidth: maxJudul,
          color: gelap ? colors.white : colors.ink,
          textWrap: 'balance',
          ...(hero ? huruf.judulUtama : huruf.judulBagian),
        }}
      >
        {renderJudul(judul, gelap)}
      </Box>
      {sub && (
        <Box
          component="p"
          sx={{
            m: 0,
            maxWidth: maxSub,
            color: gelap ? colors.onDark : colors.muted,
            textWrap: 'pretty',
            ...huruf.subjudul,
          }}
        >
          {sub}
        </Box>
      )}
      {penanda}
    </Box>
  );
}

JudulSeksi.propTypes = {
  eyebrow: PropTypes.node,
  judul: PropTypes.node.isRequired,
  sub: PropTypes.node,
  gelap: PropTypes.bool,
  rata: PropTypes.oneOf(['tengah', 'kiri']),
  tingkat: PropTypes.oneOf(['h1', 'h2', 'h3']),
  id: PropTypes.string,
  penanda: PropTypes.node,
  maxJudul: PropTypes.number,
  maxSub: PropTypes.number,
  sx: PropTypes.object,
};
