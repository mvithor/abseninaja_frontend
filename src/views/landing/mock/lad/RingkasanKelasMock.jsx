import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TandaPenanda from '../../components/TandaPenanda';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { colors, peragaLad, radius } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Peraga hero Analitik Pembelajaran (LAD): kartu ringkasan kelas (empat kartu,
// sebaran capaian per TP, murid perlu perhatian) dan kartu kecil "Saran tindak
// lanjut" yang melayang di kiri bawah. Data contoh: DUMMY wajib diganti sebelum
// main (lihat data/analitikMock.js). Dekoratif, aria-hidden; semua informasi
// juga berupa teks (label, angka, kode penanda), warna hanya penegas.
// Tidak diskalakan: tata letaknya mengalir, jadi di seluler cukup menyempit
// (kartu melayang 250 px, angka kartu 20 px).
const NADA_KARTU = {
  perhatian: { background: peragaLad.perhatianBg, border: `1px solid ${peragaLad.garisKartu}` },
  pengayaan: { background: peragaLad.pengayaanBg, border: `1px solid ${peragaLad.garisKartu}` },
  belumCukup: { background: peragaLad.belumCukupBg, border: `1px dashed ${peragaLad.belumCukupGaris}` },
  lengkap: { background: peragaLad.lengkapBg, border: `1px solid ${peragaLad.garisKartu}` },
};

const HATCH = `repeating-linear-gradient(135deg,${peragaLad.garisMiring} 0 2px,transparent 2px 5px)`;
const LATAR_SEGMEN = {
  belum: `${HATCH},${peragaLad.segmenBelum}`,
  tuntas: peragaLad.segmenTuntas,
  pengayaan: peragaLad.segmenPengayaan,
};

function Segmen({ jumlah, jenis }) {
  if (!jumlah) return null;
  return (
    <Box
      sx={{
        flex: `${jumlah} 1 0`,
        minWidth: 20,
        height: 22,
        borderRadius: radius.tag,
        background: LATAR_SEGMEN[jenis],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="span"
        sx={{
          px: '4px',
          borderRadius: '4px',
          background: colors.white,
          color: colors.ink,
          fontSize: '10px',
          fontWeight: 700,
          lineHeight: '16px',
        }}
      >
        {jumlah}
      </Box>
    </Box>
  );
}

Segmen.propTypes = { jumlah: PropTypes.number, jenis: PropTypes.oneOf(['belum', 'tuntas', 'pengayaan']).isRequired };

const sxJudulKecil = { fontSize: '12px', fontWeight: 700, color: colors.ink, mt: '14px' };

export default function RingkasanKelasMock({ data }) {
  return (
    <Box aria-hidden="true" sx={{ position: 'relative' }}>
      <Box
        sx={{
          position: 'relative',
          boxSizing: 'border-box',
          ml: '20px',
          p: '20px 20px 150px',
          borderRadius: radius.kartuSedang,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: peragaLad.bayangan.ringkasan,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontSize: '15px', fontWeight: 700, color: colors.ink }}>{data.judul}</Box>
            <Box sx={{ mt: '2px', fontSize: '11px', color: colors.muted }}>{data.konteks}</Box>
          </Box>
          <Box
            component="span"
            sx={{
              flex: 'none',
              px: '8px',
              py: '4px',
              borderRadius: radius.tag,
              background: colors.tint,
              color: colors.accent,
              fontSize: '11px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {data.aturan}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '10px', mt: '14px' }}>
          {data.kartu.map((k) => (
            <Box key={k.label} sx={{ ...NADA_KARTU[k.nada], p: '12px 14px', borderRadius: radius.kartuStat }}>
              <Box sx={{ fontSize: '11px', fontWeight: 600, color: colors.body }}>{k.label}</Box>
              <Box sx={{ mt: '4px', color: colors.ink }}>
                <Box
                  component="span"
                  sx={{ fontSize: { xs: '20px', md: '26px' }, fontWeight: 700, lineHeight: 1.1 }}
                >
                  {k.nilai}
                </Box>
                {k.satuan && (
                  <Box component="span" sx={{ ml: '4px', fontSize: '12px' }}>
                    {k.satuan}
                  </Box>
                )}
              </Box>
              <Box sx={{ mt: '4px', fontSize: '10.5px', lineHeight: 1.45, color: colors.muted }}>{k.catatan}</Box>
            </Box>
          ))}
        </Box>

        <Box sx={sxJudulKecil}>{data.sebaranJudul}</Box>
        <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', gap: '7px', mt: '8px' }}>
          {data.sebaran.map((s) => (
            <Box
              key={s.tp}
              component="li"
              sx={{
                display: 'grid',
                gridTemplateColumns: '30px minmax(0,1fr) 78px',
                gap: '8px',
                alignItems: 'center',
                fontSize: '11px',
                color: colors.body,
              }}
            >
              <Box component="span" sx={{ fontWeight: 600, color: colors.ink }}>
                {s.tp}
              </Box>
              <Box sx={{ display: 'flex', gap: '3px' }}>
                <Segmen jumlah={s.belum} jenis="belum" />
                <Segmen jumlah={s.tuntas} jenis="tuntas" />
                <Segmen jumlah={s.pengayaan} jenis="pengayaan" />
              </Box>
              <Box component="span" sx={{ textAlign: 'right' }}>
                {s.ringkas}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={sxJudulKecil}>{data.perhatianJudul}</Box>
        <Box component="ul" role="list" sx={{ ...resetDaftar, mt: '4px' }}>
          {data.perhatian.map((m) => (
            <Box
              key={m.nama}
              component="li"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                py: '8px',
                borderTop: `1px solid ${colors.borderSoft}`,
                fontSize: '12px',
              }}
            >
              <Box component="span" sx={{ flex: 'none', width: { xs: 62, md: 70 }, fontWeight: 600, color: colors.ink }}>
                {m.nama}
              </Box>
              <Box sx={{ display: 'flex', gap: '4px', flex: 1, minWidth: 0 }}>
                {m.penanda.map((kode) => (
                  <TandaPenanda key={kode} kode={kode} />
                ))}
              </Box>
              <Box component="span" sx={{ minWidth: 0, textAlign: 'right', color: colors.muted }}>
                {m.bukti}
              </Box>
            </Box>
          ))}
        </Box>
        <PenandaVerifikasi verifikasi={data.verifikasi} sx={{ mt: '10px' }} />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          bottom: '14px',
          width: { xs: 250, md: 300 },
          maxWidth: 'calc(100% - 8px)',
          boxSizing: 'border-box',
          p: '12px 14px',
          borderRadius: radius.kartuKecil,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: peragaLad.bayangan.saranMini,
        }}
      >
        <Box
          sx={{
            fontSize: '10.5px',
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {data.saranMini.label}
        </Box>
        <Box sx={{ mt: '4px', fontSize: '12px', lineHeight: 1.5, color: colors.ink }}>{data.saranMini.teks}</Box>
        <Box sx={{ mt: '6px', fontSize: '10.5px', color: colors.muted }}>{data.saranMini.status}</Box>
      </Box>
    </Box>
  );
}

RingkasanKelasMock.propTypes = {
  data: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    konteks: PropTypes.string.isRequired,
    aturan: PropTypes.string.isRequired,
    kartu: PropTypes.array.isRequired,
    sebaranJudul: PropTypes.string.isRequired,
    sebaran: PropTypes.array.isRequired,
    perhatianJudul: PropTypes.string.isRequired,
    perhatian: PropTypes.array.isRequired,
    saranMini: PropTypes.object.isRequired,
    verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
};
