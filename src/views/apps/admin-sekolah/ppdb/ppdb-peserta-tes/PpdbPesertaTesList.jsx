// PpdbPesertaTesList.jsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  TextField,
  Button,
  MenuItem,
  Collapse,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControlLabel,
  Switch
} from '@mui/material';
import { IconUserPlus } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import SearchButton from 'src/components/button-group/SearchButton';
import FilterButton from 'src/components/button-group/FilterButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import PpdbPesertaTesTable from 'src/apps/admin-sekolah/ppdb/ppdb-peserta-tes/PpdbPesertaTesTable';

const PARTICIPANT_STATUS_LABEL = {
  ASSIGNED: 'Assigned',
  CANCELLED: 'Cancelled',
};

const STATUS_CARDS = [
  { key: 'ASSIGNED', label: PARTICIPANT_STATUS_LABEL.ASSIGNED, helper: 'Peserta aktif di ruang/sesi tes' },
  { key: 'CANCELLED', label: PARTICIPANT_STATUS_LABEL.CANCELLED, helper: 'Peserta dibatalkan (seat reset, QR revoked)' },
];

const prettyParticipantStatus = (s) => {
  const k = String(s || '').toUpperCase();
  return PARTICIPANT_STATUS_LABEL[k] || (k ? `Legacy: ${k}` : '-');
};

const API_BASE = '/api/v1/admin-sekolah/ppdb-participants';

const MENU_PROPS = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
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

const fetchParticipants = async ({ page, limit, q, status, sessionId, sessionRoomId }) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (sessionId) params.set('ppdb_test_session_id', sessionId);
  if (sessionRoomId) params.set('ppdb_test_session_room_id', sessionRoomId);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-participants?${params.toString()}`);

  const meta = res.data?.meta || { page: 1, limit, total: 0, total_pages: 1 };

  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  const byStatus = rows.reduce((acc, r) => {
    const st = String(r?.status || '').toUpperCase();
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  return {
    data: rows,
    meta,
    summary: {
      total: Number(meta?.total || 0),
      by_status: byStatus
    }
  };
};

const fetchTestSessionsDropdown = async ({ periodId, q, waveTrackId, componentId, mode, status, limit = 200 }) => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));

  if (periodId) params.set('ppdb_period_id', String(periodId));

  if (q) params.set('q', q);
  if (waveTrackId) params.set('ppdb_wave_track_id', waveTrackId);
  if (componentId) params.set('ppdb_test_component_id', componentId);
  if (mode) params.set('mode', mode);
  if (status) params.set('status', status);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-test-session-participants?${params.toString()}`);

  return {
    resolvedPeriod: res.data?.resolved_period || null,
    data: Array.isArray(res.data?.data) ? res.data.data : [],
  };
};

const fetchSessionRoomsDropdown = async ({ sessionId, q, mode, limit = 200 }) => {
  const params = new URLSearchParams();
  params.set('ppdb_test_session_id', String(sessionId));
  params.set('limit', String(limit));
  if (q) params.set('q', q);
  if (mode) params.set('mode', mode);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-test-session-rooms?${params.toString()}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const StatCard = ({ active, title, value, helper, onClick }) => {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        borderWidth: active ? 2 : 1,
        transition: '0.15s',
        '&:hover': { transform: 'translateY(-1px)' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
          {Number(value || 0)}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 0.6, color: 'text.secondary' }}>
        {helper}
      </Typography>
    </Paper>
  );
};

const PpdbPesertaTesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sp, setSp] = useSearchParams();

  const page = Math.max(0, Number(sp.get('page') || 0)); // UI 0-based
  const rowsPerPage = Math.max(5, Number(sp.get('limit') || 10));

  const q = String(sp.get('q') || '');
  const status = String(sp.get('status') || '');

  const periodId = String(sp.get('ppdb_period_id') || '');

  const sessionId = String(sp.get('ppdb_test_session_id') || '');
  const sessionRoomId = String(sp.get('ppdb_test_session_room_id') || '');

  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const setParam = (key, val) => {
    const next = new URLSearchParams(sp);
    if (!val) next.delete(key);
    else next.set(key, val);
    if (key !== 'page') next.set('page', '0');
    setSp(next);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams(sp);
    next.delete('ppdb_test_session_id');
    next.delete('ppdb_test_session_room_id');
    next.delete('status');
    next.delete('q');
    next.set('page', '0');
    setSp(next);
  };

  // ============ Dropdown: Sessions ============
  const sessionDropdownKey = useMemo(
    () => ['ppdb-test-sessions-dropdown', { periodId }],
    [periodId]
  );

  const {
    data: sessionDropdown,
    isLoading: isLoadingSessions,
    isError: isErrorSessions,
    error: sessionError
  } = useQuery({
    queryKey: sessionDropdownKey,
    enabled: true,
    queryFn: () =>
      fetchTestSessionsDropdown({
        periodId: periodId || null,
        q: null,
        waveTrackId: null,
        componentId: null,
        limit: 200,
      }),
    staleTime: 60 * 1000,
  });

  const sessionOptions = useMemo(() => {
    return Array.isArray(sessionDropdown?.data) ? sessionDropdown.data : [];
  }, [sessionDropdown?.data]);

  const resolvedPeriod = useMemo(() => {
    return sessionDropdown?.resolvedPeriod || null;
  }, [sessionDropdown?.resolvedPeriod]);

  const selectedSession = useMemo(() => {
    return sessionOptions.find((s) => String(s?.id) === String(sessionId)) || null;
  }, [sessionOptions, sessionId]);

  // ============ Dropdown: Session Rooms (for filter) ============
  const roomDropdownKey = useMemo(
    () => ['ppdb-test-session-rooms-dropdown', { sessionId }],
    [sessionId]
  );

  const {
    data: roomOptions,
    isLoading: isLoadingRooms,
    isError: isErrorRooms,
    error: roomError
  } = useQuery({
    queryKey: roomDropdownKey,
    enabled: !!sessionId,
    queryFn: () =>
      fetchSessionRoomsDropdown({
        sessionId,
        q: null,
        mode: null,
        limit: 200,
      }),
    staleTime: 60 * 1000,
  });

  const selectedRoom = useMemo(() => {
    const arr = Array.isArray(roomOptions) ? roomOptions : [];
    return arr.find((r) => String(r?.id) === String(sessionRoomId)) || null;
  }, [roomOptions, sessionRoomId]);

  const requiresRoom = (Array.isArray(roomOptions) ? roomOptions.length : 0) > 0;

  // ============ Main data ============
  const queryKey = useMemo(
    () => ['ppdb-test-participants', { page, rowsPerPage, q, status, sessionId, sessionRoomId }],
    [page, rowsPerPage, q, status, sessionId, sessionRoomId]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      fetchParticipants({
        page: page + 1,
        limit: rowsPerPage,
        q: q || null,
        status: status || null,
        sessionId: sessionId || null,
        sessionRoomId: sessionRoomId || null,
      }),
    keepPreviousData: true,
  });

  const participantList = data?.data || [];
  const meta = data?.meta || {};
  const summary = data?.summary || { total: 0, by_status: {} };

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (sessionId) {
      const label = selectedSession?.title ? `Session: ${selectedSession.title}` : `Session: ${sessionId}`;
      chips.push({ key: 'ppdb_test_session_id', label });
    }

    if (sessionRoomId) {
      const label =
        selectedRoom?.label ||
        selectedRoom?.room_label ||
        selectedRoom?.Room?.nama ||
        (sessionRoomId ? `Room: ${sessionRoomId}` : '');
      chips.push({ key: 'ppdb_test_session_room_id', label });
    }

    if (status) chips.push({ key: 'status', label: `Status: ${prettyParticipantStatus(status)}` });
    if (q) chips.push({ key: 'q', label: `Cari: ${q}` });

    return chips.filter(Boolean);
  }, [sessionId, sessionRoomId, status, q, selectedSession, selectedRoom]);

  const isFilterBroken =
    isErrorSessions || (!!sessionId && isErrorRooms);

  const filterErrorMessage = useMemo(() => {
    if (isErrorSessions) return sessionError?.response?.data?.msg || sessionError?.message || 'Gagal memuat dropdown sesi';
    if (!!sessionId && isErrorRooms) return roomError?.response?.data?.msg || roomError?.message || 'Gagal memuat dropdown room';
    return null;
  }, [isErrorSessions, sessionError, sessionId, isErrorRooms, roomError]);

  const periodText = useMemo(() => {
    if (resolvedPeriod?.id) {
      const nm = resolvedPeriod?.nama || resolvedPeriod?.id;
      const st = String(resolvedPeriod?.status || '').toUpperCase();
      return `Auto period: ${nm} (${st || '-'})`;
    }
    if (periodId) return `Period: ${periodId}`;
    return 'Period: -';
  }, [resolvedPeriod, periodId]);

  // ===================== Action Dialog state =====================
  const [actionState, setActionState] = useState({ open: false, type: null, participant: null });

  const openAction = (type, participant) => {
    setActionState({ open: true, type, participant });
  };

  const closeAction = () => {
    setActionState({ open: false, type: null, participant: null });
  };

  const participant = actionState.participant;

  const gateForParticipant = useMemo(() => {
    const st = String(participant?.Session?.status || '').toUpperCase();
    const ok = isSessionOperationalForEdit(st);
    return { ok, msg: ok ? null : getGateReason(st, 'Aksi') };
  }, [participant?.Session?.status]);

  // ===================== Mutations =====================
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['ppdb-test-participants'] });
    await queryClient.invalidateQueries({ queryKey: queryKey });
  };

  const updateSeatMutation = useMutation({
    mutationFn: async ({ id, seat_number }) => {
      const res = await axiosInstance.put(`${API_BASE}/${id}/seat`, { seat_number });
      return res.data;
    },
    onSuccess: async () => {
      await invalidate();
      closeAction();
    },
  });

  const revokeQrMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      const res = await axiosInstance.post(`${API_BASE}/${id}/qr/revoke`, { reason });
      return res.data;
    },
    onSuccess: async () => {
      await invalidate();
      closeAction();
    },
  });

  const regenerateQrMutation = useMutation({
    mutationFn: async ({ id }) => {
      const res = await axiosInstance.post(`${API_BASE}/${id}/qr/regenerate`);
      return res.data;
    },
    onSuccess: async () => {
      await invalidate();
      closeAction();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      const res = await axiosInstance.post(`${API_BASE}/${id}/cancel`, { reason });
      return res.data;
    },
    onSuccess: async () => {
      await invalidate();
      closeAction();
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (payload) => {
      const { id, ...body } = payload;
      const res = await axiosInstance.post(`${API_BASE}/${id}/reschedule`, body);
      return res.data;
    },
    onSuccess: async () => {
      await invalidate();
      closeAction();
    },
  });

  // ===================== Dialog form states =====================
  const [seatValue, setSeatValue] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');

  const [targetSessionId, setTargetSessionId] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [targetSeat, setTargetSeat] = useState('');
  const [regenerateQr, setRegenerateQr] = useState(true);

  useEffect(() => {
    if (!actionState.open) return;

    const p = actionState.participant;
    const type = actionState.type;

    if (type === 'EDIT_SEAT') {
      setSeatValue(String(p?.seat_number || ''));
    }

    if (type === 'CANCEL') {
      setCancelReason('');
    }

    if (type === 'REVOKE_QR') {
      setRevokeReason('');
    }

    if (type === 'RESCHEDULE') {
      const sid = String(p?.Session?.id || p?.ppdb_test_session_id || '');
      const rid = String(p?.SessionRoom?.id || p?.ppdb_test_session_room_id || '');
      setTargetSessionId(sid);
      setTargetRoomId(rid);
      setTargetSeat(String(p?.seat_number || ''));
      setRegenerateQr(true);
    }
  }, [actionState.open, actionState.type, actionState.participant]);

  // Rooms dropdown for reschedule (depends on targetSessionId)
  const rescheduleRoomKey = useMemo(
    () => ['ppdb-test-session-rooms-dropdown', { sessionId: targetSessionId, purpose: 'reschedule' }],
    [targetSessionId]
  );

  const {
    data: rescheduleRoomOptions,
    isLoading: isLoadingRescheduleRooms,
    isError: isErrorRescheduleRooms,
    error: rescheduleRoomError
  } = useQuery({
    queryKey: rescheduleRoomKey,
    enabled: actionState.open && actionState.type === 'RESCHEDULE' && !!targetSessionId,
    queryFn: () => fetchSessionRoomsDropdown({ sessionId: targetSessionId, q: null, mode: null, limit: 200 }),
    staleTime: 60 * 1000,
  });

  const rescheduleRooms = Array.isArray(rescheduleRoomOptions) ? rescheduleRoomOptions : [];

  const dialogErrorMsg = useMemo(() => {
    const e =
      updateSeatMutation.error ||
      revokeQrMutation.error ||
      regenerateQrMutation.error ||
      cancelMutation.error ||
      rescheduleMutation.error;

    if (!e) return null;
    return e?.response?.data?.msg || e?.message || 'Terjadi kesalahan';
  }, [
    updateSeatMutation.error,
    revokeQrMutation.error,
    regenerateQrMutation.error,
    cancelMutation.error,
    rescheduleMutation.error
  ]);

  const isMutating =
    updateSeatMutation.isPending ||
    revokeQrMutation.isPending ||
    regenerateQrMutation.isPending ||
    cancelMutation.isPending ||
    rescheduleMutation.isPending;

  const participantTitle = useMemo(() => {
    const kode = participant?.Application?.kode_pendaftaran || '-';
    const nama = participant?.Application?.nama_calon_peserta_didik || '-';
    return `${nama} (${kode})`;
  }, [participant]);

  const participantMeta = useMemo(() => {
    const ses = participant?.Session?.title || '-';
    const room =
      participant?.SessionRoom?.room_label ||
      participant?.SessionRoom?.Room?.nama ||
      participant?.SessionRoom?.online_url ||
      '-';
    return `${ses} · ${room}`;
  }, [participant]);

  return (
    <PageContainer title="Peserta Tes PPDB" description="Daftar peserta tes PPDB">
      <ParentCard title="Peserta Tes PPDB">
        {isError ? (
          <Alerts error={error?.response?.data?.msg || 'Gagal memuat peserta tes'} />
        ) : null}

        {isFilterBroken ? (
          <Alerts error={filterErrorMessage || 'Gagal memuat filter dropdown'} />
        ) : null}

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%', mb: 2 }}>
          <SearchButton
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Cari (nama / kode / NISN / seat)"
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
              onClick={() => setIsFilterOpen((v) => !v)}
              sx={{ display: 'inline-flex' }}
            >
              <FilterButton />
            </Box>

            <Button
              variant="contained"
              startIcon={<IconUserPlus size={18} />}
              onClick={() => {
                const params = new URLSearchParams();
                if (sessionId) params.set('ppdb_test_session_id', sessionId);
                if (sessionRoomId) params.set('ppdb_test_session_room_id', sessionRoomId);

                const qs = params.toString();
                navigate(`/dashboard/admin-sekolah/ppdb-peserta-tes/tambah${qs ? `?${qs}` : ''}`);
              }}
            >
              Tambah Peserta
            </Button>
          </Box>
        </Box>

        {/* Filter Card (collapsible) */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2 }}>
                Filter Peserta Tes
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
                {periodText}
              </Typography>
            </Box>

            <Button
              variant="text"
              size="small"
              onClick={() => setIsFilterOpen((v) => !v)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {isFilterOpen ? 'Sembunyikan' : 'Tampilkan'}
            </Button>
          </Box>

          <Collapse in={isFilterOpen} timeout="auto" unmountOnExit>
            <Divider />

            <Box sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="stretch">
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomFormLabel htmlFor="ppdb_test_session_id" sx={{ mt: 0 }}>
                    Sesi Tes
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_test_session_id"
                    name="ppdb_test_session_id"
                    value={sessionId}
                    onChange={(e) => {
                      const nextSessionId = e.target.value;

                      const next = new URLSearchParams(sp);
                      if (!nextSessionId) next.delete('ppdb_test_session_id');
                      else next.set('ppdb_test_session_id', nextSessionId);

                      next.delete('ppdb_test_session_room_id');
                      next.set('page', '0');
                      setSp(next);
                    }}
                    fullWidth
                    displayEmpty
                    disabled={isLoadingSessions}
                    inputProps={{ 'aria-label': 'Pilih Sesi Tes' }}
                    MenuProps={MENU_PROPS}
                  >
                    <MenuItem value="">
                      {isLoadingSessions ? 'Memuat sesi...' : 'Semua Sesi Tes'}
                    </MenuItem>
                    {sessionOptions.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.title} — {String(s.mode || '').toUpperCase()} · {String(s.status || '').toUpperCase()}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Pilih sesi untuk menampilkan peserta dan memuat room.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomFormLabel htmlFor="ppdb_test_session_room_id" sx={{ mt: 0 }}>
                    Room Sesi
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_test_session_room_id"
                    name="ppdb_test_session_room_id"
                    value={sessionRoomId}
                    onChange={(e) => setParam('ppdb_test_session_room_id', e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!sessionId || isLoadingRooms || (Array.isArray(roomOptions) ? roomOptions.length : 0) === 0}
                    inputProps={{ 'aria-label': 'Pilih Room Sesi' }}
                    MenuProps={MENU_PROPS}
                  >
                    <MenuItem value="">
                      {!sessionId
                        ? 'Pilih sesi dulu'
                        : isLoadingRooms
                          ? 'Memuat room...'
                          : (Array.isArray(roomOptions) ? roomOptions.length : 0) === 0
                            ? 'Sesi ini tidak punya room'
                            : 'Semua Room'}
                    </MenuItem>
                    {(Array.isArray(roomOptions) ? roomOptions : []).map((r) => {
                      const label =
                        r?.label ||
                        r?.room_label ||
                        r?.Room?.code ||
                        r?.Room?.nama ||
                        r?.online_url ||
                        r?.id;

                      return (
                        <MenuItem key={r.id} value={r.id}>
                          {label}
                        </MenuItem>
                      );
                    })}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {!sessionId
                      ? 'Pilih sesi dulu untuk menampilkan pilihan room.'
                      : 'Opsional: pilih room untuk mempersempit data.'}
                  </Typography>
                </Grid>
              </Grid>

              {!sessionId ? (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tips: pilih <b>Sesi Tes</b> agar daftar peserta lebih relevan. Tombol <b>Tambah Peserta</b> tetap bisa dipakai dan sesi dapat dipilih di halaman tambah.
                  </Typography>
                </Box>
              ) : requiresRoom && !sessionRoomId ? (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Sesi ini punya pembagian room. Kamu bisa memilih <b>Room Sesi</b> untuk mempersempit data, atau pilih room nanti saat tambah peserta.
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </Collapse>
        </Paper>

        {/* Status cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {STATUS_CARDS.map((c) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={c.key}>
              <StatCard
                active={String(status || '').toUpperCase() === c.key}
                title={c.label}
                value={summary?.by_status?.[c.key] ?? 0}
                helper={c.helper}
                onClick={() => setParam('status', String(status || '').toUpperCase() === c.key ? '' : c.key)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Active chips + total */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {activeFilterChips.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Menampilkan semua peserta (disarankan filter minimal by session).
              </Typography>
            ) : (
              <>
                {activeFilterChips.map((c) => (
                  <Chip key={c.key} label={c.label} onDelete={() => setParam(c.key, '')} />
                ))}
                <Chip label="Reset Filter" color="warning" onClick={clearAllFilters} />
              </>
            )}

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              {isLoading ? <CircularProgress size={18} /> : null}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total: <b>{summary?.total ?? 0}</b>
              </Typography>
            </Stack>
          </Box>
        </Paper>

        {/* Table */}
        <PpdbPesertaTesTable
          participantList={participantList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={Number(meta?.total || 0)}
          handleChangePage={(_, p) => setParam('page', String(p))}
          handleChangeRowsPerPage={(e) => {
            const v = parseInt(e.target.value, 10);
            const next = new URLSearchParams(sp);
            next.set('limit', String(v));
            next.set('page', '0');
            setSp(next);
          }}
          handleView={(id) => navigate(`/dashboard/admin-sekolah/ppdb-test-participants/detail/${id}`)}
          onAction={(type, p) => openAction(type, p)}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.response?.data?.msg || error?.message}
          sessionId={sessionId}
          sessionRoomId={sessionRoomId}
        />

        {/* ===================== ACTION DIALOGS ===================== */}
        <Dialog open={actionState.open} onClose={() => !isMutating && closeAction()} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 800 }}>
            {actionState.type === 'EDIT_SEAT' ? 'Ubah Seat Peserta' : null}
            {actionState.type === 'RESCHEDULE' ? 'Reschedule Peserta' : null}
            {actionState.type === 'REVOKE_QR' ? 'Revoke QR Peserta' : null}
            {actionState.type === 'REGENERATE_QR' ? 'Regenerate QR Peserta' : null}
            {actionState.type === 'CANCEL' ? 'Batalkan Peserta Tes' : null}
          </DialogTitle>

          <DialogContent>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <b>{participantTitle}</b>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
              {participantMeta}
            </Typography>

            {gateForParticipant.ok ? null : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {gateForParticipant.msg || 'Aksi dibatasi oleh status sesi.'}
              </Alert>
            )}

            {dialogErrorMsg ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {dialogErrorMsg}
              </Alert>
            ) : null}

            {/* EDIT SEAT */}
            {actionState.type === 'EDIT_SEAT' ? (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Seat number"
                  value={seatValue}
                  onChange={(e) => setSeatValue(e.target.value)}
                  helperText="Kosongkan untuk reset seat."
                  disabled={!gateForParticipant.ok || isMutating}
                />
              </Box>
            ) : null}

            {/* REVOKE QR */}
            {actionState.type === 'REVOKE_QR' ? (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Alasan (opsional)"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  helperText="Alasan akan dicatat untuk audit."
                  disabled={!gateForParticipant.ok || isMutating}
                />
              </Box>
            ) : null}

            {/* RESCHEDULE */}
            {actionState.type === 'RESCHEDULE' ? (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Sesi tujuan"
                      value={targetSessionId}
                      onChange={(e) => {
                        setTargetSessionId(e.target.value);
                        setTargetRoomId('');
                      }}
                      disabled={!gateForParticipant.ok || isMutating}
                      helperText="Boleh pindah sesi (opsional). Default tetap sesi yang sama."
                    >
                      {sessionOptions.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.title} — {String(s.mode || '').toUpperCase()} · {String(s.status || '').toUpperCase()}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Room tujuan"
                      value={targetRoomId}
                      onChange={(e) => setTargetRoomId(e.target.value)}
                      disabled={!gateForParticipant.ok || isMutating || !targetSessionId || isLoadingRescheduleRooms}
                      helperText={
                        !targetSessionId
                          ? 'Pilih sesi dulu.'
                          : isLoadingRescheduleRooms
                            ? 'Memuat room...'
                            : isErrorRescheduleRooms
                              ? (rescheduleRoomError?.response?.data?.msg || rescheduleRoomError?.message || 'Gagal memuat room')
                              : 'Wajib pilih room tujuan.'
                      }
                    >
                      {rescheduleRooms.map((r) => {
                        const label =
                          r?.label ||
                          r?.room_label ||
                          r?.Room?.code ||
                          r?.Room?.nama ||
                          r?.online_url ||
                          r?.id;

                        return (
                          <MenuItem key={r.id} value={r.id}>
                            {label}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Seat (opsional)"
                      value={targetSeat}
                      onChange={(e) => setTargetSeat(e.target.value)}
                      helperText="Kosongkan untuk reset seat."
                      disabled={!gateForParticipant.ok || isMutating}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={regenerateQr}
                            onChange={(e) => setRegenerateQr(e.target.checked)}
                            disabled={!gateForParticipant.ok || isMutating}
                          />
                        }
                        label="Regenerate QR"
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Disarankan aktif agar QR lama tidak valid untuk sesi/ruang baru.
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ) : null}

            {/* CANCEL */}
            {actionState.type === 'CANCEL' ? (
              <Box sx={{ mt: 2 }}>
                <Alert severity="warning">
                  Pembatalan akan:
                  <ul style={{ margin: '8px 0 0 18px' }}>
                    <li>mengubah status peserta menjadi <b>CANCELLED</b></li>
                    <li>mereset seat</li>
                    <li>menonaktifkan QR</li>
                    <li>melepas enrollment (anti-retake tetap terjaga sesuai controller)</li>
                  </ul>
                </Alert>

                <TextField
                  fullWidth
                  size="small"
                  label="Alasan (opsional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  sx={{ mt: 2 }}
                  helperText="Alasan akan dicatat untuk audit."
                  disabled={!gateForParticipant.ok || isMutating}
                />
              </Box>
            ) : null}

            {/* REGENERATE QR */}
            {actionState.type === 'REGENERATE_QR' ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                QR lama akan diganti token baru. Pastikan peserta menerima QR terbaru.
              </Alert>
            ) : null}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="text" onClick={closeAction} disabled={isMutating}>
              Batal
            </Button>

            {actionState.type === 'EDIT_SEAT' ? (
              <Button
                variant="contained"
                disabled={!gateForParticipant.ok || isMutating || !participant?.id}
                onClick={() => {
                  updateSeatMutation.mutate({
                    id: participant.id,
                    seat_number: seatValue ? String(seatValue).trim() : null,
                  });
                }}
              >
                Simpan
              </Button>
            ) : null}

            {actionState.type === 'REVOKE_QR' ? (
              <Button
                variant="contained"
                color="warning"
                disabled={!gateForParticipant.ok || isMutating || !participant?.id}
                onClick={() => {
                  revokeQrMutation.mutate({
                    id: participant.id,
                    reason: revokeReason ? String(revokeReason).trim() : null,
                  });
                }}
              >
                Revoke
              </Button>
            ) : null}

            {actionState.type === 'REGENERATE_QR' ? (
              <Button
                variant="contained"
                disabled={!gateForParticipant.ok || isMutating || !participant?.id}
                onClick={() => regenerateQrMutation.mutate({ id: participant.id })}
              >
                Regenerate
              </Button>
            ) : null}

            {actionState.type === 'RESCHEDULE' ? (
              <Button
                variant="contained"
                disabled={!gateForParticipant.ok || isMutating || !participant?.id || !targetRoomId}
                onClick={() => {
                  rescheduleMutation.mutate({
                    id: participant.id,
                    ppdb_test_session_id: targetSessionId ? String(targetSessionId) : null,
                    ppdb_test_session_room_id: String(targetRoomId),
                    seat_number: targetSeat ? String(targetSeat).trim() : null,
                    regenerate_qr: regenerateQr === true,
                  });
                }}
              >
                Reschedule
              </Button>
            ) : null}

            {actionState.type === 'CANCEL' ? (
              <Button
                variant="contained"
                color="error"
                disabled={!gateForParticipant.ok || isMutating || !participant?.id}
                onClick={() => {
                  cancelMutation.mutate({
                    id: participant.id,
                    reason: cancelReason ? String(cancelReason).trim() : null,
                  });
                }}
              >
                Batalkan
              </Button>
            ) : null}
          </DialogActions>
        </Dialog>
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbPesertaTesList;