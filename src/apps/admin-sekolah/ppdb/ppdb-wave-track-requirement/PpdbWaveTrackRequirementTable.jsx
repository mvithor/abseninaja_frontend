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

const getBoolChip = (val, opts = {}) => {
  const {
    trueLabel = 'YA',
    falseLabel = 'TIDAK',
    nullLabel = '-',
    trueColor = 'success',
    falseColor = 'default',
    nullColor = 'default'
  } = opts;

  if (val === true) return { label: trueLabel, color: trueColor };
  if (val === false) return { label: falseLabel, color: falseColor };
  return { label: nullLabel, color: nullColor };
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

const formatNumber = (v) => {
  if (v === null || v === undefined || v === '') return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return String(n);
};


const safeText = (val) => {
  const s = String(val ?? '').trim();
  return s.length > 0 ? s : null;
};

const toScopeLabel = (r) => {
  const apiLabel = safeText(r?.scope_label);
  if (apiLabel) return apiLabel;

  const waveName =
    safeText(r?.WaveTrack?.Wave?.nama) ||
    safeText(r?.WaveTrack?.wave_nama) ||
    safeText(r?.Wave?.nama) ||
    safeText(r?.wave_nama);

  const trackName =
    safeText(r?.WaveTrack?.Track?.nama) ||
    safeText(r?.WaveTrack?.track_nama) ||
    safeText(r?.Track?.nama) ||
    safeText(r?.track_nama);

  const trackCode =
    safeText(r?.WaveTrack?.Track?.kode) ||
    safeText(r?.WaveTrack?.track_kode) ||
    safeText(r?.Track?.kode) ||
    safeText(r?.track_kode);

  if (!waveName && !trackName) return 'Semua Gelombang & Semua Jalur';
  if (waveName && !trackName) return `Gelombang: ${waveName}`;
  if (!waveName && trackName) return `Jalur: ${trackName}${trackCode ? ` (${trackCode})` : ''}`;

  return `${waveName} • ${trackName}${trackCode ? ` (${trackCode})` : ''}`;
};

const toScopeTooltip = (r) => {
  const scopeType = safeText(r?.scope_type) || (safeText(r?.ppdb_wave_track_id) ? 'WAVETRACK' : 'GLOBAL');
  const wtId = safeText(r?.ppdb_wave_track_id);

  if (scopeType === 'GLOBAL') {
    return 'Scope global: berlaku untuk semua gelombang & semua jalur pada period ini';
  }

  return wtId ? `Scope mapping (WaveTrack): ${wtId}` : 'Scope mapping (WaveTrack)';
};

const getScopeChipProps = (r) => {
  const scopeType = safeText(r?.scope_type) || (safeText(r?.ppdb_wave_track_id) ? 'WAVETRACK' : 'GLOBAL');
  if (scopeType === 'GLOBAL') return { color: 'default', variant: 'outlined' };
  return { color: 'info', variant: 'outlined' };
};


const PpdbWaveTrackTestRequirementsTable = ({
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

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Periode</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Gelombang dan Jalur</Typography>
              </TableCell>

              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Komponen</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tipe</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Required</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Eliminasi</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Min Score</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Bobot</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Urutan</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={12}>
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
                    <Typography variant="h6">Belum Ada Persyaratan Tes PMB</Typography>
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
                const typeChip = getTypeChip(r?.Component?.type);
                const requiredChip = getBoolChip(r?.is_required, { trueLabel: 'WAJIB', falseLabel: 'OPSIONAL' });
                const elimChip = getBoolChip(r?.is_elimination, { trueLabel: 'YA', falseLabel: 'TIDAK', trueColor: 'warning' });
                const scopeLabel = toScopeLabel(r);
                const scopeTooltip = toScopeTooltip(r);
                const scopeChipProps = getScopeChipProps(r);
                const componentName = r?.Component?.nama || '-';

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
                      <Chip size="small" {...typeChip} />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...requiredChip} />
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...elimChip} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatNumber(r?.min_score)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem' }}>{formatNumber(r?.weight)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {r?.sort_order ?? '-'}
                      </Typography>
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
                colSpan={12}
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

PpdbWaveTrackTestRequirementsTable.propTypes = {
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

export default PpdbWaveTrackTestRequirementsTable;