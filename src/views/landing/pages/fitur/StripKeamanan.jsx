import { Box } from '@mui/material';
import { IconShieldCheck } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import KotakIkon from '../../components/KotakIkon';
import Tag from '../../components/Tag';
import TombolLanding from '../../components/TombolLanding';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { propsAksi } from '../../data/aksi';
import { KEAMANAN as D } from '../../data/fitur';
import { colors, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Strip keamanan: kartu putih satu baris (ikon, judul dan tag, tombol). Tombol
// menuju Keamanan Data, nonaktif sampai halamannya tersedia (data/nav.js).
export default function StripKeamanan() {
  return (
    <Seksi varian="terang" padAtas="0px" padBawah="32px" aria-labelledby="judul-keamanan">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '22px',
          boxSizing: 'border-box',
          p: { xs: '26px 20px', md: '26px 32px' },
          borderRadius: radius.kartuBesar,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.kartu,
        }}
      >
        <KotakIkon ikon={IconShieldCheck} />
        <Box sx={{ flex: '1 1 280px', minWidth: 0 }}>
          <Box
            component="h2"
            id="judul-keamanan"
            sx={{ m: 0, fontSize: { xs: '16px', md: '18px' }, fontWeight: 600, color: colors.ink }}
          >
            {D.judul}
          </Box>
          <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', mt: '10px' }}>
            {D.tag.map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
            <li>
              <PenandaVerifikasi verifikasi={D.verifikasi} />
            </li>
          </Box>
        </Box>
        <TombolLanding varian="garis" {...propsAksi(D.aksi.rute)}>
          {D.aksi.label}
        </TombolLanding>
      </Box>
    </Seksi>
  );
}
