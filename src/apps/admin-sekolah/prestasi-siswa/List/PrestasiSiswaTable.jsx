import PropTypes from 'prop-types';
import {
  Typography,
  TableHead,
  Table,
  TableBody,
  Tooltip,
  TableCell,
  TablePagination,
  TableRow,
  TableFooter,
  IconButton,
  TableContainer,
  Box,
  Paper,
  CircularProgress
} from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const mapJenisPeserta = (val) => {
  if (val === 'INDIVIDU') return 'Individu';
  if (val === 'REGU') return 'Regu / Kelompok';
  return val || '-';
};

const mapKategoriSifat = (val) => {
  if (val === 'AKADEMIK') return 'Akademik';
  if (val === 'NON_AKADEMIK') return 'Non Akademik';
  return val || '-';
};

const mapKategoriBidang = (val) => {
  switch (val) {
    case 'SAINS': return 'Sains';
    case 'HUMANIORA': return 'Humaniora';
    case 'OLAHRAGA': return 'Olahraga';
    case 'SENI': return 'Seni';
    case 'KEAGAMAAN': return 'Keagamaan';
    case 'LINGKUNGAN': return 'Lingkungan';
    case 'TEKNOLOGI': return 'Teknologi';
    case 'LAINNYA': return 'Lainnya';
    default: return val || '-';
  }
};

// Gabungkan sifat + bidang jadi satu kolom "Kategori"
const formatKategori = (sifat, bidang) => {
  const s = mapKategoriSifat(sifat);
  const b = mapKategoriBidang(bidang);
  if (!s && !b) return '-';
  if (!s) return b;
  if (!b) return s;
  return `${s} — ${b}`;
};

const mapTingkat = (val) => {
  switch (val) {
    case 'SEKOLAH': return 'Sekolah';
    case 'KECAMATAN': return 'Kecamatan';
    case 'KABUPATEN': return 'Kabupaten';
    case 'KOTA': return 'Kota';
    case 'PROVINSI': return 'Provinsi';
    case 'NASIONAL': return 'Nasional';
    case 'INTERNASIONAL': return 'Internasional';
    default: return val || '-';
  }
};

const mapPeringkat = (val) => {
  switch (val) {
    case 'JUARA_1': return 'Juara 1';
    case 'JUARA_2': return 'Juara 2';
    case 'JUARA_3': return 'Juara 3';
    case 'HARAPAN_1': return 'Harapan 1';
    case 'HARAPAN_2': return 'Harapan 2';
    case 'HARAPAN_3': return 'Harapan 3';
    case 'FINALIS': return 'Finalis';
    default: return val || '-';
  }
};

const PrestasiSiswaTable = ({
  prestasi,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  isLoading,
  isError,
  errorMessage
}) => {
  const visibleRows =
    rowsPerPage > 0
      ? prestasi.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : prestasi;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  No
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Prestasi
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Jenis Peserta
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Kategori
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Tingkat
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Peringkat
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Penyelenggara
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Anggota
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Aksi
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '100px'
                    }}
                  >
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '100px'
                    }}
                  >
                    <Typography color="error" variant="h6">
                      {errorMessage || 'Terjadi kesalahan saat memuat data'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : prestasi.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      minHeight: '100px',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h6">Tidak ada data prestasi</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((prestasiSiswa, index) => (
                <TableRow key={prestasiSiswa.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem' }}>
                      {page * rowsPerPage + index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {prestasiSiswa.nama_prestasi}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {mapJenisPeserta(prestasiSiswa.jenis_peserta)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {formatKategori(
                        prestasiSiswa.kategori_sifat,
                        prestasiSiswa.kategori_bidang
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {mapTingkat(prestasiSiswa.tingkat)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {mapPeringkat(prestasiSiswa.peringkat)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {prestasiSiswa.penyelenggara}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {prestasiSiswa.jumlah_anggota ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                      }}
                    >
                      <Tooltip title="Edit" placement="bottom">
                        <IconButton onClick={() => handleEdit(prestasiSiswa.id)}>
                          <IconEdit width={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus" placement="bottom">
                        <IconButton onClick={() => handleDelete(prestasiSiswa.id)}>
                          <IconTrash width={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={9}
                count={prestasi.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                labelRowsPerPage="Rows per page:"
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
};

PrestasiSiswaTable.propTypes = {
  prestasi: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default PrestasiSiswaTable;
