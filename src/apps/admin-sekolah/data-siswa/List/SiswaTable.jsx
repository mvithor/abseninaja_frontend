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
import { IconEdit } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const SiswaTable = ({
  siswa,
  page,
  rowsPerPage,
  totalCount,                 
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  isLoading,
  isError,
  errorMessage
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
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>NIS</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (siswa?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">Tidak ada data siswa</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              siswa.map((dataSiswa, index) => (
                <TableRow key={dataSiswa.id || index}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{dataSiswa?.User?.name || '-'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{dataSiswa?.nis || '-'}</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography sx={{ fontSize: '1rem' }}>{dataSiswa?.Kelas?.nama_kelas || 'Tidak ditemukan'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Tooltip title="Edit" placement="bottom">
                        <IconButton onClick={() => handleEdit(dataSiswa.id)}>
                          <IconEdit width={18} />
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
                colSpan={5}
                count={totalCount}                 // ← total dari server
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

SiswaTable.propTypes = {
  siswa: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired, 
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default SiswaTable;
