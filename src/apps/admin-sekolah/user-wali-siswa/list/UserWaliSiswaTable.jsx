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
} from '@mui/material';
import { IconEdit, IconBell } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const UserWaliSiswaTable = ({
  userWaliSiswa = [],
  page,
  rowsPerPage,
  totalCount,           
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleOpenPrefs,
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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Wali</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Siswa</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Email</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Diperbarui</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (userWaliSiswa?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">Tidak ada pengguna wali siswa ditemukan</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              userWaliSiswa.map((row, idx) => {
                const no = rowsPerPage === -1 ? idx + 1 : page * rowsPerPage + idx + 1;
                const anakList = Array.isArray(row.anak) ? row.anak : (row.anak ? [row.anak] : []);
                return (
                  <TableRow key={row.user_id ?? row.id ?? `${idx}-${row.email ?? ''}`}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{no}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{row.name || '-'}</Typography>
                    </TableCell>

                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {anakList.length > 0 ? anakList.join(', ') : '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{row.email || '-'}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{row.updated_at || 'Tidak Ada'}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Preferensi Notifikasi" placement="bottom">
                          <IconButton onClick={() => handleOpenPrefs?.(row.user_id, row.name)}>
                            <IconBell width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit" placement="bottom">
                          <IconButton onClick={() => handleEdit?.(row.user_id)}>
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
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={6}
                count={totalCount ?? 0}
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

UserWaliSiswaTable.propTypes = {
  userWaliSiswa: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleOpenPrefs: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default UserWaliSiswaTable;
