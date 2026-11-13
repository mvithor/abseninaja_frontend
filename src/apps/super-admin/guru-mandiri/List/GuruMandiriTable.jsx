import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Typography, TableHead, Table, TableBody, Tooltip, TableCell, TablePagination, TableRow, TableFooter, IconButton,
  TableContainer, Box, Paper, CircularProgress, Chip,
} from '@mui/material';
import { IconEdit, IconKey, IconUserOff, IconUserCheck } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { formatWaktu } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import { labelAlasan } from 'src/apps/pegawai-status/status';
import { UKURAN_HALAMAN, metaStatusGuruMandiri } from '../guruMandiri';

const KOLOM = 7;

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

// Server-side paging: `total` dari server, `page` berbasis 0, baris tidak diiris di klien.
const GuruMandiriTable = ({
  data, total, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage,
  handleEdit, handleResetSandi, handleNonaktifkan, handleAktifkan, isLoading, isError, errorMessage,
}) => (
  <Paper variant="outlined">
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <Judul align="left">No</Judul>
            <Judul>Guru</Judul>
            <Judul>Sekolah</Judul>
            <Judul>Status</Judul>
            <Judul>Kelas</Judul>
            <Judul>Dibuat</Judul>
            <Judul>Aksi</Judul>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <PesanTengah><CircularProgress /></PesanTengah>
          ) : isError ? (
            <PesanTengah><Typography color="error" variant="h6">{errorMessage}</Typography></PesanTengah>
          ) : data.length === 0 ? (
            <PesanTengah><Typography variant="h6">Tidak ada guru mandiri ditemukan</Typography></PesanTengah>
          ) : (
            data.map((item, index) => {
              const status = metaStatusGuruMandiri(item);
              const nonaktif = item.status === 'nonaktif';
              return (
                <TableRow key={item.pegawai_id}>
                  <TableCell><Typography sx={{ fontSize: '1rem' }}>{page * rowsPerPage + index + 1}</Typography></TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{item.nama || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.email || '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{item.nama_sekolah || '-'}</Typography>
                    {item.bentuk_pendidikan_kode && (
                      <Typography variant="caption" color="text.secondary">{item.bentuk_pendidikan_kode}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={status.label}
                      size="medium"
                      sx={{ borderRadius: '8px', backgroundColor: status.bg, color: status.color, fontWeight: 600 }}
                    />
                    {nonaktif && item.alasan_kode && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {labelAlasan(item.alasan_kode)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center"><Typography sx={{ fontSize: '1rem' }}>{item.jumlah_kelas ?? 0}</Typography></TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{formatWaktu(item.dibuat_pada, item.timezone_sekolah)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Tooltip title="Ubah data" placement="bottom">
                        <IconButton onClick={() => handleEdit(item)} aria-label={`Ubah data ${item.nama}`}>
                          <IconEdit width={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={nonaktif ? 'Aktifkan guru dahulu untuk mereset sandi' : 'Reset sandi'} placement="bottom">
                        <span>
                          <IconButton onClick={() => handleResetSandi(item)} disabled={nonaktif} aria-label={`Reset sandi ${item.nama}`}>
                            <IconKey width={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={nonaktif ? 'Aktifkan' : 'Nonaktifkan'} placement="bottom">
                        <IconButton
                          onClick={() => (nonaktif ? handleAktifkan(item) : handleNonaktifkan(item))}
                          aria-label={`${nonaktif ? 'Aktifkan' : 'Nonaktifkan'} ${item.nama}`}
                        >
                          {nonaktif ? <IconUserCheck width={18} /> : <IconUserOff width={18} />}
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
              rowsPerPageOptions={UKURAN_HALAMAN}
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

GuruMandiriTable.propTypes = {
  data: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleResetSandi: PropTypes.func.isRequired,
  handleNonaktifkan: PropTypes.func.isRequired,
  handleAktifkan: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default memo(GuruMandiriTable);
