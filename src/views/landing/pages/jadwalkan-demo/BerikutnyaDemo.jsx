import { Box } from '@mui/material';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { BERIKUTNYA as D } from '../../data/jadwalkanDemo';
import { colors, radius } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// "Apa yang terjadi berikutnya": bagian gelap, empat langkah berurutan (daftar
// berurutan) dalam dua kolom, satu kolom di bawah md. Nomor kuning 44 px.
export default function BerikutnyaDemo() {
  return (
    <PerbandinganGelap
      id={D.id}
      eyebrow={D.eyebrow}
      judul={D.judul}
      padAtas={{ xs: '44px', md: '88px' }}
      padBawah={{ xs: '48px', md: '96px' }}
      jarak="48px"
      maxJudul={700}
    >
      <Box
        component="ol"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '20px',
        }}
      >
        {D.langkah.map((l, i) => (
          <Box
            key={l.judul}
            component="li"
            sx={{
              display: 'flex',
              gap: '18px',
              alignItems: 'flex-start',
              boxSizing: 'border-box',
              p: '24px 26px',
              textAlign: 'left',
              borderRadius: radius.kartuSedang,
              background: colors.glass,
              border: `1px solid ${colors.garisKaca}`,
            }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                flex: 'none',
                borderRadius: '14px',
                background: colors.yellow,
                color: colors.yellowInk,
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box component="h3" sx={{ m: 0, fontSize: { xs: '16px', md: '17px' }, fontWeight: 600, color: colors.white }}>
                {l.judul}
              </Box>
              <Box component="p" sx={{ m: '4px 0 0', fontSize: '14px', lineHeight: 1.65, color: colors.onDark }}>
                {renderTeks(l.deskripsi)}
              </Box>
              <PenandaVerifikasi verifikasi={l.verifikasi} />
            </Box>
          </Box>
        ))}
      </Box>
    </PerbandinganGelap>
  );
}
