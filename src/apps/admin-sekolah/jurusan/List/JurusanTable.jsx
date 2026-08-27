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
import { IconEdit, IconUserPlus } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const JurusanTable = ({
  jurusanList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleKelolaKajur,
  isLoading,
  isError,
  errorMessage,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

  return (
    <Paper variant='outlined'>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Jurusan</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kode Lokal</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kepala Jurusan</Typography>
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
            ) : (jurusanList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">
                      Belum ada jurusan
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              jurusanList.map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem' }}>
                      {baseIndex + index + 1}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {row.nama || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>
                      {row.kode_lokal || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={row.is_aktif ? 'Aktif' : 'Nonaktif'}
                      color={row.is_aktif ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    {row.kepala_jurusan ? (
                      <Typography sx={{ fontSize: '1rem' }}>{row.kepala_jurusan.nama}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Belum ditetapkan
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Tooltip title="Edit Jurusan" placement="bottom">
                        <IconButton onClick={() => handleEdit(row.id)}>
                          <IconEdit width={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kelola Kepala Jurusan" placement="bottom">
                        <IconButton onClick={() => handleKelolaKajur(row.id)}>
                          <IconUserPlus width={18} />
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
                rowsPerPageOptions={[5, 10, 20, 25, { label: 'All', value: -1 }]}
                colSpan={6}
                count={totalCount}
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

JurusanTable.propTypes = {
  jurusanList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleKelolaKajur: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default JurusanTable;