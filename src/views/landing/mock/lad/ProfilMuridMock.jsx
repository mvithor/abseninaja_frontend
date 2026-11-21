import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TandaPenanda from '../../components/TandaPenanda';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { colors, peragaLad, radius } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Peraga profil murid (bagian "Dari bukti ke langkah"): kode penanda dan
// capaian per TP. Data contoh: DUMMY wajib diganti sebelum main
// (data/analitikMock.js). Dekoratif, aria-hidden. Status tiap TP ("Tuntas" atau
// "Belum tuntas") tertulis di setiap kotak; titik warna hanya penegas.
const NADA_TP = {
  tuntas: { latar: colors.white, garis: colors.border, titik: peragaLad.segmenTuntas },
  belum: { latar: peragaLad.perhatianBg, garis: peragaLad.perhatianGaris, titik: peragaLad.segmenBelum },
};

export default function ProfilMuridMock({ data }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        boxSizing: 'border-box',
        p: '20px',
        borderRadius: radius.kartuSedang,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: peragaLad.bayangan.kartuProfil,
      }}
    >
      <Box sx={{ fontSize: '11px', color: colors.muted }}>{data.konteks}</Box>
      <Box sx={{ mt: '2px', fontSize: { xs: '16px', md: '17px' }, fontWeight: 700, color: colors.ink }}>{data.nama}</Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', mt: '8px' }}>
        {data.penanda.map((p) => (
          <TandaPenanda key={p.kode}>
            {p.kode} {p.nama}
          </TandaPenanda>
        ))}
      </Box>
      <Box sx={{ mt: '14px', fontSize: '12px', fontWeight: 700, color: colors.ink }}>{data.judulTp}</Box>
      <Box
        component="ul"
        role="list"
        sx={{ ...resetDaftar, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '8px', mt: '8px' }}
      >
        {data.tp.map((t) => (
          <Box
            key={t.tp}
            component="li"
            sx={{
              p: '8px 10px',
              borderRadius: '10px',
              background: NADA_TP[t.nada].latar,
              border: `1px solid ${NADA_TP[t.nada].garis}`,
              fontSize: '12px',
            }}
          >
            <Box
              component="span"
              sx={{ display: 'inline-block', width: 8, height: 8, mr: '6px', borderRadius: '50%', background: NADA_TP[t.nada].titik }}
            />
            <b>{t.tp}</b>
            <Box component="b" sx={{ ml: '6px', color: colors.ink }}>
              {t.nilai}
            </Box>
            <Box component="span" sx={{ ml: '6px', color: colors.body }}>
              {t.status}
            </Box>
            {t.bukti && (
              <Box>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    mt: '6px',
                    px: '6px',
                    py: '1px',
                    borderRadius: '5px',
                    border: `1px solid ${peragaLad.belumCukupGaris}`,
                    background: colors.white,
                    color: peragaLad.inkSedang,
                    fontSize: '10.5px',
                  }}
                >
                  {t.bukti}
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <PenandaVerifikasi verifikasi={data.verifikasi} sx={{ mt: '10px' }} />
    </Box>
  );
}

ProfilMuridMock.propTypes = {
  data: PropTypes.shape({
    konteks: PropTypes.string.isRequired,
    nama: PropTypes.string.isRequired,
    penanda: PropTypes.array.isRequired,
    judulTp: PropTypes.string.isRequired,
    tp: PropTypes.array.isRequired,
    verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
};
