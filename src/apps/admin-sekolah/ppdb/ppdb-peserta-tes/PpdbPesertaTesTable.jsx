// PpdbPesertaTesTable.jsx
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
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  IconEye,
  IconDotsVertical,
  IconArmchair2,
  IconCalendarTime,
  IconQrcode,
  IconRefresh,
  IconBan,
} from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const PARTICIPANT_STATUS_LABEL = {
  ASSIGNED: 'Assigned',
  CANCELLED: 'Cancelled',
};

const SESSION_STATUS_LABEL = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ONGOING: 'Ongoing',
  FINISHED: 'Finished',
  CANCELLED: 'Cancelled',
};

const MODE_LABEL = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
};

const getParticipantStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'ASSIGNED') return { label: PARTICIPANT_STATUS_LABEL.ASSIGNED, color: 'success', variant: 'filled' };
  if (s === 'CANCELLED') return { label: PARTICIPANT_STATUS_LABEL.CANCELLED, color: 'default', variant: 'outlined' };
  return { label: s ? `Legacy: ${s}` : '-', color: 'default', variant: 'outlined' };
};

const getSessionStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'PUBLISHED') return { label: SESSION_STATUS_LABEL.PUBLISHED, color: 'info', variant: 'filled' };
  if (s === 'DRAFT') return { label: SESSION_STATUS_LABEL.DRAFT, color: 'default', variant: 'outlined' };
  if (s === 'ONGOING') return { label: SESSION_STATUS_LABEL.ONGOING, color: 'warning', variant: 'filled' };
  if (s === 'FINISHED') return { label: SESSION_STATUS_LABEL.FINISHED, color: 'secondary', variant: 'filled' };
  if (s === 'CANCELLED') return { label: SESSION_STATUS_LABEL.CANCELLED, color: 'error', variant: 'outlined' };
  return { label: s ? `Legacy: ${s}` : '-', color: 'default', variant: 'outlined' };
};

const getModeChipProps = (mode) => {
  const m = String(mode || '').toUpperCase();
  if (m === 'ONLINE') return { label: MODE_LABEL.ONLINE, color: 'info', variant: 'outlined' };
  if (m === 'OFFLINE') return { label: MODE_LABEL.OFFLINE, color: 'primary', variant: 'outlined' };
  return { label: m ? `Legacy: ${m}` : '-', color: 'default', variant: 'outlined' };
};

const getQrChipProps = (p) => {
  const active = !!p?.qr_is_active;
  const assigned = String(p?.status || '').toUpperCase() === 'ASSIGNED';

  if (!assigned) return { label: '-', color: 'default', variant: 'outlined' };
  if (active) return { label: 'QR Active', color: 'success', variant: 'outlined' };
  return { label: 'QR Revoked', color: 'error', variant: 'outlined' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const getRoomLabel = (sr) => {
  if (!sr) return '-';
  const mode = String(sr?.mode || '').toUpperCase();
  if (mode === 'ONLINE') return sr?.room_label || sr?.online_url || 'Online';
  const code = sr?.Room?.code ? `${sr.Room.code} · ` : '';
  const nama = sr?.Room?.nama || sr?.room_label || 'Ruang';
  const lokasi = sr?.Room?.lokasi ? ` (${sr.Room.lokasi})` : '';
  return `${code}${nama}${lokasi}`;
};

const isSessionOperationalForEdit = (sessionStatus) => {
  const st = String(sessionStatus || '').toUpperCase();
  return st === 'DRAFT' || st === 'PUBLISHED';
};

const getGateReason = (sessionStatus, operation = 'Aksi') => {
  const st = String(sessionStatus || '').toUpperCase();
  if (!st) return `${operation} ditolak: status sesi tidak valid`;
  if (st === 'CANCELLED' || st === 'FINISHED') return `${operation} ditolak: sesi ${st}`;
  if (st !== 'DRAFT' && st !== 'PUBLISHED') return `${operation} dibatasi: sesi harus DRAFT/PUBLISHED (saat ini ${st})`;
  return null;
};

const EmptyState = ({ sessionId, sessionRoomId }) => {
  const hasSession = !!String(sessionId || '').trim();
  const hasRoom = !!String(sessionRoomId || '').trim();

  let title = 'Belum ada peserta tes';
  let helper = 'Tambahkan peserta dari halaman tambah peserta.';

  if (!hasSession) {
    title = 'Pilih sesi tes dulu';
    helper = 'Filter minimal by session agar data tampil lebih relevan.';
  } else if (hasSession && !hasRoom) {
    title = 'Belum ada peserta tes pada sesi ini';
    helper = 'Opsional: pilih room untuk mempersempit data.';
  }

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
  sessionId: PropTypes.string,
  sessionRoomId: PropTypes.string,
};

const PpdbPesertaTesTable = ({
  participantList,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleView,
  onAction,
  isLoading,
  isError,
  errorMessage,
  sessionId,
  sessionRoomId,
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

              <TableCell width={220}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Pendaftar</Typography>
              </TableCell>

              <TableCell width={220}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Sesi Tes</Typography>
              </TableCell>

              <TableCell width={220}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Ruang / Link</Typography>
              </TableCell>

              <TableCell align="center" width={110}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Mode</Typography>
              </TableCell>

              <TableCell align="center" width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Seat</Typography>
              </TableCell>

              <TableCell align="center" width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>QR</Typography>
              </TableCell>

              <TableCell align="center" width={150}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>

              <TableCell width={160}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Created</Typography>
              </TableCell>

              <TableCell align="center" width={120}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140, px: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography color="error" variant="h6">{errorMessage || 'Gagal memuat data'}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.6 }}>
                        Coba periksa filter sesi tes/ruangan, atau ulangi beberapa saat lagi.
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (participantList?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <EmptyState sessionId={sessionId} sessionRoomId={sessionRoomId} />
                </TableCell>
              </TableRow>
            ) : (
              participantList.map((p, index) => {
                const participantStatusProps = getParticipantStatusChipProps(p?.status);
                const sessionStatusProps = getSessionStatusChipProps(p?.Session?.status);
                const modeProps = getModeChipProps(p?.SessionRoom?.mode);
                const qrProps = getQrChipProps(p);

                const kode = p?.Application?.kode_pendaftaran || '-';
                const nama = p?.Application?.nama_calon_peserta_didik || '-';
                const nisn = p?.Application?.nisn || '-';

                const canView = !!p?.id;

                const sessionStatus = String(p?.Session?.status || '').toUpperCase();
                const participantStatus = String(p?.status || '').toUpperCase();
                const canOperate = isSessionOperationalForEdit(sessionStatus);
                const gateReason = getGateReason(sessionStatus, 'Aksi');

                const canEditSeat = canOperate && participantStatus === 'ASSIGNED';
                const canReschedule = canOperate && participantStatus === 'ASSIGNED';
                const canCancel = canOperate && participantStatus === 'ASSIGNED';
                const canRevokeQr = canOperate && participantStatus === 'ASSIGNED' && p?.qr_is_active === true;
                const canRegenerateQr = canOperate && participantStatus === 'ASSIGNED';

                return (
                  <RowWithMenu
                    key={p?.id || index}
                    p={p}
                    index={index}
                    baseIndex={baseIndex}
                    participantStatusProps={participantStatusProps}
                    sessionStatusProps={sessionStatusProps}
                    modeProps={modeProps}
                    qrProps={qrProps}
                    kode={kode}
                    nama={nama}
                    nisn={nisn}
                    canView={canView}
                    handleView={handleView}
                    canOperate={canOperate}
                    gateReason={gateReason}
                    canEditSeat={canEditSeat}
                    canReschedule={canReschedule}
                    canCancel={canCancel}
                    canRevokeQr={canRevokeQr}
                    canRegenerateQr={canRegenerateQr}
                    onAction={onAction}
                  />
                );
              })
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 25, 50]}
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

const RowWithMenu = ({
  p,
  index,
  baseIndex,
  participantStatusProps,
  sessionStatusProps,
  modeProps,
  qrProps,
  kode,
  nama,
  nisn,
  canView,
  handleView,
  canOperate,
  gateReason,
  canEditSeat,
  canReschedule,
  canCancel,
  canRevokeQr,
  canRegenerateQr,
  onAction
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const onOpen = (e) => setAnchorEl(e.currentTarget);
  const onClose = () => setAnchorEl(null);

  const clickAction = (type) => {
    onClose();
    if (onAction) onAction(type, p);
  };

  const actionTooltip = (ok, label, extra) => {
    if (ok) return label;
    if (extra) return extra;
    return canOperate ? `${label} tidak tersedia` : (gateReason || `${label} dibatasi oleh status sesi`);
  };

  return (
    <TableRow hover>
      <TableCell>
        <Typography sx={{ fontSize: '1rem' }}>{baseIndex + index + 1}</Typography>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontSize: '0.98rem', fontWeight: 800 }}>
          {nama}
        </Typography>
        <Divider sx={{ my: 0.7 }} />
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
          {kode}
        </Typography>
        {nisn !== '-' ? (
          <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', mt: 0.3 }}>
            NISN: {nisn}
          </Typography>
        ) : null}
      </TableCell>

      {/* Sesi Tes: Title + Jadwal + Status Sesi */}
      <TableCell>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
          {p?.Session?.title || '-'}
        </Typography>
        <Divider sx={{ my: 0.7 }} />
        <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>
          {formatDateTime(p?.Session?.start_at)} - {formatDateTime(p?.Session?.end_at)}
        </Typography>
        <Stack direction="row" sx={{ mt: 0.7 }}>
          <Chip size="small" {...sessionStatusProps} />
        </Stack>
      </TableCell>

      {/* Ruang / Link */}
      <TableCell>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
          {getRoomLabel(p?.SessionRoom)}
        </Typography>
        {String(p?.SessionRoom?.mode || '').toUpperCase() === 'ONLINE' && p?.SessionRoom?.online_url ? (
          <>
            <Divider sx={{ my: 0.7 }} />
            <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>
              {p.SessionRoom.online_url}
            </Typography>
          </>
        ) : null}
      </TableCell>

      {/* Mode */}
      <TableCell align="center">
        <Chip size="small" {...modeProps} />
      </TableCell>

      {/* Seat */}
      <TableCell align="center">
        <Typography sx={{ fontSize: '1rem', fontWeight: 800 }}>
          {p?.seat_number || '-'}
        </Typography>
      </TableCell>

      {/* QR */}
      <TableCell align="center">
        <Stack direction="row" justifyContent="center">
          <Chip size="small" {...qrProps} />
        </Stack>
        <Typography sx={{ fontSize: '0.82rem', mt: 0.6, color: 'text.secondary' }}>
          {p?.qr_is_active ? `Gen: ${formatDateTime(p?.qr_generated_at)}` : `Rev: ${formatDateTime(p?.qr_revoked_at)}`}
        </Typography>
      </TableCell>

      {/* Status Peserta */}
      <TableCell align="center">
        <Chip size="small" {...participantStatusProps} />
      </TableCell>

      {/* Created */}
      <TableCell>
        <Typography sx={{ fontSize: '1rem' }}>
          {formatDateTime(p?.created_at)}
        </Typography>
      </TableCell>

      {/* Aksi */}
      <TableCell align="center">
        <Stack direction="row" spacing={0.2} justifyContent="center">
          <Tooltip title={canView ? 'Lihat Detail Peserta' : 'ID peserta tidak tersedia'} placement="bottom">
            <span>
              <IconButton disabled={!canView} onClick={() => canView && handleView(p?.id)}>
                <IconEye width={18} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Aksi cepat" placement="bottom">
            <span>
              <IconButton disabled={!p?.id} onClick={onOpen}>
                <IconDotsVertical width={18} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
          <Tooltip title={actionTooltip(canEditSeat, 'Ubah seat')} placement="left">
            <span>
              <MenuItem disabled={!canEditSeat} onClick={() => clickAction('EDIT_SEAT')}>
                <ListItemIcon><IconArmchair2 size={18} /></ListItemIcon>
                <ListItemText primary="Ubah Seat" />
              </MenuItem>
            </span>
          </Tooltip>

          <Tooltip title={actionTooltip(canReschedule, 'Reschedule peserta')} placement="left">
            <span>
              <MenuItem disabled={!canReschedule} onClick={() => clickAction('RESCHEDULE')}>
                <ListItemIcon><IconCalendarTime size={18} /></ListItemIcon>
                <ListItemText primary="Reschedule" />
              </MenuItem>
            </span>
          </Tooltip>

          <Divider />

          <Tooltip title={actionTooltip(canRevokeQr, 'Revoke QR', p?.qr_is_active ? null : 'QR sudah nonaktif')} placement="left">
            <span>
              <MenuItem disabled={!canRevokeQr} onClick={() => clickAction('REVOKE_QR')}>
                <ListItemIcon><IconQrcode size={18} /></ListItemIcon>
                <ListItemText primary="Revoke QR" />
              </MenuItem>
            </span>
          </Tooltip>

          <Tooltip title={actionTooltip(canRegenerateQr, 'Regenerate QR')} placement="left">
            <span>
              <MenuItem disabled={!canRegenerateQr} onClick={() => clickAction('REGENERATE_QR')}>
                <ListItemIcon><IconRefresh size={18} /></ListItemIcon>
                <ListItemText primary="Regenerate QR" />
              </MenuItem>
            </span>
          </Tooltip>

          <Divider />

          <Tooltip title={actionTooltip(canCancel, 'Batalkan peserta')} placement="left">
            <span>
              <MenuItem disabled={!canCancel} onClick={() => clickAction('CANCEL')} sx={{ color: 'error.main' }}>
                <ListItemIcon><IconBan size={18} /></ListItemIcon>
                <ListItemText primary="Batalkan Peserta" />
              </MenuItem>
            </span>
          </Tooltip>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

RowWithMenu.propTypes = {
  p: PropTypes.object,
  index: PropTypes.number,
  baseIndex: PropTypes.number,
  participantStatusProps: PropTypes.object,
  sessionStatusProps: PropTypes.object,
  modeProps: PropTypes.object,
  qrProps: PropTypes.object,
  kode: PropTypes.string,
  nama: PropTypes.string,
  nisn: PropTypes.string,
  canView: PropTypes.bool,
  handleView: PropTypes.func,
  canOperate: PropTypes.bool,
  gateReason: PropTypes.string,
  canEditSeat: PropTypes.bool,
  canReschedule: PropTypes.bool,
  canCancel: PropTypes.bool,
  canRevokeQr: PropTypes.bool,
  canRegenerateQr: PropTypes.bool,
  onAction: PropTypes.func,
};

PpdbPesertaTesTable.propTypes = {
  participantList: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleView: PropTypes.func.isRequired,
  onAction: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  sessionId: PropTypes.string,
  sessionRoomId: PropTypes.string,
};

export default PpdbPesertaTesTable;