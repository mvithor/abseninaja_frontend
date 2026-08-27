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
import { IconEdit } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const FiturTambahanSekolahTable = ({
  sekolahList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Sekolah</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>NPSN</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Bentuk Pendidikan</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Alamat</Typography>
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
            ) : (sekolahList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">
                      Tidak ada sekolah yang tersedia
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              sekolahList.map((row, index) => {
                const bentuk = row.bentuk_pendidikan;
                const canManageFitur = Boolean(bentuk);

                return (
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
                        {row.npsn || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {bentuk ? (
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {bentuk.kode}&nbsp;
                            <Typography component="span" variant="caption" color="text.secondary">
                              ({bentuk.nama})
                            </Typography>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bentuk.jenjang}{bentuk.naungan ? ` • ${bentuk.naungan}` : ''}
                          </Typography>
                        </Box>
                      ) : (
                        <Tooltip title="Bentuk pendidikan sekolah ini belum diatur">
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Belum diatur
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {row.alamat || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Tooltip
                          title={canManageFitur ? 'Kelola Fitur' : 'Lengkapi bentuk pendidikan sekolah ini terlebih dahulu'}
                          placement="bottom"
                        >
                          <span>
                            <IconButton
                              onClick={() => canManageFitur && handleEdit(row)}
                              disabled={!canManageFitur}
                            >
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
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

FiturTambahanSekolahTable.propTypes = {
  sekolahList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default FiturTambahanSekolahTable;