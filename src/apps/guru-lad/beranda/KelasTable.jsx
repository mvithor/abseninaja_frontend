import PropTypes from 'prop-types';
import {
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
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
import { IconChevronRight, IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { ringkasAmbang } from 'src/apps/guru-lad/rentang';

const KETERANGAN_AMBANG = 'Remedial bagian tertentu / KKTP / pengayaan';
const SEMUA_BARIS = -1;

const Judul = ({ children }) => (
  <Typography variant="h6" sx={{ fontSize: '1rem' }}>{children}</Typography>
);
Judul.propTypes = { children: PropTypes.node };

const Isi = ({ children, tebal = false }) => (
  <Typography sx={{ fontSize: '1rem', fontWeight: tebal ? 600 : undefined }}>{children}</Typography>
);
Isi.propTypes = { children: PropTypes.node, tebal: PropTypes.bool };

const ChipJenis = ({ kelas }) => (
  kelas.jenis === 'NYATA'
    ? <Chip size="small" variant="outlined" label="Kelas nyata" />
    : <Chip size="small" color="warning" label={`Kasus ${kelas.kasus_kode ?? ''}`.trim()} />
);
ChipJenis.propTypes = { kelas: PropTypes.object.isRequired };

const semesterKelas = (k) => `${k.semester} ${k.tahun_ajaran}`.trim();

const KelasTable = ({
  kelas,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onBuka,
  memuat = false,
  pesanKosong = 'Belum ada kelas.',
}) => {
  const daftar = Array.isArray(kelas) ? kelas : [];
  const semua = rowsPerPage === SEMUA_BARIS;

  // Halaman dijepit supaya tetap sah bila daftar menyusut (pencarian, atau data dimuat ulang).
  const halamanMaks = semua ? 0 : Math.max(0, Math.ceil(daftar.length / rowsPerPage) - 1);
  const halaman = Math.min(page, halamanMaks);
  const awal = semua ? 0 : halaman * rowsPerPage;
  const tampil = semua ? daftar : daftar.slice(awal, awal + rowsPerPage);

  if (memuat || daftar.length === 0) {
    return (
      <Paper variant="outlined">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, p: 3, textAlign: 'center' }}>
          {memuat ? <CircularProgress size={28} /> : <Typography variant="h6">{pesanKosong}</Typography>}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined">
      {/* Layar lebar: tabel */}
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table aria-label="Daftar kelas">
          <TableHead>
            <TableRow>
              <TableCell><Judul>No</Judul></TableCell>
              <TableCell align="center"><Judul>Kelas</Judul></TableCell>
              <TableCell align="center"><Judul>Mata Pelajaran</Judul></TableCell>
              <TableCell align="center"><Judul>Semester</Judul></TableCell>
              <TableCell align="center"><Judul>Siswa</Judul></TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title={KETERANGAN_AMBANG} placement="top">
                  <Box component="span"><Judul>Batas Nilai</Judul></Box>
                </Tooltip>
              </TableCell>
              <TableCell align="center"><Judul>Jenis</Judul></TableCell>
              <TableCell align="center"><Judul>Aksi</Judul></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tampil.map((k, i) => (
              <TableRow key={k.id} hover sx={{ cursor: 'pointer' }} onClick={() => onBuka(k.id)}>
                <TableCell><Isi>{awal + i + 1}</Isi></TableCell>
                <TableCell align="center"><Isi tebal>{k.nama_kelas}</Isi></TableCell>
                <TableCell align="center"><Isi>{k.mapel}</Isi></TableCell>
                <TableCell align="center"><Isi>{semesterKelas(k)}</Isi></TableCell>
                <TableCell align="center"><Isi>{k.jumlah_siswa}</Isi></TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}><Isi>{ringkasAmbang(k)}</Isi></TableCell>
                <TableCell align="center"><ChipJenis kelas={k} /></TableCell>
                <TableCell align="center">
                  <Tooltip title="Buka kelas" placement="bottom">
                    <IconButton
                      aria-label={`Buka kelas ${k.nama_kelas} ${k.mapel}`}
                      onClick={(e) => { e.stopPropagation(); onBuka(k.id); }}
                    >
                      <IconEye width={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Layar sempit: satu kartu per kelas */}
      {/* borderRadius 0: tema memberi radius ke setiap .MuiBox-root, yang membuat garis pemisah melengkung. */}
      <Box component="ul" sx={{ display: { xs: 'block', md: 'none' }, listStyle: 'none', m: 0, p: 0, borderRadius: 0 }}>
        {tampil.map((k) => (
          <Box
            component="li"
            key={k.id}
            sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider', '&:last-of-type': { borderBottom: 0 } }}
          >
            <ButtonBase
              component="div"
              onClick={() => onBuka(k.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                width: '100%',
                px: 2,
                py: 1.75,
                textAlign: 'left',
                '&:hover, &.Mui-focusVisible': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="h6" noWrap sx={{ fontSize: '1.0625rem' }}>{k.nama_kelas}</Typography>
                  <ChipJenis kelas={k} />
                </Box>
                <Typography sx={{ fontSize: '1rem', mt: 0.5 }}>{k.mapel}</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {`${semesterKelas(k)} · ${k.jumlah_siswa} siswa`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1, mt: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Batas nilai</Typography>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>{ringkasAmbang(k)}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                  remedial / KKTP / pengayaan
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', color: 'text.secondary' }} aria-hidden="true">
                <IconChevronRight size={20} />
              </Box>
            </ButtonBase>
          </Box>
        ))}
      </Box>

      <TablePagination
        component="div"
        rowsPerPageOptions={[5, 10, 25, { label: 'Semua', value: SEMUA_BARIS }]}
        count={daftar.length}
        rowsPerPage={rowsPerPage}
        page={halaman}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        ActionsComponent={TablePaginationActions}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`}
        sx={{
          // Toolbar boleh turun baris; spacer bawaan (basis 100%) harus mati supaya tidak memaksa baris baru.
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-end' },
            rowGap: 0.5,
            px: { xs: 1, md: 2 },
            py: { xs: 0.5, md: 0 },
          },
          '& .MuiTablePagination-spacer': { display: 'none' },
          // Di HP pemilih baris per halaman disembunyikan; sisakan "1–5 dari 25" dan tombol halaman.
          '& .MuiTablePagination-selectLabel': { display: { xs: 'none', sm: 'block' } },
          '& .MuiTablePagination-input': { display: { xs: 'none', sm: 'inline-flex' } },
          '& .MuiTablePagination-toolbar .MuiIconButton-root': { p: { xs: 0.75, md: 1 } },
        }}
      />
    </Paper>
  );
};

KelasTable.propTypes = {
  kelas: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  onBuka: PropTypes.func.isRequired,
  memuat: PropTypes.bool,
  pesanKosong: PropTypes.string,
};

export default KelasTable;