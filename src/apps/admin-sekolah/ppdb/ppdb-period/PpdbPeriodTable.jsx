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

const upper = (v) => String(v || '').trim().toUpperCase();

const getStatusChipProps = (status) => {
  const s = upper(status);
  if (s === 'OPEN') return { label: 'OPEN', color: 'success' };
  if (s === 'DRAFT') return { label: 'DRAFT', color: 'default' };
  if (s === 'CLOSED') return { label: 'CLOSED', color: 'warning' };
  if (s === 'ARCHIVED') return { label: 'ARCHIVED', color: 'secondary' };
  return { label: s || '-', color: 'default' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const canEditPeriod = (status) => {
  const s = upper(status);
  return s === 'DRAFT' || s === 'OPEN';
};

const canDeletePeriod = (status) => {
  const s = upper(status);
  return s === 'DRAFT';
};

const getEditTooltip = (status) => {
  const s = upper(status);
  if (s === 'DRAFT') return 'Edit';
  if (s === 'OPEN') return 'Perpanjang (close_at)';
  if (s === 'CLOSED') return 'Tidak bisa edit (CLOSED)';
  if (s === 'ARCHIVED') return 'Tidak bisa edit (ARCHIVED)';
  return 'Edit';
};

const getDeleteTooltip = (status) => {
  const s = upper(status);
  if (s === 'DRAFT') return 'Hapus';
  return 'Hanya bisa hapus saat DRAFT';
};

const PpdbPeriodTable = ({
  periods,
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
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Periode</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tahun Ajaran Target</Typography>
              </TableCell>
              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Buka</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tutup</Typography>
              </TableCell>
              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (periods?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada Periode PMB</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              periods.map((p, index) => {
                const statusProps = getStatusChipProps(p?.status);
                const status = upper(p?.status);

                const allowEdit = canEditPeriod(status);
                const allowDelete = canDeletePeriod(status);

                return (
                  <TableRow key={p?.id || index}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {p?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {p?.TahunAjaranTarget?.tahun_ajaran || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...statusProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTime(p?.open_at)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTime(p?.close_at)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Detail" placement="bottom">
                          <IconButton onClick={() => handleDetail(p?.id)}>
                            <IconEye width={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={getEditTooltip(status)} placement="bottom">
                          <span>
                            <IconButton
                              onClick={() => handleEdit(p?.id)}
                              disabled={!allowEdit}
                            >
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={getDeleteTooltip(status)} placement="bottom">
                          <span>
                            <IconButton
                              onClick={() => handleDelete(p?.id)}
                              disabled={!allowDelete}
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

PpdbPeriodTable.propTypes = {
  periods: PropTypes.array.isRequired,
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

export default PpdbPeriodTable;