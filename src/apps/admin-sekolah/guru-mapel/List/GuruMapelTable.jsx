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

const GuruMapelTable = ({
  guruMapel = [],
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kode Mapel</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mata Pelajaran</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kelas</Typography>
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
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (guruMapel?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">Tidak ada data guru mata pelajaran tersedia</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              guruMapel.map((row, idx) => (
                <TableRow key={row.id || idx}>
                  <TableCell>
                    <Typography sx={{ fontSize: '1rem' }}>{baseIndex + idx + 1}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{row?.nama_guru || '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{row?.kode_offering || '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{row?.nama_mapel || '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: '1rem' }}>{row?.nama_kelas || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Tooltip title="Edit" placement="bottom">
                        <IconButton onClick={() => handleEdit(row.id)}>
                          <IconEdit width={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus" placement="bottom">
                        <IconButton onClick={() => handleDelete(row.id)}>
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

GuruMapelTable.propTypes = {
  guruMapel: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default GuruMapelTable;
