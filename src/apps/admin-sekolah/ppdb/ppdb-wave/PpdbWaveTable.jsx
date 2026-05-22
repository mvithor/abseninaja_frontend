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
  Chip
} from '@mui/material';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const getStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'OPEN') return { label: 'OPEN', color: 'success' };
  if (s === 'DRAFT') return { label: 'DRAFT', color: 'default' };
  if (s === 'CLOSED') return { label: 'CLOSED', color: 'warning' };
  return { label: s || '-', color: 'default' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const PpdbWaveTable = ({
  waves,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  handleDetail,
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
              <TableCell width={70}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Gelombang</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Periode</Typography>
              </TableCell>

              <TableCell align="center" width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Buka</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tutup</Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kuota Global</Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (waves?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada Gelombang PMB</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              waves.map((w, index) => {
                const statusUpper = String(w?.status || '').toUpperCase();
                const statusProps = getStatusChipProps(statusUpper);

                const hasId = Boolean(w?.id);
                const isDraft = statusUpper === 'DRAFT';
                const canEdit = hasId && isDraft;
                const canDelete = hasId && isDraft;

                return (
                  <TableRow key={w?.id || index}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {w?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {w?.PpdbPeriod?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...statusProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTime(w?.open_at)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTime(w?.close_at)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {w?.quota_global === null || w?.quota_global === undefined ? '-' : String(w.quota_global)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Detail" placement="bottom">
                          <span>
                            <IconButton onClick={() => handleDetail(w?.id)} disabled={!hasId}>
                              <IconEye width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={canEdit ? 'Edit' : 'Edit hanya saat status DRAFT'} placement="bottom">
                          <span>
                            <IconButton
                              onClick={() => handleEdit(w?.id)}
                              disabled={!canEdit}
                            >
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={canDelete ? 'Hapus' : 'Hapus hanya saat status DRAFT'} placement="bottom">
                          <span>
                            <IconButton
                              onClick={() => handleDelete(w?.id)}
                              disabled={!canDelete}
                            >
                              <IconTrash width={18} />
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
                colSpan={8}
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

PpdbWaveTable.propTypes = {
  waves: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export default PpdbWaveTable;
