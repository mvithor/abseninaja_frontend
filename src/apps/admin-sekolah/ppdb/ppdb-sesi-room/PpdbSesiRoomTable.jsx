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

const getModeChipProps = (mode) => {
  const m = String(mode || '').toUpperCase();
  if (m === 'OFFLINE') return { label: 'OFFLINE', color: 'primary' };
  if (m === 'ONLINE') return { label: 'ONLINE', color: 'success' };
  return { label: m || '-', color: 'default' };
};

const getSessionStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'OPEN') return { label: 'OPEN', color: 'success' };
  if (s === 'DRAFT') return { label: 'DRAFT', color: 'default' };
  if (s === 'CLOSED') return { label: 'CLOSED', color: 'warning' };
  if (s === 'ARCHIVED') return { label: 'ARCHIVED', color: 'error' };
  return { label: s || '-', color: 'default' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const getEffectiveCapacity = (row) => {
  const override = row?.capacity_override;
  if (override !== null && override !== undefined) return Number(override);

  const roomCap = row?.Room?.capacity;
  if (roomCap !== null && roomCap !== undefined) return Number(roomCap);

  return null;
};

const PpdbSesiRoomsTable = ({
  rows,
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

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Sesi Tes</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mode</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Ruangan</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Lokasi</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kapasitas Efektif</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mulai</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Selesai</Typography>
              </TableCell>

              <TableCell align="center" width={140}>
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
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada sesi ruangan tes PMB</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, index) => {
                const hasId = Boolean(r?.id);

                const sessionStatus = String(r?.Session?.status || '').toUpperCase();
                const isArchived = sessionStatus === 'ARCHIVED';

                const canEdit = hasId && !isArchived;
                const canDelete = hasId && !isArchived;

                const modeUpper = String(r?.mode || '').toUpperCase();
                const modeChip = getModeChipProps(r?.mode);
                const statusChip = getSessionStatusChipProps(sessionStatus);

                const effCap = getEffectiveCapacity(r);

                const roomTitle = String(r?.Room?.nama || '').trim();
                const roomCode = String(r?.Room?.code || '').trim();
                const roomLokasi = String(r?.Room?.lokasi || '').trim();
                const roomIsActive = r?.Room?.is_active;

                const onlineLabel = String(r?.room_label || '').trim();
                const onlineUrl = String(r?.online_url || '').trim();

                const roomDisplay =
                  modeUpper === 'ONLINE'
                    ? (onlineLabel || '-')
                    : (roomTitle || '-');

                const roomSub =
                  modeUpper === 'ONLINE'
                    ? (onlineUrl ? `URL: ${onlineUrl}` : 'URL: -')
                    : (roomCode ? `Kode: ${roomCode}` : '-');

                const lokasiDisplay =
                  modeUpper === 'ONLINE'
                    ? '-'
                    : (roomLokasi || '-');

                const showNonaktifChip =
                  modeUpper === 'OFFLINE' && roomIsActive === false;

                return (
                  <TableRow key={String(r?.id)}>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.Session?.title || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...statusChip} />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...modeChip} />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                          {roomDisplay}
                        </Typography>

                        {showNonaktifChip && (
                          <Chip
                            size="small"
                            label="NONAKTIF"
                            color="warning"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>

                      <Typography sx={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        {roomSub}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {lokasiDisplay}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>
                        {effCap === null || effCap === undefined ? '-' : String(effCap)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        {r?.capacity_override !== null && r?.capacity_override !== undefined
                          ? 'Override'
                          : (r?.Room?.capacity !== null && r?.Room?.capacity !== undefined ? 'Master Room' : '-')}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTime(r?.Session?.start_at)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatDateTime(r?.Session?.end_at)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Detail" placement="bottom">
                          <span>
                            <IconButton onClick={() => handleDetail(r?.id)} disabled={!hasId}>
                              <IconEye width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={canEdit ? 'Edit' : 'Tidak bisa edit saat ARCHIVED'} placement="bottom">
                          <span>
                            <IconButton onClick={() => handleEdit(r?.id)} disabled={!canEdit}>
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={canDelete ? 'Hapus' : 'Tidak bisa hapus saat ARCHIVED'} placement="bottom">
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

PpdbSesiRoomsTable.propTypes = {
  rows: PropTypes.array.isRequired,
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
  errorMessage: PropTypes.string
};

export default PpdbSesiRoomsTable;