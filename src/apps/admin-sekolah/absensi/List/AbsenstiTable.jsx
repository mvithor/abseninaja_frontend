import {
  Typography,
  Box,
  TableHead,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  IconButton,
  Tooltip,
  TableFooter,
  TableContainer,
  Paper,
  CircularProgress,
} from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

// ===== Helper status =====
const normalizeStatus = (name = '') => {
const s = String(name).trim().toLowerCase();
if (s === 'masuk' || s === 'hadir') return 'Hadir';
if (s === 'terlambat') return 'Terlambat';
if (s === 'izin') return 'Izin';
if (s === 'sakit') return 'Sakit';
if (s === 'pulang') return 'Pulang';
if (s === 'alpa' || s === 'tanpa keterangan') return 'Tanpa Keterangan';
return name || 'Tanpa Keterangan';
};

// Ambil status siap tampil dari beberapa kemungkinan field yang mungkin dikirim BE
// Prioritas: status_akhir -> status_custom -> status_masuk -> status_kehadiran (kompat lama)
const resolveStatus = (row = {}) => {
const raw =
  row.status_akhir ||
  row.status_custom ||
  row.status_masuk ||
  row.status_kehadiran || // kompat lama
  '';
return normalizeStatus(raw);
};

// Style chip status
const statusStyle = (status) => {
switch (status) {
  case 'Hadir':
    return { bg: '#DFFFE0', fg: '#008000' };
  case 'Pulang':
    return { bg: '#FFE0E0', fg: '#FF0000' };
  case 'Izin':
    return { bg: '#FFF4CC', fg: '#CC9900' };
  case 'Sakit':
    return { bg: '#D0E7FF', fg: '#0056B3' };
  case 'Tanpa Keterangan':
    return { bg: '#FFC1B3', fg: '#FF6347' };
  case 'Terlambat':
    return { bg: '#FFE4B5', fg: '#CC6600' };
  default:
    return { bg: '#F5F5F5', fg: '#000000' };
}
};

// Beberapa status (Izin/Sakit/Custom) memang tidak punya jam → tampilkan "—"
const statusDoesNotRequireTime = (status) => {
const s = normalizeStatus(status);
return s === 'Izin' || s === 'Sakit';
};

const AbsensiTable = ({
absensi,
page,
rowsPerPage,
handleChangePage,
handleEdit,
handleChangeRowsPerPage,
isLoading,
isError,
errorMessage,
}) => {
return (
  <Paper variant="outlined">
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6">No</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6">Nama</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6">Tanggal</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6">Jam Masuk</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6">Jam Keluar</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6">Status</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="h6">Aksi</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                  }}
                >
                  <CircularProgress />
                </Box>
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                  }}
                >
                  <Typography color="error" variant="h6">
                    {errorMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : absensi.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    minHeight: '100px',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6">
                    Tidak ada data absensi yang tersedia
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            absensi
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, index) => {
                const status = resolveStatus(item);
                const { bg, fg } = statusStyle(status);
                const showDash = statusDoesNotRequireTime(status);

                return (
                  <TableRow key={item.absensi_id}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.nama}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.tanggal}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {showDash ? '—' : (item.jam_masuk || '—')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {showDash ? '—' : (item.jam_pulang || '—')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          backgroundColor: bg,
                          color: fg,
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          textAlign: 'center',
                        }}
                      >
                        {status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Tooltip title="Edit" placement="bottom">
                          <IconButton onClick={() => handleEdit(item.absensi_id)}>
                            <IconEdit width={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
              colSpan={7}
              count={absensi.length}
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

AbsensiTable.propTypes = {
absensi: PropTypes.array.isRequired,
page: PropTypes.number.isRequired,
rowsPerPage: PropTypes.number.isRequired,
handleChangePage: PropTypes.func.isRequired,
handleChangeRowsPerPage: PropTypes.func.isRequired,
handleEdit: PropTypes.func.isRequired,
isLoading: PropTypes.bool.isRequired,
isError: PropTypes.bool.isRequired,
errorMessage: PropTypes.string,
};

export default AbsensiTable;
