import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CETAK, warnaRingkasan } from './gayaRingkasan';
import useLebar from './useLebar';

// Lebar minimum (piksel) agar angka muat di dalam segmen: satu angka 12px tebal plus bantalan.
const lebarAngka = (n) => String(n).length * 8 + 10;

/**
 * Batang bersegmen 100%. Panjang segmen SELALU sebanding dengan jumlahnya. Angka ditulis di dalam segmen hanya
 * bila muat; segmen yang terlalu sempit tidak diberi angka (jumlahnya tetap ada di label baca, tooltip, dan
 * teks di sekitarnya), supaya angka tidak menumpuk pada segmen tetangga.
 *
 * Bila `onPilih` diberikan, tiap segmen berisi menjadi tombol (sasaran klik/ketuk) dan batang dibaca sebagai
 * kelompok; bila tidak, batang dibaca sebagai satu gambar dengan `aria-label` ringkas.
 */
export default function BatangSegmen({
  segmen, isian, tinggi = 30, label, onPilih, labelSegmen,
}) {
  const w = warnaRingkasan(useTheme());
  const [ref, lebar] = useLebar();
  const interaktif = typeof onPilih === 'function';
  const total = segmen.reduce((s, x) => s + x.n, 0);

  return (
    <Box
      ref={ref}
      role={interaktif ? 'group' : 'img'}
      aria-label={label}
      sx={{
        display: 'flex',
        height: tinggi,
        borderRadius: '4px',
        overflow: 'hidden',
        minWidth: 0,
        width: '100%',
        // Garis pembatas tipis di antara segmen, memakai warna kartu supaya pola tidak saling menempel.
        '& > *': { borderLeft: `1px solid ${w.kartu}` },
        '& > *:first-of-type': { borderLeft: 0 },
      }}
    >
      {segmen.filter((s) => s.n > 0).map((s) => {
        const px = lebar > 0 && total > 0 ? (lebar * s.n) / total : 0;
        const muat = px >= lebarAngka(s.n);
        const isi = muat && (
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              bgcolor: w.putih, color: w.tulisanDiPutih, fontSize: 12, fontWeight: 700, lineHeight: '16px', px: '4px',
              borderRadius: '3px', minWidth: 8, textAlign: 'center', ...CETAK,
            }}
          >
            {s.n}
          </Box>
        );
        const gaya = {
          flex: `${s.n} 1 0%`,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          ...isian(s),
        };
        if (!interaktif) {
          return <Box key={s.kunci ?? s.rentang} title={`${s.nama}: ${s.n}`} sx={gaya}>{isi}</Box>;
        }
        return (
          <Box
            key={s.kunci ?? s.rentang}
            component="button"
            type="button"
            title={`${s.nama}: ${s.n}`}
            aria-label={labelSegmen ? labelSegmen(s) : `${s.nama}: ${s.n} siswa`}
            onClick={() => onPilih(s)}
            sx={{
              ...gaya,
              border: 0,
              p: 0,
              font: 'inherit',
              cursor: 'pointer',
              borderLeft: `1px solid ${w.kartu}`,
              '&:first-of-type': { borderLeft: 0 },
              '&:hover': { filter: 'brightness(0.94)' },
              '&:focus-visible': { outline: `3px solid ${w.ink}`, outlineOffset: -3, zIndex: 1 },
            }}
          >
            {isi}
          </Box>
        );
      })}
    </Box>
  );
}

BatangSegmen.propTypes = {
  segmen: PropTypes.arrayOf(PropTypes.shape({ n: PropTypes.number.isRequired, nama: PropTypes.string })).isRequired,
  isian: PropTypes.func.isRequired,
  tinggi: PropTypes.number,
  label: PropTypes.string.isRequired,
  onPilih: PropTypes.func,
  labelSegmen: PropTypes.func,
};
