import PropTypes from 'prop-types';
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CETAK, gayaChip, warnaRingkasan } from '../ringkasan/gayaRingkasan';
import {
  KEADAAN, keadaanKelas, persenPerhatian, pesanKeadaan, rincianPerhatian, teksUmur,
} from '../ringkasan/ringkasan';
import { ringkasAmbang } from '../rentang';

// Ukuran huruf tabel mengikuti perubahan Anda: isi 1rem agar mudah dibaca. Angka perhatian dibesarkan.

const Judul = ({ children }) => (
  <Typography variant="h6" sx={{ fontSize: '0.9375rem' }}>{children}</Typography>
);
Judul.propTypes = { children: PropTypes.node };

const Isi = ({ children, tebal = false }) => (
  <Typography sx={{ fontSize: '1rem', fontWeight: tebal ? 600 : undefined }}>{children}</Typography>
);
Isi.propTypes = { children: PropTypes.node, tebal: PropTypes.bool };

const semesterKelas = (k) => `${k.semester} ${k.tahun_ajaran}`.trim();

/** Penanda kelas kasus latihan: kotak hitam berisi teks, bukan hanya warna. */
const TagKasus = ({ kelas }) => {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', minHeight: 22, px: 1, borderRadius: '4px', fontSize: 12, fontWeight: 600, bgcolor: w.ink, color: w.kartu, ...CETAK,
      }}
    >
      {`Kasus ${kelas.kasus_kode ?? ''}`.trim()}
    </Box>
  );
};
TagKasus.propTypes = { kelas: PropTypes.object.isRequired };

/** Batang tipis 8px dengan angka tertulis di sampingnya (angka, bukan batang, yang dibaca). */
const BatangTipis = ({ persen, label, warna }) => {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={persen}
      sx={{ height: 8, borderRadius: '4px', bgcolor: w.trek, overflow: 'hidden', ...CETAK }}
    >
      <Box sx={{ width: `${persen}%`, height: '100%', bgcolor: warna ?? w.ink, ...CETAK }} />
    </Box>
  );
};
BatangTipis.propTypes = { persen: PropTypes.number.isRequired, label: PropTypes.string.isRequired, warna: PropTypes.string };

function SelPerhatian({ k, w }) {
  const kartu = k.ringkasan.kartu;
  const persen = persenPerhatian(k);
  const rincian = rincianPerhatian(kartu, { pendek: true });
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography component="span" sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{kartu.perhatian}</Typography>
        <Typography component="span" sx={{ fontSize: 13, color: w.sekunder }}>{`${persen}% dari kelas`}</Typography>
      </Box>
      <BatangTipis persen={persen} label={`Siswa perlu perhatian di ${k.nama_kelas}`} />
      <Typography sx={{ fontSize: 12, color: w.sekunder, lineHeight: '17px' }}>
        {rincian || 'Tidak ada yang ditandai'}
      </Typography>
    </Box>
  );
}
SelPerhatian.propTypes = { k: PropTypes.object.isRequired, w: PropTypes.object.isRequired };

function SelKelengkapan({ k, w }) {
  const kl = k.ringkasan.kartu.kelengkapan;
  if (kl.total === 0) return <Typography sx={{ fontSize: 13, color: w.sekunder }}>Belum ada isian TP</Typography>;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{`${kl.persen}%`}</Typography>
      <BatangTipis persen={kl.persen} label={`Kelengkapan nilai TP ${k.nama_kelas}`} warna={w.navy} />
    </Box>
  );
}
SelKelengkapan.propTypes = { k: PropTypes.object.isRequired, w: PropTypes.object.isRequired };

const TombolBuka = ({ k, onBuka, penuh = false }) => (
  <Button
    variant="outlined"
    onClick={(e) => { e.stopPropagation(); onBuka(k.id); }}
    aria-label={`Buka kelas ${k.nama_kelas} ${k.mapel}`}
    sx={{
      minHeight: 44, minWidth: 80, fontWeight: 600, textTransform: 'none', width: penuh ? '100%' : 'auto',
    }}
  >
    {penuh ? `Buka kelas ${k.nama_kelas}` : 'Buka'}
  </Button>
);
TombolBuka.propTypes = { k: PropTypes.object.isRequired, onBuka: PropTypes.func.isRequired, penuh: PropTypes.bool };

/**
 * Daftar kelas nyata (L-1). Layar lebar: tabel dengan ukuran huruf besar. Layar sempit: satu kartu per kelas.
 * Kelas yang angkanya tidak bisa dibaca (galat, tanpa siswa, tanpa struktur, ringkasan tidak termuat) menampilkan
 * alasannya, bukan angka 0, karena 0 akan terbaca "tidak ada masalah".
 */
const KelasTable = ({
  kelas,
  onBuka,
  memuat = false,
  pesanKosong = 'Belum ada kelas.',
}) => {
  const w = warnaRingkasan(useTheme());
  const daftar = Array.isArray(kelas) ? kelas : [];

  if (memuat || daftar.length === 0) {
    return (
      <Box sx={{ bgcolor: w.kartu, border: `1px solid ${w.garis}`, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, p: 3, textAlign: 'center' }}>
          {memuat ? <CircularProgress size={28} /> : <Typography variant="h6">{pesanKosong}</Typography>}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: w.kartu, border: `1px solid ${w.garis}`, borderRadius: '8px', overflow: 'hidden' }}>
      {/* Layar lebar: tabel */}
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table aria-label="Daftar kelas" sx={{ minWidth: 1020 }}>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: `1px solid ${w.ink}` } }}>
              <TableCell><Judul>Kelas</Judul></TableCell>
              <TableCell align="center"><Judul>Siswa</Judul></TableCell>
              <TableCell sx={{ minWidth: 200 }}><Judul>Perlu perhatian</Judul></TableCell>
              <TableCell align="center"><Judul>Pengayaan</Judul></TableCell>
              <TableCell align="center"><Judul>Data belum cukup</Judul></TableCell>
              <TableCell sx={{ minWidth: 150 }}><Judul>Kelengkapan nilai</Judul></TableCell>
              <TableCell><Judul>Terakhir diubah</Judul></TableCell>
              <TableCell align="center"><Judul>Aksi</Judul></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {daftar.map((k) => {
              const keadaan = keadaanKelas(k);
              const ada = keadaan === KEADAAN.ADA;
              return (
                <TableRow key={k.id} hover sx={{ cursor: 'pointer', '& td': { verticalAlign: 'middle' } }} onClick={() => onBuka(k.id)}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700 }}>{k.nama_kelas}</Typography>
                    <Typography sx={{ fontSize: 13, color: w.sekunder }}>{`${k.mapel} · ${semesterKelas(k)}`}</Typography>
                  </TableCell>
                  <TableCell align="center"><Isi>{k.jumlah_siswa}</Isi></TableCell>
                  {ada ? (
                    <>
                      <TableCell><SelPerhatian k={k} w={w} /></TableCell>
                      <TableCell align="center"><Isi>{k.ringkasan.kartu.pengayaan}</Isi></TableCell>
                      <TableCell align="center"><Isi>{k.ringkasan.kartu.belum_cukup}</Isi></TableCell>
                      <TableCell><SelKelengkapan k={k} w={w} /></TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={4}>
                      <Box sx={{ ...gayaChip(w, false), whiteSpace: 'normal', py: 0.5, borderStyle: 'dashed', borderRadius: '6px' }}>
                        {pesanKeadaan(keadaan)}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell><Isi>{teksUmur(k.terakhir_diubah)}</Isi></TableCell>
                  <TableCell align="center"><TombolBuka k={k} onBuka={onBuka} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Layar sempit: satu kartu per kelas */}
      {/* borderRadius 0: tema memberi radius ke setiap .MuiBox-root, yang membuat garis pemisah melengkung. */}
      <Box component="ul" sx={{ display: { xs: 'block', md: 'none' }, listStyle: 'none', m: 0, p: 0, borderRadius: 0 }}>
        {daftar.map((k) => {
          const keadaan = keadaanKelas(k);
          const ada = keadaan === KEADAAN.ADA;
          const kartu = ada ? k.ringkasan.kartu : null;
          return (
            <Box
              component="li"
              key={k.id}
              sx={{
                borderRadius: 0, borderBottom: `1px solid ${w.garis}`, '&:last-of-type': { borderBottom: 0 }, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{k.nama_kelas}</Typography>
                <Typography sx={{ fontSize: 14, color: w.sekunder }}>{`${k.mapel} · ${semesterKelas(k)} · ${k.jumlah_siswa} siswa`}</Typography>
              </Box>
              {ada ? (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Perlu perhatian</Typography>
                    <SelPerhatian k={k} w={w} />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: w.sekunder }}>Pengayaan</Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{kartu.pengayaan}</Typography>
                    </Box>
                    <Box sx={{ border: `1px dashed ${w.ink}`, borderRadius: '6px', px: 1, py: 0.5 }}>
                      <Typography sx={{ fontSize: 12, color: w.sekunder }}>Data belum cukup</Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{kartu.belum_cukup}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Kelengkapan nilai</Typography>
                    <SelKelengkapan k={k} w={w} />
                  </Box>
                </>
              ) : (
                <Box sx={{ ...gayaChip(w, false), whiteSpace: 'normal', py: 0.75, borderStyle: 'dashed', borderRadius: '6px' }}>
                  {pesanKeadaan(keadaan)}
                </Box>
              )}
              <Typography sx={{ fontSize: 13, color: w.sekunder }}>{`Terakhir diubah: ${teksUmur(k.terakhir_diubah)} · batas nilai ${ringkasAmbang(k)}`}</Typography>
              <TombolBuka k={k} onBuka={onBuka} penuh />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

KelasTable.propTypes = {
  kelas: PropTypes.array.isRequired,
  onBuka: PropTypes.func.isRequired,
  memuat: PropTypes.bool,
  pesanKosong: PropTypes.string,
};

export { TagKasus, TombolBuka };
export default KelasTable;
