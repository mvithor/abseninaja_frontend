import { Box } from '@mui/material';
import { IconCheck, IconShieldCheck } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import KotakIkon from '../../components/KotakIkon';
import TombolLanding from '../../components/TombolLanding';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { KEAMANAN as D } from '../../data/fitur';
import { colors, huruf, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Blok keamanan dan hak akses: hanya klaim yang terbukti di kode (empat butir).
// Satu DOM, tiga area kisi: info (ikon, judul, subjudul), daftar, dan tombol ke
// Keamanan Data (nonaktif sampai halamannya tersedia, data/nav.js).
//  md ke atas : info dan tombol bertumpuk di kolom kiri (merapat ke tengah), daftar
//               di kolom kanan
//  di bawah md: info, daftar, lalu tombol selebar kartu
export default function BlokKeamanan() {
  return (
    <Seksi varian="terang" padAtas="0px" padBawah={{ xs: '24px', md: '32px' }} aria-labelledby="judul-keamanan">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1.1fr)' },
          gridTemplateAreas: { xs: '"info" "daftar" "aksi"', md: '"info daftar" "aksi daftar"' },
          columnGap: '40px',
          rowGap: '14px',
          boxSizing: 'border-box',
          p: { xs: '24px 20px', md: '32px 36px' },
          borderRadius: radius.kartuBesar,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.kartu,
        }}
      >
        <Box sx={{ gridArea: 'info', alignSelf: { md: 'end' }, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
          <KotakIkon ikon={IconShieldCheck} />
          <Box
            component="h2"
            id="judul-keamanan"
            sx={{ m: 0, color: colors.ink, textWrap: 'balance', ...huruf.judulBagian, fontSize: { xs: '22px', md: '26px' } }}
          >
            {renderTeks(D.judul)}
          </Box>
          <Box component="p" sx={{ m: 0, color: colors.muted, textWrap: 'pretty', ...huruf.subjudul, fontSize: '15px' }}>
            {renderTeks(D.sub)}
          </Box>
        </Box>
        <Box
          component="ul"
          role="list"
          sx={{
            ...resetDaftar,
            gridArea: 'daftar',
            alignSelf: { md: 'center' },
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr)',
            gap: { xs: '10px', md: '12px' },
          }}
        >
          {D.butir.map((b) => (
            <Box
              key={b}
              component="li"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                p: { xs: '12px 14px', md: '14px 16px' },
                borderRadius: radius.kartuKecil,
                background: colors.field,
                border: `1px solid ${colors.borderSoft}`,
                fontSize: '14px',
                lineHeight: 1.65,
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
                  width: 28,
                  height: 28,
                  flex: 'none',
                  borderRadius: radius.menuItem,
                  background: colors.tint,
                  color: colors.accent,
                }}
              >
                <IconCheck size={16} stroke={2.4} />
              </Box>
              <Box component="span" sx={{ pt: '2px' }}>
                {b}
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ gridArea: 'aksi', alignSelf: { md: 'start' }, mt: { md: '6px' }, display: 'flex' }}>
          <TombolLanding varian="garis" {...propsAksi(D.aksi.rute)} sx={{ width: { xs: '100%', md: 'auto' } }}>
            {D.aksi.label}
          </TombolLanding>
        </Box>
      </Box>
    </Seksi>
  );
}
