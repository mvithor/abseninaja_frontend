import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Typography, TableHead, Table, TableBody, Tooltip, TableCell, TablePagination, TableRow, TableFooter, IconButton,
  TableContainer, Box, Paper, CircularProgress,
} from '@mui/material';
import { IconUserCheck } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { formatWaktu } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import { labelAlasan } from 'src/apps/pegawai-status/status';

const KOLOM = 6;
const UKURAN = [10, 25, 50, 100];

const PesanTengah = ({ children }) => (
  <TableRow>
    <TableCell colSpan={KOLOM}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
        {children}
      </Box>
    </TableCell>
  </TableRow>
);
PesanTengah.propTypes = { children: PropTypes.node };

const Judul = ({ children, align = 'center' }) => (
  <TableCell align={align}>
    <Typography variant="h6" sx={{ fontSize: '1rem' }}>{children}</Typography>
  </TableCell>
);
Judul.propTypes = { children: PropTypes.node, align: PropTypes.string };

// Server-side paging: `total` dari server, baris tidak diiris di klien.
const PegawaiNonaktifTable = ({
  data, total, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, handleAktifkan, timeZone, isLoading, isError, errorMessage,
}) => (
  <Paper variant="outlined">
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <Judul align="left">No</Judul>
            <Judul>Nama</Judul>
            <Judul>Kategori</Judul>
            <Judul>Alasan</Judul>
            <Judul>Dinonaktifkan</Judul>
            <Judul>Aksi</Judul>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <PesanTengah><CircularProgress /></PesanTengah>
          ) : isError ? (
            <PesanTengah><Typography color="error" variant="h6">{errorMessage}</Typography></PesanTengah>
          ) : data.length === 0 ? (
            <PesanTengah><Typography variant="h6">Tidak ada pegawai nonaktif</Typography></PesanTengah>
          ) : (
            data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell><Typography sx={{ fontSize: '1rem' }}>{page * rowsPerPage + index + 1}</Typography></TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: '1rem' }}>{item.nama || '-'}</Typography>
                  {item.nip && <Typography variant="caption" color="text.secondary">NIP {item.nip}</Typography>}
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: '1rem' }}>{item.nama_kategori || '-'}</Typography>
                  {item.nama_subkategori && <Typography variant="caption" color="text.secondary">{item.nama_subkategori}</Typography>}
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: '1rem' }}>{labelAlasan(item.alasan_kode)}</Typography>
                  {item.catatan_nonaktif && <Typography variant="caption" color="text.secondary">{item.catatan_nonaktif}</Typography>}
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: '1rem' }}>{formatWaktu(item.nonaktif_pada, timeZone)}</Typography>
                  {item.dinonaktifkan_oleh && <Typography variant="caption" color="text.secondary">oleh {item.dinonaktifkan_oleh}</Typography>}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Tooltip title="Aktifkan kembali" placement="bottom">
                      <IconButton onClick={() => handleAktifkan(item)} aria-label={`Aktifkan kembali ${item.nama}`}>
                        <IconUserCheck width={18} />
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
              rowsPerPageOptions={UKURAN}
              colSpan={KOLOM}
              count={total}
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

PegawaiNonaktifTable.propTypes = {
  data: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleAktifkan: PropTypes.func.isRequired,
  timeZone: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default memo(PegawaiNonaktifTable);
