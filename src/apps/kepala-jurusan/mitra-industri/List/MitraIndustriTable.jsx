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
import { IconEdit } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const MitraIndustriTable = ({
  mitraIndustriList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Industri</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kontak</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kapasitas/Periode</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Unit SKKNI</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (mitraIndustriList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', textAlign: 'center' }}>
                    <Typography variant="h6">{emptyMessage || 'Belum ada mitra industri yang terdaftar'}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              mitraIndustriList.map((industri, index) => {
                const unitList = industri.UnitKompetensi || [];
                const unitTooltip = unitList.length > 0
                  ? unitList.map((u) => u.kode_unit).join(', ')
                  : 'Belum ada unit SKKNI terkait';

                return (
                  <TableRow key={industri.id || index}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{industri.nama_industri || '-'}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{industri.nama_kontak || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {industri.telepon_kontak || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontSize: '1rem' }}>{industri.kapasitas_per_periode ?? '-'}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Tooltip title={unitTooltip} placement="bottom">
                        <Chip
                          label={`${unitList.length} unit`}
                          color={unitList.length > 0 ? 'primary' : 'default'}
                          size="small"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip
                        label={industri.status_aktif ? 'Aktif' : 'Nonaktif'}
                        color={industri.status_aktif ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Tooltip title="Edit" placement="bottom">
                          <IconButton onClick={() => handleEdit(industri.id)}>
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
                rowsPerPageOptions={[5, 10, 20, 25, { label: 'All', value: -1 }]}
                colSpan={7}
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

MitraIndustriTable.propTypes = {
  mitraIndustriList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default MitraIndustriTable;