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
  Switch,
  Stack
} from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const getActiveChipProps = (isActive) => {
  if (isActive === true) return { label: 'AKTIF', color: 'success' };
  if (isActive === false) return { label: 'NONAKTIF', color: 'default' };
  return { label: '-', color: 'default' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
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

  return wtId
    ? `Scope mapping (Gelombang dan Jalur): ${wtId}`
    : 'Scope mapping (Gelombang dan Jalur)';
};

const getScopeChipProps = (r) => {
  const scopeType = safeText(r?.scope_type) || (safeText(r?.ppdb_wave_track_id) ? 'WAVETRACK' : 'GLOBAL');
  if (scopeType === 'GLOBAL') return { color: 'default', variant: 'outlined' };
  return { color: 'info', variant: 'outlined' };
};

const PpdbJadwalTahapanTable = ({
  rows,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  handleToggle,
  isLoading,
  isError,
  errorMessage
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;
  const COLSPAN = 11;

  const toSequenceLabel = (seq) => {
    if (typeof seq === 'number' && Number.isFinite(seq)) return String(seq);
    return '-';
  };

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
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tahapan</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Period</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Gelombang dan Jalur</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Lokasi</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Urutan</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mulai</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Selesai</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Toggle</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={COLSPAN}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={COLSPAN}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                    <Typography color="error" variant="h6">
                      {errorMessage || 'Gagal memuat data'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (rows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={COLSPAN}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, textAlign: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Belum ada Jadwal Tahapan PMB
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Tambahkan jadwal tahapan (contoh: jadwal pendaftaran, verifikasi, tes, pengumuman) agar alur PMB jelas dan terukur.
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, index) => {
                const chip = getActiveChipProps(r?.is_active);
                const scopeLabel = toScopeLabel(r);
                const scopeTooltip = toScopeTooltip(r);
                const scopeChipProps = getScopeChipProps(r);

                return (
                  <TableRow key={r?.id || index} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 900 }}>
                        {r?.title ? String(r.title) : (r?.EventType?.nama || '-')}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
                        {r?.PpdbPeriod?.nama || '-'}
                      </Typography>
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

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
                        {r?.location || '-'}
                      </Typography>
                    </TableCell>

                     <TableCell align="center">
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 900 }}>
                        {toSequenceLabel(r?.sequence)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '0.95rem' }}>
                        {formatDateTime(r?.start_at)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontSize: '0.95rem' }}>
                        {formatDateTime(r?.end_at)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip size="small" {...chip} />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <Switch
                          checked={Boolean(r?.is_active)}
                          onChange={(e) => handleToggle(r?.id, e.target.checked)}
                          inputProps={{ 'aria-label': 'toggle active' }}
                        />
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Edit" placement="bottom">
                          <span>
                            <IconButton onClick={() => handleEdit(r?.id)}>
                              <IconEdit width={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Hapus" placement="bottom">
                          <span>
                            <IconButton onClick={() => handleDelete(r?.id)}>
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
                colSpan={COLSPAN}
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

PpdbJadwalTahapanTable.propTypes = {
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleToggle: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default PpdbJadwalTahapanTable;