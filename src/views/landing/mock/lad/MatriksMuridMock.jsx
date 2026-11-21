import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, peragaLad, radius } from '../../theme/tokens';

// Peraga matriks murid per TP (bagian "Kelas terbaca"). Data contoh: DUMMY wajib
// diganti sebelum main (data/analitikMock.js). Dekoratif, aria-hidden. Tiap sel
// menulis nilainya; warna sel dan titik hanya penegas (tuntas, belum tuntas,
// di atas batas pengayaan).
const NADA_SEL = {
  tuntas: { latar: colors.white, titik: peragaLad.segmenTuntas },
  belum: { latar: peragaLad.perhatianBg, titik: peragaLad.segmenBelum },
  tinggi: { latar: peragaLad.pengayaanBg, titik: peragaLad.segmenPengayaan },
};

const sxSel = { px: { xs: '4px', md: '6px' }, py: '7px', borderBottom: `1px solid ${colors.borderSoft}` };

export default function MatriksMuridMock({ data }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        boxSizing: 'border-box',
        p: '16px 18px',
        overflow: 'hidden',
        borderRadius: radius.kartu,
        background: colors.white,
        border: `1px solid ${colors.border}`,
      }}
    >
      <Box sx={{ mb: '8px', fontSize: '13px', fontWeight: 700, color: colors.ink }}>{data.judul}</Box>
      <Box
        component="table"
        sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: peragaLad.inkSedang }}
      >
        <thead>
          <Box component="tr" sx={{ color: colors.muted, textAlign: 'center' }}>
            <Box component="th" sx={{ px: { xs: '4px', md: '8px' }, py: '6px', textAlign: 'left', fontWeight: 400 }}>
              {data.kolom.murid}
            </Box>
            <Box component="th" sx={{ px: { xs: '4px', md: '6px' }, py: '6px', textAlign: 'left', fontWeight: 400 }}>
              {data.kolom.penanda}
            </Box>
            {data.kolom.tp.map((tp) => (
              <Box key={tp} component="th" sx={{ py: '6px', fontWeight: 400 }}>
                {tp}
              </Box>
            ))}
          </Box>
        </thead>
        <tbody>
          {data.baris.map((b) => (
            <tr key={b.nama}>
              <Box component="td" sx={{ ...sxSel, px: { xs: '4px', md: '8px' }, fontWeight: 600, color: colors.ink }}>
                {b.nama}
              </Box>
              <Box component="td" sx={{ ...sxSel, fontWeight: 700, color: peragaLad.perhatianInk, whiteSpace: 'nowrap' }}>
                {b.penanda}
              </Box>
              {b.sel.map(([nilai, nada], i) => (
                <Box key={data.kolom.tp[i]} component="td" sx={{ ...sxSel, textAlign: 'center', background: NADA_SEL[nada].latar }}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      mr: '4px',
                      borderRadius: '50%',
                      background: NADA_SEL[nada].titik,
                    }}
                  />
                  {nilai}
                </Box>
              ))}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

MatriksMuridMock.propTypes = {
  data: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    kolom: PropTypes.shape({
      murid: PropTypes.string,
      penanda: PropTypes.string,
      tp: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    baris: PropTypes.array.isRequired,
  }).isRequired,
};
