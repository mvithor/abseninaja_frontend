import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { gayaKartu, gayaTautan, warnaRingkasan } from './gayaRingkasan';
import { kartuAngka } from './ringkasan';

function Tile({
  judul, angka, satuan, rinci, gaya, aksi, onAksi, children,
}) {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      component="section"
      aria-label={judul}
      sx={{
        ...gayaKartu(w, gaya),
        p: { xs: '14px', md: '20px' },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 0.5, md: 0.75 },
        minWidth: 0,
      }}
    >
      <Typography sx={{ fontSize: { xs: 13, md: 14 }, fontWeight: 600, color: w.ink }}>{judul}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography component="span" sx={{ fontSize: { xs: 36, md: 44 }, lineHeight: { xs: '40px', md: '48px' }, fontWeight: 700, color: w.ink }}>
          {angka}
        </Typography>
        {satuan && <Typography component="span" sx={{ fontSize: { xs: 13, md: 16 }, color: w.sekunder }}>{satuan}</Typography>}
      </Box>
      {children}
      {rinci && <Typography sx={{ fontSize: 13, lineHeight: { xs: '18px', md: '19px' }, color: w.sekunder }}>{rinci}</Typography>}
      {aksi && (
        <Box component="button" type="button" onClick={onAksi} sx={{ ...gayaTautan(w), mt: 0.5, fontSize: { xs: 13, md: 14 } }}>
          {aksi}
        </Box>
      )}
    </Box>
  );
}
Tile.propTypes = {
  judul: PropTypes.string.isRequired,
  angka: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  satuan: PropTypes.string,
  rinci: PropTypes.string,
  gaya: PropTypes.string,
  aksi: PropTypes.string,
  onAksi: PropTypes.func,
  children: PropTypes.node,
};

/**
 * Empat kartu angka di puncak Ringkasan. Kartu "Perlu perhatian" berbingkai tegas, "Data belum cukup" putus-putus:
 * bentuk bingkainya membedakan, bukan warna. Kartu terakhir tidak punya aksi karena ia hanya ukuran kelengkapan.
 */
export default function KartuAngka({ data, onBukaPerhatian, onBukaLengkapi }) {
  const w = warnaRingkasan(useTheme());
  const k = kartuAngka(data);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(auto-fit, minmax(240px, 1fr))' },
        gap: { xs: 1.5, md: 2 },
      }}
    >
      <Tile
        judul="Perlu perhatian"
        angka={k.perhatian.angka}
        satuan={k.perhatian.satuan}
        rinci={k.perhatian.rinci}
        gaya="tegas"
        aksi="Lihat daftar"
        onAksi={onBukaPerhatian}
      />
      <Tile
        judul="Pengayaan"
        angka={k.pengayaan.angka}
        satuan={k.pengayaan.satuan}
        rinci={k.pengayaan.rinci}
        aksi="Lihat daftar"
        onAksi={onBukaPerhatian}
      />
      <Tile
        judul="Data belum cukup"
        angka={k.belumCukup.angka}
        satuan={k.belumCukup.satuan}
        rinci={k.belumCukup.rinci}
        gaya="putus"
        aksi="Lihat apa yang kurang"
        onAksi={onBukaLengkapi}
      />
      <Tile judul="Kelengkapan nilai TP" angka={k.kelengkapan.angka} rinci={k.kelengkapan.rinci}>
        <Box
          role="progressbar"
          aria-label="Kelengkapan nilai TP"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={k.kelengkapan.persen}
          sx={{ height: 8, borderRadius: '4px', bgcolor: w.trek, overflow: 'hidden', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <Box sx={{ width: `${k.kelengkapan.persen}%`, height: '100%', bgcolor: w.navy }} />
        </Box>
      </Tile>
    </Box>
  );
}

KartuAngka.propTypes = {
  data: PropTypes.object.isRequired,
  onBukaPerhatian: PropTypes.func.isRequired,
  onBukaLengkapi: PropTypes.func.isRequired,
};
