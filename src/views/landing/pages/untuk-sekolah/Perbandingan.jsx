import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconCheck, IconMinus } from '@tabler/icons-react';
import ChipStatus from '../../components/ChipStatus';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import { PERBANDINGAN as D } from '../../data/untukSekolah';
import { colors, radius } from '../../theme/tokens';
import { hanyaPembaca } from '../../theme/sx';

// Perbandingan dua jalur: tabel sungguhan (caption, th scope) di kartu kaca.
// Status selalu berupa teks (Tersedia, Tidak ada, Di Prakersa, Segera); ikon hanya
// pendamping. "Segera" dirender sebagai chip Segera (ChipStatus, F8). Di seluler lajur dipersempit (huruf dan jarak lebih kecil) dan
// teks boleh turun baris supaya terbaca di 360 px tanpa gulir mendatar.
const LEBAR_KOLOM = ['37.5%', '31.25%', '31.25%'];

const sxSel = {
  p: { xs: '12px 8px 12px 0', md: '16px 16px 16px 0' },
  textAlign: 'left',
  verticalAlign: 'middle',
  borderTop: `1px solid ${colors.glassGaris}`,
};

function Status({ nilai }) {
  if (nilai === 'segera') return <ChipStatus status="segera" />;
  const tidak = nilai === 'tidak';
  const Ikon = tidak ? IconMinus : IconCheck;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: { xs: '6px', md: '8px' },
        fontSize: { xs: '13px', md: '14px' },
        lineHeight: 1.3,
        color: tidak ? colors.onDark : colors.white,
      }}
    >
      <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', flex: 'none', color: tidak ? colors.penandaTidak : colors.yellow }}>
        <Ikon size={16} stroke={tidak ? 2.4 : 3} />
      </Box>
      <span>{D.status[nilai]}</span>
    </Box>
  );
}

Status.propTypes = { nilai: PropTypes.oneOf(['ada', 'tidak', 'prakersa', 'segera']).isRequired };

export default function Perbandingan() {
  return (
    <PerbandinganGelap
      id={D.id}
      eyebrow={D.eyebrow}
      judul={D.judul}
      maxJudul={700}
      padAtas={{ xs: '36px', md: '72px' }}
      padBawah={{ xs: '48px', md: '96px' }}
      jarak="48px"
      sx={{ mt: '72px' }}
    >
      <Box
        sx={{
          boxSizing: 'border-box',
          p: { xs: '20px 20px 22px', md: '20px 36px 28px' },
          borderRadius: radius.kartuXL,
          background: colors.glass,
          border: `1px solid ${colors.garisKaca}`,
        }}
      >
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <Box component="caption" sx={hanyaPembaca}>
            {D.caption}
          </Box>
          <colgroup>
            {LEBAR_KOLOM.map((l, i) => (
              // Indeks dipakai karena dua kolom bisa berlebar sama (31.25%).
              <Box key={`${i}-${l}`} component="col" sx={{ width: l }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {[D.kolom.modul, D.kolom.umum, D.kolom.smk].map((k) => (
                <Box
                  key={k}
                  component="th"
                  scope="col"
                  sx={{
                    p: { xs: '5px 8px 8px 0', md: '10px 16px 16px 0' },
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: colors.onDark,
                  }}
                >
                  {k}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {D.baris.map((b) => (
              <tr key={b.modul}>
                <Box component="th" scope="row" sx={{ ...sxSel, fontSize: { xs: '14px', md: '15px' }, fontWeight: 500, lineHeight: 1.3, color: colors.white }}>
                  {b.modul}
                  <PenandaVerifikasi verifikasi={b.verifikasi} sx={{ display: 'flex', width: 'fit-content', mt: '6px' }} />
                </Box>
                <Box component="td" sx={sxSel}>
                  <Status nilai={b.umum} />
                </Box>
                <Box component="td" sx={sxSel}>
                  <Status nilai={b.smk} />
                </Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </PerbandinganGelap>
  );
}
