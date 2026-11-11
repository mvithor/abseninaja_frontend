import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CETAK, gayaTautan, warnaRingkasan } from './gayaRingkasan';
import { polaMuncul } from '../beranda/hapusKelas';
import { kartuAngka } from './ringkasan';

// Chip pola di dalam kartu Perlu perhatian: latar putih dengan lencana jumlah berlatar abu muda (sesuai desain).
function ChipPola({ teks, jumlah }) {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      component="li"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: 28, pl: '10px', pr: '4px', borderRadius: '8px', bgcolor: w.kartu,
        fontSize: 13, color: w.ink, whiteSpace: 'nowrap', boxShadow: 'none', ...CETAK,
      }}
    >
      {teks}
      <Box
        component="b"
        sx={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, px: '5px', borderRadius: '6px', bgcolor: w.latar, fontSize: 13, fontWeight: 700,
        }}
      >
        {jumlah}
      </Box>
    </Box>
  );
}
ChipPola.propTypes = { teks: PropTypes.string.isRequired, jumlah: PropTypes.number.isRequired };

function Tile({
  judul, angka, satuan, rinci, latar, putus, aksi, onAksi, children,
}) {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      component="section"
      aria-label={judul}
      sx={{
        bgcolor: latar,
        border: putus ? `1px dashed ${w.abu}` : 0,
        borderRadius: '7px',
        boxShadow: 'none',
        p: { xs: '14px', md: '20px' },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 0.5, md: 0.75 },
        minWidth: 0,
        ...CETAK,
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: w.ink }}>{judul}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography component="span" sx={{ fontSize: 36, lineHeight: '42px', fontWeight: 600, color: w.ink }}>
          {angka}
        </Typography>
        {satuan && <Typography component="span" sx={{ fontSize: 16, color: w.ink }}>{satuan}</Typography>}
      </Box>
      {children}
      {rinci && <Typography sx={{ fontSize: 13, lineHeight: 1.45, color: w.ink }}>{rinci}</Typography>}
      {aksi && (
        <Box component="button" type="button" onClick={onAksi} sx={{ ...gayaTautan(w), mt: 0.5, fontSize: 14 }}>
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
  latar: PropTypes.string,
  putus: PropTypes.bool,
  aksi: PropTypes.string,
  onAksi: PropTypes.func,
  children: PropTypes.node,
};

/**
 * Empat kartu angka di puncak Ringkasan, masing-masing berlatar warna lembut (kuning, hijau, abu, biru). "Data belum
 * cukup" berbingkai putus-putus: bentuk bingkainya membedakan, bukan warna. Kartu terakhir tidak punya aksi karena
 * ia hanya ukuran kelengkapan. Kartu "Perlu perhatian" memuat chip pola utama dengan jumlah siswanya.
 */
export default function KartuAngka({ data, onBukaPerhatian, onBukaLengkapi }) {
  const w = warnaRingkasan(useTheme());
  const k = kartuAngka(data);
  const pola = polaMuncul(data.kartu);
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
        rinci={pola.length > 0 ? undefined : k.perhatian.rinci}
        latar={w.bgPeringatan}
        aksi="Lihat daftar"
        onAksi={onBukaPerhatian}
      >
        {pola.length > 0 && (
          <Box component="ul" aria-label="Pola utama murid yang perlu perhatian" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: 260 }}>
            {pola.map((x) => <ChipPola key={x.kode} teks={x.teks} jumlah={x.jumlah} />)}
          </Box>
        )}
      </Tile>
      <Tile
        judul="Pengayaan"
        angka={k.pengayaan.angka}
        satuan={k.pengayaan.satuan}
        rinci={k.pengayaan.rinci}
        latar={w.bgOk}
        aksi="Lihat daftar"
        onAksi={onBukaPerhatian}
      />
      <Tile
        judul="Data belum cukup"
        angka={k.belumCukup.angka}
        satuan={k.belumCukup.satuan}
        rinci={k.belumCukup.rinci}
        latar={w.latar}
        putus
        aksi="Lihat apa yang kurang"
        onAksi={onBukaLengkapi}
      />
      <Tile judul="Kelengkapan nilai TP" angka={k.kelengkapan.angka} rinci={k.kelengkapan.rinci} latar={w.bgPetunjuk}>
        <Box
          role="progressbar"
          aria-label="Kelengkapan nilai TP"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={k.kelengkapan.persen}
          sx={{ height: 8, borderRadius: '4px', bgcolor: w.kartu, overflow: 'hidden', ...CETAK }}
        >
          <Box sx={{ width: `${k.kelengkapan.persen}%`, height: '100%', bgcolor: w.primer }} />
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
