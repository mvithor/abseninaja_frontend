import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconEye, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { CETAK, gayaChip, warnaRingkasan } from '../ringkasan/gayaRingkasan';
import {
  KEADAAN, keadaanKelas, persenPerhatian, pesanKeadaan, teksUmur,
} from '../ringkasan/ringkasan';
import { ringkasAmbang } from '../rentang';
import { polaMuncul } from './hapusKelas';

// Ukuran huruf tabel mengikuti perubahan Anda: isi 1rem agar mudah dibaca. Angka perhatian dibesarkan.

const PILIHAN_BARIS = [5, 10, 25];
const BARIS_AWAL = 5;

const Judul = ({ children }) => (
  <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: '1.2rem' }}>{children}</Typography>
);
Judul.propTypes = { children: PropTypes.node };

const Isi = ({ children, tebal = false }) => (
  <Typography sx={{ fontSize: '1rem', fontWeight: tebal ? 600 : undefined }}>{children}</Typography>
);
Isi.propTypes = { children: PropTypes.node, tebal: PropTypes.bool };

const semesterKelas = (k) => `${k.semester} ${k.tahun_ajaran}`.trim();

/** Penanda kelas kasus latihan: chip primer berisi teks "Kasus A", bukan hanya warna. */
const TagKasus = ({ kelas }) => {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', minHeight: 26, px: '10px', borderRadius: '8px', fontSize: 13, fontWeight: 600, bgcolor: w.primer, color: '#fff', ...CETAK,
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
      sx={{ height: 8, borderRadius: '4px', bgcolor: w.trek, overflow: 'hidden', my: '4px', ...CETAK }}
    >
      <Box sx={{ width: `${persen}%`, height: '100%', borderRadius: '4px', bgcolor: warna ?? w.seluruh, ...CETAK }} />
    </Box>
  );
};
BatangTipis.propTypes = { persen: PropTypes.number.isRequired, label: PropTypes.string.isRequired, warna: PropTypes.string };

function SelPerhatian({ k, w }) {
  const kartu = k.ringkasan.kartu;
  const persen = persenPerhatian(k);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: 150, minWidth: 120 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.2 }}>{kartu.perhatian}</Typography>
        <Typography component="span" sx={{ fontSize: 13, color: w.sekunder }}>{`${persen}% dari kelas`}</Typography>
      </Box>
      <BatangTipis persen={persen} label={`Siswa perlu perhatian di ${k.nama_kelas}`} />
    </Box>
  );
}
SelPerhatian.propTypes = { k: PropTypes.object.isRequired, w: PropTypes.object.isRequired };

/**
 * Kolom "Pola yang muncul": satu chip per pola dengan jumlah siswanya. Jumlah semua chip sama dengan angka
 * "Perlu perhatian" di sebelahnya, karena tiap siswa dihitung pada pola utamanya saja.
 */
function SelPola({ k, w }) {
  const pola = polaMuncul(k.ringkasan.kartu);
  if (pola.length === 0) return <Typography sx={{ fontSize: 13, color: w.sekunder }}>Tidak ada yang ditandai</Typography>;
  return (
    <Box component="ul" aria-label={`Pola yang muncul di ${k.nama_kelas}`} sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: 230 }}>
      {pola.map((p) => (
        <Box
          component="li"
          key={p.kode}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            minHeight: 28,
            pl: '10px',
            pr: '4px',
            borderRadius: '8px',
            bgcolor: w.latar,
            boxShadow: 'none',
            fontSize: 13,
            color: w.ink,
            whiteSpace: 'nowrap',
            ...CETAK,
          }}
        >
          {p.teks}
          <Box
            component="b"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 20,
              height: 20,
              px: '5px',
              borderRadius: '6px',
              bgcolor: w.kartu,
              boxShadow: 'none',
              fontSize: 13,
              fontWeight: 700,
              ...CETAK,
            }}
          >
            {p.jumlah}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
SelPola.propTypes = { k: PropTypes.object.isRequired, w: PropTypes.object.isRequired };

function SelKelengkapan({ k, w }) {
  const kl = k.ringkasan.kartu.kelengkapan;
  if (kl.total === 0) return <Typography sx={{ fontSize: 13, color: w.sekunder }}>Belum ada isian TP</Typography>;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 104 }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{`${kl.persen}%`}</Typography>
      <BatangTipis persen={kl.persen} label={`Kelengkapan nilai TP ${k.nama_kelas}`} warna={w.primer} />
    </Box>
  );
}
SelKelengkapan.propTypes = { k: PropTypes.object.isRequired, w: PropTypes.object.isRequired };

/** Tombol teks "Buka" untuk kartu layar sempit. Di tabel, aksi memakai ikon (lihat TombolIkonBuka). */
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

/** Ikon mata pada kolom Aksi tabel (desain 1): membuka kelas. Sasaran sentuh 44px. */
const TombolIkonBuka = ({ k, onBuka }) => {
  const w = warnaRingkasan(useTheme());
  const label = `Buka kelas ${k.nama_kelas} ${k.mapel}`;
  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} onClick={(e) => { e.stopPropagation(); onBuka(k.id); }} sx={{ width: 40, height: 40, '&:hover': { bgcolor: w.primerMuda, color: w.primer } }}>
        <IconEye size={20} aria-hidden="true" />
      </IconButton>
    </Tooltip>
  );
};
TombolIkonBuka.propTypes = { k: PropTypes.object.isRequired, onBuka: PropTypes.func.isRequired };

/** Ikon tong sampah (desain 1): membuka dialog hapus kelas. Merah saat disorot, tetapi bentuknya yang membedakan. */
const TombolIkonHapus = ({ k, onHapus }) => {
  const label = `Hapus kelas ${k.nama_kelas} ${k.mapel}`;
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={(e) => { e.stopPropagation(); onHapus(k); }}
        sx={{ width: 40, height: 40, '&:hover': { bgcolor: '#FDEDE8', color: '#C4452A' } }}
      >
        <IconTrash size={20} aria-hidden="true" />
      </IconButton>
    </Tooltip>
  );
};
TombolIkonHapus.propTypes = { k: PropTypes.object.isRequired, onHapus: PropTypes.func.isRequired };

/**
 * Daftar kelas nyata (L-1). Layar lebar: tabel dengan ukuran huruf besar. Layar sempit: satu kartu per kelas.
 * Kelas yang angkanya tidak bisa dibaca (galat, tanpa siswa, tanpa struktur, ringkasan tidak termuat) menampilkan
 * alasannya, bukan angka 0, karena 0 akan terbaca "tidak ada masalah".
 * `onHapus(kelas)` membuka dialog hapus; tanpa prop ini ikon hapus tidak ditampilkan.
 */
const KelasTable = ({
  kelas,
  onBuka,
  onHapus,
  memuat = false,
  pesanKosong = 'Belum ada kelas.',
}) => {
  const w = warnaRingkasan(useTheme());
  const daftar = Array.isArray(kelas) ? kelas : [];
  const [halamanDipilih, setHalaman] = useState(0);
  const [barisPerHalaman, setBarisPerHalaman] = useState(BARIS_AWAL);

  if (memuat || daftar.length === 0) {
    return (
      <Box sx={{ bgcolor: w.kartu, border: `1px solid ${w.garis}`, borderRadius: '7px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, p: 3, textAlign: 'center' }}>
          {memuat ? <CircularProgress size={28} /> : <Typography variant="h6">{pesanKosong}</Typography>}
        </Box>
      </Box>
    );
  }

  // Halaman dijepit ke halaman terakhir yang ada: setelah sebuah kelas dihapus atau pencarian menyempit, halaman
  // yang dipilih bisa melewati ujung daftar, dan tabel kosong akan terbaca "tidak ada kelas".
  const halamanTerakhir = Math.max(0, Math.ceil(daftar.length / barisPerHalaman) - 1);
  const halaman = Math.min(halamanDipilih, halamanTerakhir);
  const awal = halaman * barisPerHalaman;
  const tampil = daftar.slice(awal, awal + barisPerHalaman);

  return (
    <Box sx={{ bgcolor: w.kartu, border: `1px solid ${w.garis}`, borderRadius: '7px', overflow: 'hidden' }}>
      {/* Layar lebar: tabel */}
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        {/* Sepuluh kolom: sela sel dirapatkan dan teks pendek tidak dipatahkan supaya Aksi tidak terdorong keluar layar. */}
        <Table aria-label="Daftar kelas" sx={{ minWidth: 1000, '& th, & td': { px: '8px', py: '14px' }, '& tbody tr:last-of-type td': { borderBottom: 0 } }}>
          <TableHead>
            <TableRow>
              <TableCell><Judul>No</Judul></TableCell>
              <TableCell><Judul>Kelas</Judul></TableCell>
              <TableCell align="center"><Judul>Siswa</Judul></TableCell>
              <TableCell sx={{ minWidth: 150 }}><Judul>Perlu perhatian</Judul></TableCell>
              <TableCell sx={{ minWidth: 190 }}><Judul>Pola yang muncul</Judul></TableCell>
              <TableCell align="center"><Judul>Pengayaan</Judul></TableCell>
              <TableCell align="center" sx={{ minWidth: 84 }}><Judul>Data belum cukup</Judul></TableCell>
              <TableCell sx={{ minWidth: 104 }}><Judul>Kelengkapan nilai</Judul></TableCell>
              <TableCell sx={{ minWidth: 84 }}><Judul>Terakhir diubah</Judul></TableCell>
              <TableCell align="center"><Judul>Aksi</Judul></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tampil.map((k, i) => {
              const keadaan = keadaanKelas(k);
              const ada = keadaan === KEADAAN.ADA;
              return (
                <TableRow key={k.id} hover sx={{ cursor: 'pointer', '& td': { verticalAlign: 'middle' }, '&.MuiTableRow-hover:hover': { bgcolor: w.barisHover } }} onClick={() => onBuka(k.id)}>
                  <TableCell><Isi>{awal + i + 1}</Isi></TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{k.nama_kelas}</Typography>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.35, color: w.sekunder, whiteSpace: 'nowrap' }}>{k.mapel}</Typography>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.35, color: w.sekunder, whiteSpace: 'nowrap' }}>{semesterKelas(k)}</Typography>
                  </TableCell>
                  <TableCell align="center"><Isi>{k.jumlah_siswa}</Isi></TableCell>
                  {ada ? (
                    <>
                      <TableCell><SelPerhatian k={k} w={w} /></TableCell>
                      <TableCell><SelPola k={k} w={w} /></TableCell>
                      <TableCell align="center"><Isi>{k.ringkasan.kartu.pengayaan}</Isi></TableCell>
                      <TableCell align="center"><Isi>{k.ringkasan.kartu.belum_cukup}</Isi></TableCell>
                      <TableCell><SelKelengkapan k={k} w={w} /></TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={5}>
                      <Box sx={{ ...gayaChip(w, false), whiteSpace: 'normal', py: 0.5, borderStyle: 'dashed', borderRadius: '6px' }}>
                        {pesanKeadaan(keadaan)}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell sx={{ whiteSpace: 'nowrap' }}><Isi>{teksUmur(k.terakhir_diubah)}</Isi></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <TombolIkonBuka k={k} onBuka={onBuka} />
                      {onHapus && <TombolIkonHapus k={k} onHapus={onHapus} />}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Layar sempit: satu kartu per kelas */}
      {/* borderRadius 0: tema memberi radius ke setiap .MuiBox-root, yang membuat garis pemisah melengkung. */}
      <Box component="ul" sx={{ display: { xs: 'block', md: 'none' }, listStyle: 'none', m: 0, p: 0, borderRadius: 0 }}>
        {tampil.map((k) => {
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Pola yang muncul</Typography>
                    <SelPola k={k} w={w} />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, color: w.sekunder }}>Pengayaan</Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{kartu.pengayaan}</Typography>
                    </Box>
                    <Box sx={{ border: `1px dashed ${w.ink}`, borderRadius: '6px', px: 1, py: 0.5 }}>
                      <Typography sx={{ fontSize: 13, color: w.sekunder }}>Data belum cukup</Typography>
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1 }}><TombolBuka k={k} onBuka={onBuka} penuh /></Box>
                {onHapus && <TombolIkonHapus k={k} onHapus={onHapus} />}
              </Box>
            </Box>
          );
        })}
      </Box>

      <TablePagination
        component="div"
        rowsPerPageOptions={PILIHAN_BARIS}
        count={daftar.length}
        rowsPerPage={barisPerHalaman}
        page={halaman}
        onPageChange={(_, p) => setHalaman(p)}
        onRowsPerPageChange={(e) => { setBarisPerHalaman(Number(e.target.value)); setHalaman(0); }}
        ActionsComponent={TablePaginationActions}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
        sx={{ borderTop: `1px solid ${w.garis}`, '& .MuiTablePagination-toolbar': { minHeight: 52 } }}
      />
    </Box>
  );
};

KelasTable.propTypes = {
  kelas: PropTypes.array.isRequired,
  onBuka: PropTypes.func.isRequired,
  onHapus: PropTypes.func,
  memuat: PropTypes.bool,
  pesanKosong: PropTypes.string,
};

export { TagKasus, TombolBuka, TombolIkonBuka };
export default KelasTable;
