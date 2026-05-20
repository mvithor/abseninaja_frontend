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


const safeText = (val) => {
  const s = String(val ?? '').trim();
  return s.length > 0 ? s : null;
};

const formatDateTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatNumber = (v) => {
  if (v === null || v === undefined || v === '') return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return String(n);
};

const getPeriodStatusChip = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'OPEN') return { label: 'OPEN', color: 'success' };
  if (s === 'DRAFT') return { label: 'DRAFT', color: 'default' };
  if (s === 'CLOSED') return { label: 'CLOSED', color: 'warning' };
  if (s === 'ARCHIVED') return { label: 'ARCHIVED', color: 'default' };
  return { label: s || '-', color: 'default' };
};

const getSessionStatusChip = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'DRAFT') return { label: 'DRAFT', color: 'default' };
  if (s === 'PUBLISHED') return { label: 'PUBLISHED', color: 'success' };
  if (s === 'ONGOING') return { label: 'ONGOING', color: 'info' };
  if (s === 'FINISHED') return { label: 'FINISHED', color: 'secondary' };
  if (s === 'CANCELLED') return { label: 'CANCELLED', color: 'warning' };
  return { label: s || '-', color: 'default' };
};

const getModeChip = (mode) => {
  const m = String(mode || '').toUpperCase();
  if (m === 'OFFLINE') return { label: 'OFFLINE', color: 'default' };
  if (m === 'ONLINE') return { label: 'ONLINE', color: 'info' };
  if (m === 'HYBRID') return { label: 'HYBRID', color: 'secondary' };
  return { label: m || '-', color: 'default' };
};


const toScopeLabel = (r) => {
  const apiLabel = safeText(r?.scope_label);
  if (apiLabel) return apiLabel;

  const waveName = safeText(r?.WaveTrack?.Wave?.nama);
  const trackName = safeText(r?.WaveTrack?.Track?.nama);
  const trackCode = safeText(r?.WaveTrack?.Track?.kode);

  if (!waveName && !trackName) return 'Semua Gelombang & Semua Jalur';
  if (waveName && !trackName) return `Gelombang: ${waveName}`;
  if (!waveName && trackName) return `Jalur: ${trackName}${trackCode ? ` (${trackCode})` : ''}`;

  return `${waveName} • ${trackName}${trackCode ? ` (${trackCode})` : ''}`;
};

const toScopeTooltip = (r) => {
  const apiTooltip = safeText(r?.scope_tooltip);
  if (apiTooltip) return apiTooltip;

  const scopeType = safeText(r?.scope_type) || (safeText(r?.ppdb_wave_track_id) ? 'WAVETRACK' : 'GLOBAL');
  const wtId = safeText(r?.ppdb_wave_track_id);

  if (scopeType === 'GLOBAL') {
    return 'Scope global: berlaku untuk semua gelombang & semua jalur pada period ini';
  }

  return wtId ? `Scope mapping Gelombang dan Jalur: ${wtId}` : 'Scope mapping Gelombang dan Jalur';
};

const getScopeChipProps = (r) => {
  const scopeType = safeText(r?.scope_type) || (safeText(r?.ppdb_wave_track_id) ? 'WAVETRACK' : 'GLOBAL');
  if (scopeType === 'GLOBAL') return { color: 'default', variant: 'outlined' };
  return { color: 'info', variant: 'outlined' };
};


const PpdbSesiJadwalTable = ({
  rows,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleView,
  handleEdit,
  handleDelete,
  isLoading,
  isError,
  errorMessage
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  const COL_COUNT = 13;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table aria-label="custom pagination table" sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Periode</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Period</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Gelombang & Jalur</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Komponen</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mode</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Judul</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Waktu</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Check-in</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Terlambat</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Sesi</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kapasitas</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={COL_COUNT}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={COL_COUNT}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (rows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={COL_COUNT}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Typography variant="h6">Belum ada Sesi / Jadwal Tes PMB</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, index) => {
                const hasId = Boolean(r?.id);

                const sessionStatus = String(r?.status || '').toUpperCase();
                const canEdit = hasId && sessionStatus === 'DRAFT';
                const canDelete = hasId && sessionStatus === 'DRAFT';

                const periodChip = getPeriodStatusChip(r?.PpdbPeriod?.status);
                const modeChip = getModeChip(r?.mode);
                const sessionChip = getSessionStatusChip(r?.status);

                const scopeLabel = toScopeLabel(r);
                const scopeTooltip = toScopeTooltip(r);
                const scopeChipProps = getScopeChipProps(r);

                const componentName = r?.Component?.nama || '-';
                const waktu = `${formatDateTime(r?.start_at)} - ${formatDateTime(r?.end_at)}`;
                const capacity = formatNumber(r?.capacity);
                const isOnlineish =
                  String(r?.mode || '').toUpperCase() === 'ONLINE' ||
                  String(r?.mode || '').toUpperCase() === 'HYBRID';

                const onlineUrl = safeText(r?.online_url);
                const checkinOpen = formatDateTime(r?.checkin_open_at);
                const checkinClose = formatDateTime(r?.checkin_close_at);
                const lateAfter = formatDateTime(r?.late_after_at);

                const hasCheckinRange = safeText(r?.checkin_open_at) || safeText(r?.checkin_close_at);
                const checkinRangeText = hasCheckinRange ? `${checkinOpen} - ${checkinClose}` : '-';
                const lateText = safeText(r?.late_after_at) ? lateAfter : '-';

                const viewTooltip = 'Detail';
                const editTooltip = canEdit ? 'Edit (hanya DRAFT)' : 'Tidak bisa edit selain DRAFT';
                const deleteTooltip = canDelete ? 'Hapus (hanya DRAFT)' : 'Tidak bisa hapus selain DRAFT';

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
                      <Tooltip title={scopeTooltip} placement="top">
                        <Chip
                          size="small"
                          label={scopeLabel}
                          {...scopeChipProps}
                          sx={{ maxWidth: 260 }}
                        />
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {componentName}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...modeChip} />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.title || '-'}
                      </Typography>

                      {isOnlineish ? (
                        <Typography sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
                          {onlineUrl ? onlineUrl : '-'}
                        </Typography>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {waktu}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {checkinRangeText}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {lateText}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...sessionChip} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{capacity}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title={viewTooltip} placement="bottom">
                          <span>
                            <IconButton onClick={() => handleView(r?.id)} disabled={!hasId}>
                              <IconEye width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={editTooltip} placement="bottom">
                          <span>
                            <IconButton onClick={() => handleEdit(r?.id)} disabled={!canEdit}>
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={deleteTooltip} placement="bottom">
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
                colSpan={COL_COUNT}
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

PpdbSesiJadwalTable.propTypes = {
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleView: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default PpdbSesiJadwalTable;