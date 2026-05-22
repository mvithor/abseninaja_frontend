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
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const getOpenChipProps = (isOpen) => {
  if (isOpen === true) return { label: 'OPEN', color: 'success' };
  if (isOpen === false) return { label: 'CLOSED', color: 'warning' };
  return { label: '-', color: 'default' };
};

const getWaveStatusChipProps = (status) => {
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

const PpdbWaveTracksTable = ({
  rows,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jalur</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Periode</Typography>
              </TableCell>

              <TableCell align="center" width={110}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Gel.</Typography>
              </TableCell>

              <TableCell align="center" width={110}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Jalur</Typography>
              </TableCell>

              <TableCell align="center" width={110}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kuota</Typography>
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
                <TableCell colSpan={11}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (rows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada Jalur per Gelombang PMB</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, index) => {
                const hasId = Boolean(r?.id);

                const periodStatus = String(r?.Wave?.PpdbPeriod?.status || '').toUpperCase();
                const waveStatus = String(r?.Wave?.status || '').toUpperCase();

                const isDraft = periodStatus === 'DRAFT'; 
                const canEdit = hasId && periodStatus !== 'ARCHIVED';
                const canDelete = hasId && isDraft;

                const waveStatusProps = getWaveStatusChipProps(waveStatus);
                const trackActive = r?.Track?.is_active;
                const trackChip = trackActive === true
                  ? { label: 'AKTIF', color: 'success' }
                  : trackActive === false
                    ? { label: 'NONAKTIF', color: 'default' }
                    : { label: '-', color: 'default' };

                const openProps = getOpenChipProps(r?.is_open);

                return (
                  <TableRow key={String(r?.id)}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.Wave?.nama || '-'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        {r?.Wave?.quota_global === null || r?.Wave?.quota_global === undefined
                          ? 'Kuota global: -'
                          : `Kuota global: ${String(r.Wave.quota_global)}`}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.Track?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {r?.Wave?.PpdbPeriod?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...waveStatusProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...trackChip} />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...openProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {r?.quota === null || r?.quota === undefined ? '-' : String(r.quota)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTime(r?.open_at)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTime(r?.close_at)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title={canEdit ? 'Edit' : 'Tidak bisa edit saat ARCHIVED'} placement="bottom">
                          <span>
                            <IconButton onClick={() => handleEdit(r?.id)} disabled={!canEdit}>
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={canDelete ? 'Hapus' : 'Hapus hanya saat Period DRAFT'} placement="bottom">
                          <span>
                            <IconButton onClick={() => handleDelete(r?.id)} disabled={!canDelete}>
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
                colSpan={11}
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

PpdbWaveTracksTable.propTypes = {
  rows: PropTypes.array.isRequired,
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

export default PpdbWaveTracksTable;
