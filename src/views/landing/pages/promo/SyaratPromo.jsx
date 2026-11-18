import { Box } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import { SYARAT as D } from '../../data/promo';
import { colors, radius } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Syarat dan ketentuan: bagian gelap, empat butir dua kolom (satu kolom di
// bawah md), tiap butir berpenanda centang kuning.
export default function SyaratPromo() {
  return (
    <PerbandinganGelap id={D.id} eyebrow={D.eyebrow} judul={D.judul} jarak="44px" maxJudul={720}>
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '20px',
        }}
      >
        {D.butir.map((b) => (
          <Box
            key={b}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxSizing: 'border-box',
              p: '22px 26px',
              textAlign: 'left',
              borderRadius: radius.kartuSedang,
              background: colors.glass,
              border: `1px solid ${colors.garisKaca}`,
              color: colors.white,
              fontSize: '15px',
            }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                flex: 'none',
                borderRadius: '50%',
                background: colors.yellow,
                color: colors.yellowInk,
              }}
            >
              <IconCheck size={14} stroke={3} />
            </Box>
            {b}
          </Box>
        ))}
      </Box>
    </PerbandinganGelap>
  );
}
