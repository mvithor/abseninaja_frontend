import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { IconCheck, IconMessage, IconScan } from '@tabler/icons-react';
import { colors, gerak, gradients, peraga, radius } from '../theme/tokens';

// Peraga dasbor kehadiran untuk hero Beranda (data dummy, dekoratif: aria-hidden).
// Panggung 500 x 500 px berisi kartu dasbor dan dua kartu melayang, persis
// seperti desain. Di bawah lg panggung diperkecil dengan transform: scale
// bertahap menurut lebar layar (ESKALA), supaya tidak ada gulir horizontal
// sampai 360 px. Dari lg (kolom hero 545 px) panggung selebar kolom, skala 1.
//
// Warna, gradasi, bayangan, dan radius khusus peraga ada di theme/tokens.js (`peraga`).

// [lebar layar minimum (px), skala]. Lebar konten = layar - 40 di bawah md;
// dari md kolom hero = (layar - 136) * 0,512. Skala dipilih supaya 500 * skala
// tidak melebihi lebar tersedia di awal tiap rentang. Kolom hero di 1100 px =
// 494 px dan baru mencapai 500 px di 1113 px, jadi skala 1 dimulai dari 1120 px
// (kolom 504 px); di antaranya 0,98 (490 px).
const ESKALA = [
  [0, 0.56],
  [360, 0.64],
  [390, 0.7],
  [430, 0.78],
  [480, 0.88],
  [560, 1],
  [900, 0.78],
  [1000, 0.88],
  [1100, 0.98],
  [1120, 1],
];
const aturanEskala = Object.fromEntries(ESKALA.map(([bp, s]) => [`@media (min-width:${bp}px)`, { '--skala': s }]));
aturanEskala['@media (min-width:1200px)'] = { '--skala': 1, '--lebar': '545px' };

const tumbuh = keyframes`
  from { transform: scaleY(0.2); }
  to { transform: scaleY(1); }
`;

const sxKartu = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
};

function Batang({ tinggi, jenis }) {
  const latar = {
    biasa: peraga.gradasi.batang,
    sorot: peraga.gradasi.batangSorot,
    pudar: colors.outline,
  }[jenis];
  return (
    <Box
      sx={{
        flex: 1,
        height: `${tinggi}%`,
        background: latar,
        borderRadius: radius.batang,
        transformOrigin: 'bottom center',
        animation: `${tumbuh} 900ms ${gerak.ease} both`,
      }}
    />
  );
}
Batang.propTypes = { tinggi: PropTypes.number.isRequired, jenis: PropTypes.oneOf(['biasa', 'sorot', 'pudar']).isRequired };

export default function DasborMock({ data }) {
  const { grafik } = data;
  return (
    <Box
      aria-hidden="true"
      sx={{
        '--skala': 1,
        '--lebar': '500px',
        ...aturanEskala,
        position: 'relative',
        flex: 'none',
        width: 'calc(var(--skala) * var(--lebar))',
        height: 'calc(var(--skala) * 500px)',
        mx: { xs: 'auto', md: 0 },
        ml: { md: 'auto' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'var(--lebar)',
          height: 500,
          transform: 'scale(var(--skala))',
          transformOrigin: 'top left',
        }}
      >
        <Box sx={{ position: 'absolute', right: -60, top: -20, width: 380, height: 380, borderRadius: '50%', background: peraga.blobUngu, filter: 'blur(130px)' }} />
        <Box sx={{ position: 'absolute', right: 120, bottom: -40, width: 300, height: 300, borderRadius: '50%', background: peraga.blobBiru, filter: 'blur(140px)' }} />

        {/* Kartu dasbor */}
        <Box
          sx={{
            ...sxKartu,
            position: 'absolute',
            right: 0,
            top: 20,
            width: 470,
            boxSizing: 'border-box',
            p: '22px',
            borderRadius: radius.kartuBesar,
            boxShadow: peraga.bayangan.dasbor,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box component="span" sx={{ fontSize: '14px', fontWeight: 600, color: colors.ink }}>
              {data.judul}
            </Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: 24,
                px: '10px',
                borderRadius: radius.tag,
                background: peraga.suksesBg,
                color: peraga.suksesInk,
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', background: colors.success }} />
              {data.status}
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '10px', mt: '16px' }}>
            {data.statistik.map((s) => (
              <Box key={s.label} sx={{ background: colors.tint, border: `1px solid ${colors.kartuTintGaris}`, borderRadius: radius.kartuStat, p: '12px' }}>
                <Box sx={{ fontSize: '24px', fontWeight: 700, color: colors.ink, lineHeight: 1.1 }}>{s.angka}</Box>
                <Box sx={{ fontSize: '11px', color: colors.muted, mt: '4px' }}>{s.label}</Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ border: `1px solid ${colors.borderSoft}`, borderRadius: radius.kartuKecil, p: '14px 14px 10px', mt: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: colors.muted }}>
              <span>{grafik.judul}</span>
              <Box component="span" sx={{ color: peraga.suksesInk, fontWeight: 600 }}>
                {grafik.tren}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: 110, mt: '10px' }}>
              {grafik.batang.map((b) => (
                <Batang key={b.hari} tinggi={b.tinggi} jenis={b.jenis} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: '10px', mt: '6px', fontSize: '10px', color: colors.muted, textAlign: 'center' }}>
              {grafik.batang.map((b) => (
                <Box key={b.hari} component="span" sx={{ flex: 1, ...(b.jenis === 'sorot' ? { color: peraga.hariAkhir, fontWeight: 600 } : null) }}>
                  {b.hari}
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              mt: '12px',
              background: gradients.brand,
              color: colors.white,
              borderRadius: radius.kartuStat,
              p: '11px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconCheck size={16} stroke={2.2} />
              {data.tersambung.teks}
            </Box>
            <Box component="span" sx={{ color: colors.yellow, fontWeight: 600 }}>
              {data.tersambung.status}
            </Box>
          </Box>
        </Box>

        {/* Kartu melayang: scan QR */}
        <Box
          sx={{
            ...sxKartu,
            position: 'absolute',
            left: 0,
            top: 0,
            p: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: radius.kartuLangkah,
            boxShadow: peraga.bayangan.kartuScan,
          }}
        >
          <Box
            component="span"
            sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: radius.tombol, background: colors.yellow, color: colors.yellowInk }}
          >
            <IconScan size={18} stroke={2.2} />
          </Box>
          <Box>
            <Box sx={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{data.kartuScan.judul}</Box>
            <Box sx={{ fontSize: '11px', color: colors.muted }}>{data.kartuScan.sub}</Box>
          </Box>
        </Box>

        {/* Kartu melayang: kabar wali murid */}
        <Box
          sx={{
            ...sxKartu,
            position: 'absolute',
            left: 24,
            bottom: 8,
            width: 290,
            boxSizing: 'border-box',
            p: '14px 16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            borderRadius: radius.kartu,
            boxShadow: peraga.bayangan.kartuKabar,
          }}
        >
          <Box
            component="span"
            sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', background: colors.tint, color: colors.accent, flex: 'none' }}
          >
            <IconMessage size={18} stroke={2} />
          </Box>
          <Box>
            <Box sx={{ fontSize: '11px', fontWeight: 600, color: colors.muted }}>{data.kartuKabar.judul}</Box>
            <Box sx={{ fontSize: '13px', lineHeight: 1.5, color: colors.ink, mt: '2px' }}>{data.kartuKabar.teks}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

DasborMock.propTypes = {
  data: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    statistik: PropTypes.array.isRequired,
    grafik: PropTypes.shape({
      judul: PropTypes.string,
      tren: PropTypes.string,
      batang: PropTypes.array,
    }).isRequired,
    tersambung: PropTypes.object.isRequired,
    kartuScan: PropTypes.object.isRequired,
    kartuKabar: PropTypes.object.isRequired,
  }).isRequired,
};
