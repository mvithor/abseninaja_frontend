import PropTypes from 'prop-types';
import { useState } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  IconEye,
  IconDotsVertical,
  IconFileText,
  IconExternalLink,
  IconAlertTriangle,
} from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const NILAI_STATUS_LABEL = {
  GRADED: 'Sudah dinilai',
  UNGRADED: 'Belum dinilai',
  NEEDS_ATTENTION: 'Perlu diproses',
  NOT_ELIGIBLE: 'Tidak bisa dinilai',
};

const ATTENDANCE_LABEL = {
  NOT_CHECKED_IN: 'Belum check-in',
  PRESENT: 'Hadir',
  LATE: 'Terlambat',
  ABSENT: 'Absen',
  DISQUALIFIED: 'Diskualifikasi',
};

const getNilaiStatusFromRow = (row) => {
  const att = String(row?.attendance?.status || 'NOT_CHECKED_IN').toUpperCase();
  const resStatus = String(row?.result?.status || '').toUpperCase();
  const hasResult = Boolean(row?.result);

  // sudah final
  if (hasResult && resStatus === 'FINAL') return 'GRADED';

  // tidak eligible dinilai (sesuai rule BE: hanya PRESENT/LATE boleh input nilai)
  if (att === 'ABSENT' || att === 'DISQUALIFIED' || att === 'NOT_CHECKED_IN') {
    return 'NOT_ELIGIBLE';
  }

  // kalau hadir/terlambat tapi belum ada result / masih draft -> perlu diproses
  if (att === 'PRESENT' || att === 'LATE') {
    if (!hasResult || resStatus === 'DRAFT') return 'NEEDS_ATTENTION';
  }

  // default
  return 'UNGRADED';
};

const getNilaiStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();

  if (s === 'GRADED') return { label: NILAI_STATUS_LABEL.GRADED, color: 'success', variant: 'filled' };
  if (s === 'NEEDS_ATTENTION') return { label: NILAI_STATUS_LABEL.NEEDS_ATTENTION, color: 'warning', variant: 'filled' };
  if (s === 'UNGRADED') return { label: NILAI_STATUS_LABEL.UNGRADED, color: 'default', variant: 'outlined' };
  if (s === 'NOT_ELIGIBLE') return { label: NILAI_STATUS_LABEL.NOT_ELIGIBLE, color: 'error', variant: 'outlined' };

  return { label: s ? `Legacy: ${s}` : '-', color: 'default', variant: 'outlined' };
};

const getAttendanceChipProps = (attendanceStatus) => {
  const s = String(attendanceStatus || '').toUpperCase();

  if (s === 'PRESENT') return { label: ATTENDANCE_LABEL.PRESENT, color: 'success', variant: 'outlined' };
  if (s === 'LATE') return { label: ATTENDANCE_LABEL.LATE, color: 'warning', variant: 'outlined' };
  if (s === 'NOT_CHECKED_IN') return { label: ATTENDANCE_LABEL.NOT_CHECKED_IN, color: 'default', variant: 'outlined' };
  if (s === 'ABSENT') return { label: ATTENDANCE_LABEL.ABSENT, color: 'error', variant: 'outlined' };
  if (s === 'DISQUALIFIED') return { label: ATTENDANCE_LABEL.DISQUALIFIED, color: 'error', variant: 'filled' };

  return { label: s ? `Legacy: ${s}` : '-', color: 'default', variant: 'outlined' };
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
  return formatScore(s);
};

const getPassChipProps = (row) => {
  const passed = row?.result?.passed ?? row?.enrollment?.passed;
  if (passed === true) return { label: 'Lulus', color: 'success', variant: 'outlined' };
  if (passed === false) return { label: 'Tidak lulus', color: 'error', variant: 'outlined' };
  return { label: '-', color: 'default', variant: 'outlined' };
};

const getModeChipProps = (mode) => {
  const m = String(mode || '').toUpperCase();
  if (m === 'OFFLINE') return { label: 'OFFLINE', color: 'default', variant: 'outlined' };
  if (m === 'ONLINE') return { label: 'ONLINE', color: 'info', variant: 'outlined' };
  return { label: m ? m : '-', color: 'default', variant: 'outlined' };
};

const EmptyState = ({ hasAnyFilter }) => {
  const title = hasAnyFilter ? 'Tidak ada data untuk filter ini' : 'Belum ada data nilai';
  const helper = hasAnyFilter
    ? 'Coba longgarkan filter (misal kosongkan sesi/ruang/komponen) lalu muat ulang.'
    : 'Pastikan participant/enrollment sudah terbentuk dan peserta sudah check-in bila ingin penilaian.';

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

const PpdbInputNilaiTable = ({
  rows,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleViewParticipant,
  handleOpenApp,
  isLoading,
  isError,
  errorMessage,
  hasAnyFilter,
}) => {
  const baseIndex = rowsPerPage === -1 ? 0 : page * rowsPerPage;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={70}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>

              <TableCell width={260}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Pendaftar</Typography>
              </TableCell>

              <TableCell width={240}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Sesi</Typography>
              </TableCell>

              {/* ✅ kolom baru: Mode */}
              <TableCell align="center" width={140}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mode</Typography>
              </TableCell>

              {/* ✅ Ruang & Kursi jadi ringkas */}
              <TableCell width={220}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Ruang & Kursi</Typography>
              </TableCell>

              <TableCell align="center" width={180}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Check-in</Typography>
              </TableCell>

              <TableCell align="center" width={140}>
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
                        Coba muat ulang atau longgarkan filter.
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
                  key={String(r?.participant_id || `${index}`)}
                  r={r}
                  index={index}
                  baseIndex={baseIndex}
                  handleViewParticipant={handleViewParticipant}
                  handleOpenApp={handleOpenApp}
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

// ===== Row component =====
const RowWithMenu = ({ r, index, baseIndex, handleViewParticipant, handleOpenApp }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const onOpen = (e) => setAnchorEl(e.currentTarget);
  const onClose = () => setAnchorEl(null);

  const clickAction = (type) => {
    onClose();
    if (type === 'VIEW_PARTICIPANT' && handleViewParticipant) handleViewParticipant(r?.participant_id);
    if (type === 'VIEW_APP' && handleOpenApp) handleOpenApp(r?.application?.id);
  };

  const nilaiStatus = getNilaiStatusFromRow(r);
  const nilaiProps = getNilaiStatusChipProps(nilaiStatus);
  const passProps = getPassChipProps(r);

  const attendanceProps = getAttendanceChipProps(r?.attendance?.status || 'NOT_CHECKED_IN');
  const needsAttention = String(nilaiStatus || '').toUpperCase() === 'NEEDS_ATTENTION';

  const kode = r?.application?.kode_pendaftaran || '-';
  const nama = r?.application?.nama || '-';

  const sessionTitle = r?.session?.title || '-';

  const roomLabel = r?.room?.label || '-';
  const roomMode = r?.room?.mode ? String(r.room.mode).toUpperCase() : null;
  const modeProps = getModeChipProps(roomMode);

  const seat = r?.seat_number || '-';
  const roomSeatText = `${roomLabel} | ${seat}`;

  const scoreText = getScoreView(r);
  const updatedAt = r?.result?.graded_at || r?.attendance?.checkin_at || null;

  const canViewParticipant = Boolean(r?.participant_id);
  const canOpenApp = Boolean(r?.application?.id);

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
        {/* ✅ hapus: Status pendaftar */}
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
          {sessionTitle}
        </Typography>
        {/* ✅ hapus: Status sesi */}
      </TableCell>

      {/* ✅ kolom baru: Mode */}
      <TableCell align="center">
        <Chip size="small" {...modeProps} />
      </TableCell>

      {/* ✅ Ruang & Kursi ringkas */}
      <TableCell>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
          {roomSeatText}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Stack spacing={0.7} alignItems="center">
          <Chip size="small" {...attendanceProps} />
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
            {r?.attendance?.checkin_at ? formatDateTime(r.attendance.checkin_at) : '-'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Typography sx={{ fontSize: '1rem', fontWeight: 900 }}>
          {scoreText}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Chip size="small" {...passProps} />
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={0.8} justifyContent="center" alignItems="center">
          <Chip size="small" {...nilaiProps} />
          {needsAttention ? (
            <Tooltip title="Perlu ditindak: peserta hadir/terlambat tapi belum dinilai" placement="bottom">
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
          <Tooltip title={canViewParticipant ? 'Lihat detail peserta tes' : 'Participant ID tidak tersedia'} placement="bottom">
            <span>
              <IconButton disabled={!canViewParticipant} onClick={() => canViewParticipant && handleViewParticipant(r?.participant_id)}>
                <IconEye width={18} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Aksi cepat" placement="bottom">
            <span>
              <IconButton disabled={!canViewParticipant && !canOpenApp} onClick={onOpen}>
                <IconDotsVertical width={18} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled={!canViewParticipant} onClick={() => clickAction('VIEW_PARTICIPANT')}>
            <ListItemIcon><IconFileText size={18} /></ListItemIcon>
            <ListItemText primary="Lihat Detail Peserta Tes" />
          </MenuItem>

          <MenuItem disabled={!canOpenApp} onClick={() => clickAction('VIEW_APP')}>
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
  handleViewParticipant: PropTypes.func,
  handleOpenApp: PropTypes.func,
};

PpdbInputNilaiTable.propTypes = {
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleViewParticipant: PropTypes.func.isRequired,
  handleOpenApp: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  hasAnyFilter: PropTypes.bool,
};

export default PpdbInputNilaiTable;