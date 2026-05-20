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
  if (s === 'ARCHIVED') return { label: 'ARCHIVED', color: 'secondary' };
  return { label: s || '-', color: 'default' };
};

const getActiveChipProps = (isActive) => {
  if (isActive === true) return { label: 'AKTIF', color: 'success' };
  if (isActive === false) return { label: 'NONAKTIF', color: 'default' };
  return { label: '-', color: 'default' };
};

const PpdbTrackTable = ({
  tracks,
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
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kode</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jalur</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Periode</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Periode</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aktif</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Urutan</Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (tracks?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada Jalur Pendaftaran PMB</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              tracks.map((t, index) => {
                const hasId = Boolean(t?.id);

                const periodStatusUpper = String(t?.PpdbPeriod?.status || '').toUpperCase();
                const periodStatusProps = getStatusChipProps(periodStatusUpper);
                const isDraftPeriod = periodStatusUpper === 'DRAFT';
                const canEdit = hasId && isDraftPeriod;
                const canDelete = hasId && isDraftPeriod;
                const activeProps = getActiveChipProps(t?.is_active);

                return (
                  <TableRow key={t?.id || index}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" label={String(t?.kode || '-')} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {t?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {t?.PpdbPeriod?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...periodStatusProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...activeProps} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {t?.sort_order === null || t?.sort_order === undefined ? '-' : String(t.sort_order)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title={canEdit ? 'Edit' : 'Edit hanya saat Period DRAFT'} placement="bottom">
                          <span>
                            <IconButton
                              onClick={() => handleEdit(t?.id)}
                              disabled={!canEdit}
                            >
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={canDelete ? 'Hapus' : 'Hapus hanya saat Period DRAFT'} placement="bottom">
                          <span>
                            <IconButton
                              onClick={() => handleDelete(t?.id)}
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
                colSpan={9}
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

PpdbTrackTable.propTypes = {
  tracks: PropTypes.array.isRequired,
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

export default PpdbTrackTable;
