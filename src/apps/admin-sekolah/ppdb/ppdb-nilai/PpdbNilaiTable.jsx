import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
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
  Stack,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  IconEye,
  IconDotsVertical,
  IconFileText,
  IconExternalLink,
  IconAlertTriangle
} from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const NILAI_STATUS_LABEL = {
  GRADED: 'Sudah dinilai',
  UNGRADED: 'Belum dinilai',
  NEEDS_ATTENTION: 'Perlu diproses',
  NO_PARTICIPANT: 'Belum ikut tes',
};

const TEST_TYPE_LABEL = {
  CBT: 'CBT',
  INTERVIEW: 'Interview',
  MANUAL: 'Manual',
};

const getNilaiStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();

  if (s === 'GRADED') return { label: NILAI_STATUS_LABEL.GRADED, color: 'success', variant: 'filled' };
  if (s === 'NEEDS_ATTENTION') return { label: NILAI_STATUS_LABEL.NEEDS_ATTENTION, color: 'warning', variant: 'filled' };
  if (s === 'UNGRADED') return { label: NILAI_STATUS_LABEL.UNGRADED, color: 'default', variant: 'outlined' };
  if (s === 'NO_PARTICIPANT') return { label: NILAI_STATUS_LABEL.NO_PARTICIPANT, color: 'info', variant: 'outlined' };

  return { label: s ? `Legacy: ${s}` : '-', color: 'default', variant: 'outlined' };
};

const getTestTypeChipProps = (type) => {
  const t = String(type || '').toUpperCase();
  if (t === 'CBT') return { label: TEST_TYPE_LABEL.CBT, color: 'info', variant: 'outlined' };
  if (t === 'INTERVIEW') return { label: TEST_TYPE_LABEL.INTERVIEW, color: 'secondary', variant: 'outlined' };
  if (t === 'MANUAL') return { label: TEST_TYPE_LABEL.MANUAL, color: 'primary', variant: 'outlined' };
  return { label: t ? `Legacy: ${t}` : '-', color: 'default', variant: 'outlined' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const clampNumber = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return null;
  return n;
};

const formatScore = (score) => {
  const n = clampNumber(score);
  if (n === null) return '-';
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
};

const getScoreView = (row) => {
  const scoreRes = row?.result?.score;
  const scoreEnr = row?.enrollment?.score;

  const s = clampNumber(scoreRes ?? scoreEnr);
  if (s === null) return '-';

  const min = clampNumber(row?.score_min);
  const max = clampNumber(row?.score_max);

  if (min !== null && max !== null) return `${formatScore(s)} / ${formatScore(max)}`;
  return formatScore(s);
};

const getPassChipProps = (row) => {
  const passed = row?.result?.passed ?? row?.enrollment?.passed;
  if (passed === true) return { label: 'Lulus', color: 'success', variant: 'outlined' };
  if (passed === false) return { label: 'Tidak lulus', color: 'error', variant: 'outlined' };
  return { label: '-', color: 'default', variant: 'outlined' };
};

const getLabelOrDash = (mapLike, id) => {
  if (!id) return '-';
  if (!(mapLike instanceof Map)) return '-';
  const v = mapLike.get(id);
  return v ? v : '-';
};

const EmptyState = ({ hasAnyFilter }) => {
  const title = hasAnyFilter ? 'Tidak ada data untuk filter ini' : 'Belum ada data nilai';
  const helper = hasAnyFilter
    ? 'Coba longgarkan filter (misal kosongkan sesi/komponen) lalu muat ulang.'
    : 'Pastikan enrollment tes sudah terbentuk dari bootstrap, lalu cek kembali.';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140, textAlign: 'center', px: 2 }}>
      <Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.6 }}>
          {helper}
        </Typography>
      </Box>
    </Box>
  );
};

EmptyState.propTypes = {
  hasAnyFilter: PropTypes.bool,
};

const PpdbNilaiTable = ({
  rows,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleViewDetail,
  handleOpenApp,
  isLoading,
  isError,
  errorMessage,
  hasAnyFilter,
  // ✅ label maps dari view (biar tampilan tabel konsisten dengan dropdown)
  periodLabelMap,
  waveTrackLabelMap,
  componentLabelMap,
  sessionLabelMap
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

  // normalize maps (biar aman walau parent kirim null)
  const maps = useMemo(() => {
    return {
      period: periodLabelMap instanceof Map ? periodLabelMap : new Map(),
      waveTrack: waveTrackLabelMap instanceof Map ? waveTrackLabelMap : new Map(),
      component: componentLabelMap instanceof Map ? componentLabelMap : new Map(),
      session: sessionLabelMap instanceof Map ? sessionLabelMap : new Map(),
    };
  }, [periodLabelMap, waveTrackLabelMap, componentLabelMap, sessionLabelMap]);

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={70}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>

              <TableCell width={220}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Pendaftar</Typography>
              </TableCell>

              <TableCell width={260}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Scope</Typography>
              </TableCell>

              <TableCell width={240}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Komponen Tes</Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tipe</Typography>
              </TableCell>

              <TableCell width={260}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Sesi</Typography>
              </TableCell>

              <TableCell align="center" width={170}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nilai</Typography>
              </TableCell>

              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Lulus</Typography>
              </TableCell>

              <TableCell align="center" width={200}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status Nilai</Typography>
              </TableCell>

              <TableCell width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Updated</Typography>
              </TableCell>

              <TableCell align="center" width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140, px: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography color="error" variant="h6">{errorMessage || 'Gagal memuat data'}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.6 }}>
                        Coba pilih Period terlebih dahulu, lalu persempit WaveTrack/Komponen/Sesi jika tabel terlalu besar.
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (rows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <EmptyState hasAnyFilter={hasAnyFilter} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, index) => (
                <RowWithMenu
                  key={`${r?.enrollment_id || 'enr'}-${index}`}
                  r={r}
                  index={index}
                  baseIndex={baseIndex}
                  handleViewDetail={handleViewDetail}
                  handleOpenApp={handleOpenApp}
                  maps={maps}
                />
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 25, 50]}
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

// ===== Row component (keeps Table clean, preserves format, adds action menu) =====
const RowWithMenu = ({ r, index, baseIndex, handleViewDetail, handleOpenApp, maps }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const onOpen = (e) => setAnchorEl(e.currentTarget);
  const onClose = () => setAnchorEl(null);

  const clickAction = (type) => {
    onClose();
    if (type === 'VIEW_APP' && handleOpenApp) handleOpenApp(r?.ppdb_application_id);
    if (type === 'VIEW_DETAIL' && handleViewDetail) handleViewDetail(r?.ppdb_application_id);
  };

  const nilaiProps = getNilaiStatusChipProps(r?.nilai_status);
  const typeProps = getTestTypeChipProps(r?.test_type);
  const passProps = getPassChipProps(r);

  const kode = r?.kode_pendaftaran || '-';
  const nama = r?.nama_calon_peserta_didik || '-';

  const scope = r?.scope_label || '-';

  const periodId = r?.ppdb_period_id || null;
  const waveTrackId = r?.ppdb_wave_track_id || null;
  const compId = r?.ppdb_test_component_id || null;

  // ❌ jangan fallback ke UUID
  const periodLabel = getLabelOrDash(maps?.period, periodId);
  const waveTrackLabel = getLabelOrDash(maps?.waveTrack, waveTrackId);
  const componentLabel = getLabelOrDash(maps?.component, compId);

  const testNama = r?.test_nama || '-';
  const testCode = r?.test_code ? ` (${r.test_code})` : '';

  const sessionId = r?.session?.id || r?.ppdb_test_session_id || null;
  // ❌ jangan fallback ke UUID
  const sessionLabel = sessionId ? (maps?.session?.get(sessionId) || r?.session?.title || '-') : '-';

  const sessionRange =
    r?.session?.start_at || r?.session?.end_at
      ? `${formatDateTime(r?.session?.start_at)} - ${formatDateTime(r?.session?.end_at)}`
      : null;

  const scoreText = getScoreView(r);
  const updatedAt = r?.result?.graded_at || r?.enrollment?.completed_at || null;

  const needsAttention = String(r?.nilai_status || '').toUpperCase() === 'NEEDS_ATTENTION';
  const canView = !!r?.ppdb_application_id;

  return (
    <TableRow hover>
      <TableCell>
        <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: '0.98rem', fontWeight: 800 }}>
          {nama}
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', mt: 0.3 }}>
          {kode}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
          {scope}
        </Typography>

        {/* ✅ ringkas, tanpa UUID */}
        {(periodLabel !== '-' || waveTrackLabel !== '-') ? (
          <>
            <Divider sx={{ my: 0.7 }} />
            <Stack spacing={0.4}>
              {periodLabel !== '-' ? (
                <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>
                  {periodLabel}
                </Typography>
              ) : null}

              {waveTrackLabel !== '-' ? (
                <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>
                  {waveTrackLabel}
                </Typography>
              ) : null}
            </Stack>
          </>
        ) : null}
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
          {testNama}{testCode}
        </Typography>
        <Divider sx={{ my: 0.7 }} />
        <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>
          {componentLabel}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Chip size="small" {...typeProps} />
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
          {sessionLabel}
        </Typography>

        {sessionRange ? (
          <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', mt: 0.4 }}>
            {sessionRange}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', mt: 0.4 }}>
            Jadwal: -
          </Typography>
        )}

        {/* ❌ HAPUS participant UUID karena bikin ramai */}
      </TableCell>

      <TableCell align="center">
        <Typography sx={{ fontSize: '1rem', fontWeight: 900 }}>
          {scoreText}
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', mt: 0.45, color: 'text.secondary' }}>
          {r?.attendance?.status ? `Check-in: ${String(r.attendance.status).toUpperCase()}` : 'Check-in: -'}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Chip size="small" {...passProps} />
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={0.8} justifyContent="center" alignItems="center">
          <Chip size="small" {...nilaiProps} />
          {needsAttention ? (
            <Tooltip title="Perlu ditindak: sudah hadir/selesai tapi belum dinilai" placement="bottom">
              <IconAlertTriangle size={16} />
            </Tooltip>
          ) : null}
        </Stack>
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: '1rem' }}>
          {updatedAt ? formatDateTime(updatedAt) : '-'}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={0.2} justifyContent="center">
          <Tooltip title={canView ? 'Lihat ringkasan nilai pendaftar' : 'ID pendaftar tidak tersedia'} placement="bottom">
            <span>
              <IconButton disabled={!canView} onClick={() => canView && handleViewDetail(r?.ppdb_application_id)}>
                <IconEye width={18} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Aksi cepat" placement="bottom">
            <span>
              <IconButton disabled={!canView} onClick={onOpen}>
                <IconDotsVertical width={18} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
          <MenuItem disabled={!canView} onClick={() => clickAction('VIEW_DETAIL')}>
            <ListItemIcon><IconFileText size={18} /></ListItemIcon>
            <ListItemText primary="Lihat Detail Nilai" />
          </MenuItem>

          <MenuItem disabled={!canView} onClick={() => clickAction('VIEW_APP')}>
            <ListItemIcon><IconExternalLink size={18} /></ListItemIcon>
            <ListItemText primary="Buka Profil Pendaftar" />
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

RowWithMenu.propTypes = {
  r: PropTypes.object,
  index: PropTypes.number,
  baseIndex: PropTypes.number,
  handleViewDetail: PropTypes.func,
  handleOpenApp: PropTypes.func,
  maps: PropTypes.shape({
    period: PropTypes.instanceOf(Map),
    waveTrack: PropTypes.instanceOf(Map),
    component: PropTypes.instanceOf(Map),
    session: PropTypes.instanceOf(Map),
  }),
};

PpdbNilaiTable.propTypes = {
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleViewDetail: PropTypes.func.isRequired,
  handleOpenApp: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  hasAnyFilter: PropTypes.bool,
  periodLabelMap: PropTypes.instanceOf(Map),
  waveTrackLabelMap: PropTypes.instanceOf(Map),
  componentLabelMap: PropTypes.instanceOf(Map),
  sessionLabelMap: PropTypes.instanceOf(Map),
};

export default PpdbNilaiTable;