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


const getActiveChip = (val) => {
  if (val === true) return { label: 'AKTIF', color: 'success' };
  if (val === false) return { label: 'NONAKTIF', color: 'default' };
  return { label: '-', color: 'default' };
};

const getPeriodStatusChip = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'OPEN') return { label: 'OPEN', color: 'success' };
  if (s === 'DRAFT') return { label: 'DRAFT', color: 'default' };
  if (s === 'CLOSED') return { label: 'CLOSED', color: 'warning' };
  if (s === 'ARCHIVED') return { label: 'ARCHIVED', color: 'default' };
  return { label: s || '-', color: 'default' };
};

const getTypeChip = (type) => {
  const t = String(type || '').toUpperCase();
  if (t === 'CBT') return { label: 'CBT', color: 'info' };
  if (t === 'INTERVIEW') return { label: 'INTERVIEW', color: 'secondary' };
  if (t === 'PRACTICE') return { label: 'PRACTICE', color: 'warning' };
  if (t === 'MANUAL') return { label: 'MANUAL', color: 'default' };
  return { label: t || '-', color: 'default' };
};

const PpdbTestComponentsTable = ({
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
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Periode</Typography>
              </TableCell>

              <TableCell align="center" >
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Code</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Komponen</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tipe</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Durasi</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Rentang Nilai</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aktif</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (rows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada Komponen Tes PMB</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, index) => {
                const hasId = Boolean(r?.id);

                const periodStatus = String(r?.PpdbPeriod?.status || '').toUpperCase();
                const isDraft = periodStatus === 'DRAFT'; 
                const canEdit = hasId && periodStatus !== 'ARCHIVED';
                const canDelete = hasId && isDraft;

                const periodChip = getPeriodStatusChip(r?.PpdbPeriod?.status);
                const typeChip = getTypeChip(r?.type);
                const activeChip = getActiveChip(r?.is_active);

                const durationText =
                  r?.duration_minutes === null || r?.duration_minutes === undefined
                    ? '-'
                    : `${String(r.duration_minutes)} mnt`;

                const scoreText =
                  r?.score_min === null || r?.score_min === undefined || r?.score_max === null || r?.score_max === undefined
                    ? '-'
                    : `${String(r.score_min)} - ${String(r.score_max)}`;

                return (
                  <TableRow key={String(r?.id || index)}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.PpdbPeriod?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...periodChip} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.code || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.nama || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...typeChip} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{durationText}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{scoreText}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...activeChip} />
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
                colSpan={10}
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

PpdbTestComponentsTable.propTypes = {
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
  errorMessage: PropTypes.string
};

export default PpdbTestComponentsTable;