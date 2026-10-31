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
  CircularProgress,
  Chip,
} from '@mui/material';
import { IconEdit, IconUserOff, IconUserCheck } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { metaStatusKantin } from 'src/apps/admin-sekolah/admin-kantin/kantin';
import { formatWaktu } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';

const KOLOM = 6;

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

const AdminKantinTable = ({
  adminKantin,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleStatus,
  timeZone,
  isLoading,
  isError,
  errorMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  const baris = rowsPerPage > 0 ? adminKantin.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : adminKantin;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Email</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Dibuat</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <PesanTengah>
                <CircularProgress />
              </PesanTengah>
            ) : isError ? (
              <PesanTengah>
                <Typography color="error" variant="h6">{errorMessage}</Typography>
              </PesanTengah>
            ) : adminKantin.length === 0 ? (
              <PesanTengah>
                <Typography variant="h6">Tidak ada admin kantin ditemukan</Typography>
              </PesanTengah>
            ) : (
              baris.map((item, index) => {
                const status = metaStatusKantin(item.is_aktif);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.nama || '-'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{item.email || '-'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={status.label}
                        size="medium"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: status.bg,
                          color: status.color,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatWaktu(item.dibuat_pada, timeZone)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Tooltip title="Edit" placement="bottom">
                          <IconButton onClick={() => handleEdit(item.id)} aria-label="Edit admin kantin">
                            <IconEdit width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={item.is_aktif ? 'Nonaktifkan' : 'Aktifkan'} placement="bottom">
                          <IconButton
                            onClick={() => handleStatus(item)}
                            aria-label={item.is_aktif ? 'Nonaktifkan admin kantin' : 'Aktifkan admin kantin'}
                          >
                            {item.is_aktif ? <IconUserOff width={18} /> : <IconUserCheck width={18} />}
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
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={KOLOM}
                count={adminKantin.length}
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

AdminKantinTable.propTypes = {
  adminKantin: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleStatus: PropTypes.func.isRequired,
  timeZone: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default AdminKantinTable;
