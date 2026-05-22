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
import { IconEdit, IconTrash, IconBell } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const UserGuruTable = ({
  userGuru,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  handleOpenPrefs,
  isLoading,
  isError,
  errorMessage
}) => {
  const safeData = Array.isArray(userGuru) ? userGuru : [];

  const paged = rowsPerPage > 0
    ? safeData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : safeData;

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
                <TableCell colSpan={5}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100 }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : safeData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100, textAlign:'center' }}>
                    <Typography variant="h6">Tidak ada pengguna guru ditemukan</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, index) => {
                const user = row?.AkunPegawai || {};
                const userId = user?.id;

                return (
                  <TableRow key={userId ?? `${index}-${user?.email ?? 'row'}`}>
                    <TableCell>
                      <Typography sx={{ fontSize:'1rem' }}>
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize:'1rem' }}>
                        {user?.name || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize:'1rem' }}>
                        {user?.email || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize:'1rem' }}>
                        {user?.updated_at || 'Tidak Ada'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', gap:1 }}>
                        <Tooltip title="Notifikasi" placement="bottom">
                          <IconButton
                            disabled={!userId}
                            onClick={() => handleOpenPrefs?.(userId, user?.name)}
                          >
                            <IconBell width={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit" placement="bottom">
                          <IconButton
                            disabled={!userId}
                            onClick={() => handleEdit(userId)}
                          >
                            <IconEdit width={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Hapus" placement="bottom">
                          <IconButton
                            disabled={!userId}
                            onClick={() => handleDelete(userId)}
                          >
                            <IconTrash width={18} />
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
                colSpan={5}
                count={safeData.length}
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

UserGuruTable.propTypes = {
  userGuru: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleOpenPrefs: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default UserGuruTable;
