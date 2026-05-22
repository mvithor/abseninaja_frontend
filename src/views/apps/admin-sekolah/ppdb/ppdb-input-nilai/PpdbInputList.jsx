import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Button,
  MenuItem,
  Collapse,
  Divider,
  Stack,
} from '@mui/material';
import Alerts from 'src/components/alerts/Alerts';
import SearchButton from 'src/components/button-group/SearchButton';
import FilterButton from 'src/components/button-group/FilterButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import PpdbInputNilaiTable from 'src/apps/admin-sekolah/ppdb/ppdb-input-nilai/PpdbInputNilaiTable';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

const NILAI_STATUS_LABEL = {
  ALL: 'Semua',
  GRADED: 'Sudah dinilai',
  UNGRADED: 'Belum dinilai',
  NEEDS_ATTENTION: 'Perlu diproses',
};

const ATTENDANCE_STATUS_LABEL = {
  ALL: 'Semua',
  NOT_CHECKED_IN: 'Belum check-in',
  PRESENT: 'Hadir',
  LATE: 'Terlambat',
  ABSENT: 'Absen',
  DISQUALIFIED: 'Diskualifikasi',
};

const STATUS_CARDS = [
  { key: 'GRADED', label: NILAI_STATUS_LABEL.GRADED, helper: 'Result FINAL sudah tersimpan.' },
  { key: 'NEEDS_ATTENTION', label: NILAI_STATUS_LABEL.NEEDS_ATTENTION, helper: 'Hadir/Late tapi belum dinilai.' },
  { key: 'UNGRADED', label: NILAI_STATUS_LABEL.UNGRADED, helper: 'Belum ada nilai (umumnya belum check-in / belum diproses).' },
];

const prettyNilaiStatus = (s) => {
  const k = String(s || '').toUpperCase();
  return NILAI_STATUS_LABEL[k] || (k ? `Legacy: ${k}` : '-');
};

const API_BASE = '/api/v1/admin-sekolah/ppdb-test-results';

// ✅ dropdown endpoints
const API_DD_PERIOD = '/api/v1/admin-sekolah/dropdown/ppdb-period';
const API_DD_COMPONENT = '/api/v1/admin-sekolah/dropdown/ppdb-komponen-tes';
const API_DD_SESSION = '/api/v1/admin-sekolah/dropdown/ppdb-test-session';
const API_DD_SESSION_ROOM = '/api/v1/admin-sekolah/dropdown/ppdb-test-session-rooms';

// ===== helper: pastikan value select valid terhadap options =====
const coerceSelectValue = (value, options = [], getValue = (o) => o?.id) => {
  const v = String(value || '');
  if (!v) return '';
  const exists = Array.isArray(options) && options.some((o) => String(getValue(o) || '') === v);
  return exists ? v : '';
};

const fetchNilaiList = async ({ page, limit, q, nilaiStatus, attendanceStatus, periodId, componentId, sessionId, sessionRoomId }) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  // ✅ wajib
  params.set('ppdb_period_id', String(periodId));

  if (q) params.set('q', q);

  if (nilaiStatus && String(nilaiStatus).toUpperCase() !== 'ALL') params.set('nilai_status', nilaiStatus);
  if (attendanceStatus && String(attendanceStatus).toUpperCase() !== 'ALL') params.set('attendance_status', attendanceStatus);

  if (componentId) params.set('ppdb_test_component_id', componentId);
  if (sessionId) params.set('ppdb_test_session_id', sessionId);
  if (sessionRoomId) params.set('ppdb_test_session_room_id', sessionRoomId);

  const res = await axiosInstance.get(`${API_BASE}?${params.toString()}`);

  const meta = res.data?.meta || { page: 1, limit, total: 0, total_pages: 1, summary: { total: 0, GRADED: 0, UNGRADED: 0, NEEDS_ATTENTION: 0 } };
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];

  return { data: rows, meta };
};

// ===== dropdown fetchers =====
const fetchPeriodDropdown = async () => {
  const params = new URLSearchParams();
  params.set('exclude_archived', 'true');
  params.set('limit', '200');
  const res = await axiosInstance.get(`${API_DD_PERIOD}?${params.toString()}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchComponentDropdown = async ({ periodId }) => {
  if (!periodId) return [];
  const params = new URLSearchParams();
  params.set('ppdb_period_id', periodId);
  params.set('limit', '200');
  const res = await axiosInstance.get(`${API_DD_COMPONENT}?${params.toString()}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchSessionDropdown = async ({ periodId, componentId }) => {
  if (!periodId) return [];
  const params = new URLSearchParams();
  params.set('ppdb_period_id', periodId);
  params.set('limit', '200');
  if (componentId) params.set('ppdb_test_component_id', componentId);
  const res = await axiosInstance.get(`${API_DD_SESSION}?${params.toString()}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchSessionRoomDropdown = async ({ sessionId }) => {
  if (!sessionId) return [];
  const params = new URLSearchParams();
  params.set('ppdb_test_session_id', sessionId);
  params.set('limit', '200');
  const res = await axiosInstance.get(`${API_DD_SESSION_ROOM}?${params.toString()}`);
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

const PpdbInputNilaiList = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const page = Math.max(0, Number(sp.get('page') || 0));
  const rowsPerPage = Math.max(5, Number(sp.get('limit') || 10));

  const q = String(sp.get('q') || '');
  const nilaiStatus = String(sp.get('nilai_status') || 'ALL');
  const attendanceStatus = String(sp.get('attendance_status') || 'ALL');

  // ✅ period wajib
  const periodId = String(sp.get('ppdb_period_id') || '');

  const componentId = String(sp.get('ppdb_test_component_id') || '');
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

    // ✅ jangan hapus period (karena wajib)
    next.delete('ppdb_test_component_id');
    next.delete('ppdb_test_session_id');
    next.delete('ppdb_test_session_room_id');

    next.delete('nilai_status');
    next.delete('attendance_status');
    next.delete('q');

    next.set('page', '0');
    setSp(next);
  };

  const hasAnyFilter = !!(
    q ||
    (nilaiStatus && nilaiStatus !== 'ALL') ||
    (attendanceStatus && attendanceStatus !== 'ALL') ||
    componentId ||
    sessionId ||
    sessionRoomId
  );

  // ===== Period dropdown (wajib) =====
  const { data: periodOptions = [], isLoading: isPeriodLoading } = useQuery({
    queryKey: ['ppdb-dd-period'],
    queryFn: fetchPeriodDropdown,
    refetchOnWindowFocus: false,
  });

  // ===== Dependent dropdowns =====
  const { data: componentOptions = [], isLoading: isComponentLoading } = useQuery({
    queryKey: ['ppdb-dd-component', periodId],
    queryFn: () => fetchComponentDropdown({ periodId }),
    enabled: Boolean(periodId),
    refetchOnWindowFocus: false,
  });

  const { data: sessionOptions = [], isLoading: isSessionLoading } = useQuery({
    queryKey: ['ppdb-dd-session', periodId, componentId],
    queryFn: () => fetchSessionDropdown({ periodId, componentId: componentId || null }),
    enabled: Boolean(periodId),
    refetchOnWindowFocus: false,
  });

  const { data: sessionRoomOptions = [], isLoading: isSessionRoomLoading } = useQuery({
    queryKey: ['ppdb-dd-session-room', sessionId],
    queryFn: () => fetchSessionRoomDropdown({ sessionId: sessionId || null }),
    enabled: Boolean(sessionId),
    refetchOnWindowFocus: false,
  });

  // ✅ safe select values (hindari out-of-range saat URL punya id ghost)
  const safePeriodId = useMemo(
    () => coerceSelectValue(periodId, periodOptions),
    [periodId, periodOptions]
  );

  const safeComponentId = useMemo(
    () => coerceSelectValue(componentId, componentOptions),
    [componentId, componentOptions]
  );

  const safeSessionId = useMemo(
    () => coerceSelectValue(sessionId, sessionOptions),
    [sessionId, sessionOptions]
  );

  const safeSessionRoomId = useMemo(
    () => coerceSelectValue(sessionRoomId, sessionRoomOptions),
    [sessionRoomId, sessionRoomOptions]
  );

  const periodLabelMap = useMemo(() => {
    const m = new Map();
    periodOptions.forEach((p) => m.set(p.id, `${p.nama} • ${String(p.status || '').toUpperCase()} • TA ${p.tahun_ajaran || '-'}`));
    return m;
  }, [periodOptions]);

  const componentLabelMap = useMemo(() => {
    const m = new Map();
    componentOptions.forEach((c) => {
      const code = c.code ? `${c.code} • ` : '';
      m.set(c.id, `${code}${c.nama || '-'} • ${String(c.type || '').toUpperCase()}`);
    });
    return m;
  }, [componentOptions]);

  const sessionLabelMap = useMemo(() => {
    const m = new Map();
    sessionOptions.forEach((s) => {
      m.set(s.id, `${s.title || '-'} • ${String(s.status || '').toUpperCase()}`);
    });
    return m;
  }, [sessionOptions]);

  const sessionRoomLabelMap = useMemo(() => {
    const m = new Map();
    sessionRoomOptions.forEach((r) => {
      const label = r.room_label || r.nama || '-';
      const mode = r.mode ? String(r.mode).toUpperCase() : '-';
      m.set(r.id, `${label} • ${mode}`);
    });
    return m;
  }, [sessionRoomOptions]);

  const getMapLabel = (mapLike, id) => {
    if (!id) return null;
    if (!(mapLike instanceof Map)) return '-';
    const v = mapLike.get(id);
    return v ? v : '-';
  };

  // ===== data query =====
  const queryKey = useMemo(
    () => [
      'ppdb-test-results-list',
      { page, rowsPerPage, q, nilaiStatus, attendanceStatus, periodId: safePeriodId, componentId: safeComponentId, sessionId: safeSessionId, sessionRoomId: safeSessionRoomId }
    ],
    [page, rowsPerPage, q, nilaiStatus, attendanceStatus, safePeriodId, safeComponentId, safeSessionId, safeSessionRoomId]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    enabled: Boolean(safePeriodId), // ✅ jangan query list sebelum period dipilih & valid
    queryFn: () =>
      fetchNilaiList({
        page: page + 1,
        limit: rowsPerPage,
        q: q || null,
        nilaiStatus: nilaiStatus || 'ALL',
        attendanceStatus: attendanceStatus || 'ALL',
        periodId: safePeriodId,
        componentId: safeComponentId || null,
        sessionId: safeSessionId || null,
        sessionRoomId: safeSessionRoomId || null,
      }),
    keepPreviousData: true,
  });

  const rows = useMemo(() => {
    return Array.isArray(data?.data) ? data.data : [];
  }, [data?.data]);

  const meta = useMemo(() => {
    return data?.meta || {};
  }, [data?.meta]);

  // ✅ summary sekarang dari backend (global-by-filter)
  const summary = useMemo(() => {
    const s = meta?.summary || {};
    return {
      total: Number(s.total || 0),
      GRADED: Number(s.GRADED || 0),
      NEEDS_ATTENTION: Number(s.NEEDS_ATTENTION || 0),
      UNGRADED: Number(s.UNGRADED || 0),
    };
  }, [meta?.summary]);

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (safePeriodId) chips.push({ key: 'ppdb_period_id', label: `Period: ${getMapLabel(periodLabelMap, safePeriodId) || '-'}` });
    if (safeComponentId) chips.push({ key: 'ppdb_test_component_id', label: `Komponen: ${getMapLabel(componentLabelMap, safeComponentId) || '-'}` });
    if (safeSessionId) chips.push({ key: 'ppdb_test_session_id', label: `Sesi: ${getMapLabel(sessionLabelMap, safeSessionId) || '-'}` });
    if (safeSessionRoomId) chips.push({ key: 'ppdb_test_session_room_id', label: `Ruang: ${getMapLabel(sessionRoomLabelMap, safeSessionRoomId) || '-'}` });

    if (nilaiStatus && nilaiStatus !== 'ALL') chips.push({ key: 'nilai_status', label: `Status Nilai: ${prettyNilaiStatus(nilaiStatus)}` });
    if (attendanceStatus && attendanceStatus !== 'ALL') chips.push({ key: 'attendance_status', label: `Check-in: ${ATTENDANCE_STATUS_LABEL[String(attendanceStatus).toUpperCase()] || attendanceStatus}` });

    if (q) chips.push({ key: 'q', label: `Cari: ${q}` });

    return chips;
  }, [
    safePeriodId,
    safeComponentId,
    safeSessionId,
    safeSessionRoomId,
    nilaiStatus,
    attendanceStatus,
    q,
    periodLabelMap,
    componentLabelMap,
    sessionLabelMap,
    sessionRoomLabelMap
  ]);

  // ===== Handlers =====
  const onChangePeriod = (val) => {
    const next = new URLSearchParams(sp);

    if (!val) {
      // period wajib -> kalau kosongkan, bersihkan semua dependent
      next.delete('ppdb_period_id');
      next.delete('ppdb_test_component_id');
      next.delete('ppdb_test_session_id');
      next.delete('ppdb_test_session_room_id');
    } else {
      next.set('ppdb_period_id', val);

      // period berubah => reset dependent
      next.delete('ppdb_test_component_id');
      next.delete('ppdb_test_session_id');
      next.delete('ppdb_test_session_room_id');
    }

    next.set('page', '0');
    setSp(next);
  };

  const onChangeComponent = (val) => {
    const next = new URLSearchParams(sp);
    if (!val) next.delete('ppdb_test_component_id');
    else next.set('ppdb_test_component_id', val);

    next.delete('ppdb_test_session_id');
    next.delete('ppdb_test_session_room_id');

    next.set('page', '0');
    setSp(next);
  };

  const onChangeSession = (val) => {
    const next = new URLSearchParams(sp);
    if (!val) next.delete('ppdb_test_session_id');
    else next.set('ppdb_test_session_id', val);

    next.delete('ppdb_test_session_room_id');

    next.set('page', '0');
    setSp(next);
  };

  const onChangeRoom = (val) => setParam('ppdb_test_session_room_id', val);

  return (
    <PageContainer title="Input Nilai PMB" description="Input Nilai PMB">
      <ParentCard title="Input Nilai PMB">
        {/* ✅ kalau period belum dipilih, tampilkan warning UX yang tegas */}
        {!safePeriodId ? (
          <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 800 }}>
              Pilih PPDB Period terlebih dahulu
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.6, color: 'text.secondary' }}>
              Period wajib karena list, komponen, sesi, dan ruang semuanya bergantung pada period.
            </Typography>
          </Paper>
        ) : null}

        {isError ? (
          <Alerts error={error?.response?.data?.msg || error?.message || 'Gagal memuat input nilai'} />
        ) : null}

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%', mb: 2 }}>
          <SearchButton
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Cari (nama / kode pendaftaran)"
            disabled={!safePeriodId}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box onClick={() => setIsFilterOpen((v) => !v)} sx={{ display: 'inline-flex' }}>
              <FilterButton />
            </Box>

            <Button variant="contained" onClick={() => setParam('page', '0')} disabled={!safePeriodId}>
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Filter Card */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2 }}>
                Filter Input Nilai
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
                Period wajib. Lalu persempit komponen/sesi/ruang + status nilai & check-in.
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
                {/* ✅ Period */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 0 }}>
                    PPDB Period
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_period_id"
                    name="ppdb_period_id"
                    value={safePeriodId}
                    onChange={(e) => onChangePeriod(e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={isPeriodLoading}
                    inputProps={{ 'aria-label': 'Pilih Period' }}
                    MenuProps={{
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' },
                      PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                    }}
                  >
                    <MenuItem value="">
                      {isPeriodLoading ? 'Memuat...' : 'Pilih Period'}
                    </MenuItem>
                    {periodOptions.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nama} • {String(p.status || '').toUpperCase()} • TA {p.tahun_ajaran || '-'}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Wajib dipilih.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="ppdb_test_component_id" sx={{ mt: 0 }}>
                    Komponen Tes
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_test_component_id"
                    name="ppdb_test_component_id"
                    value={safeComponentId}
                    onChange={(e) => onChangeComponent(e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!safePeriodId}
                    inputProps={{ 'aria-label': 'Pilih Komponen' }}
                    MenuProps={{
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' },
                      PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                    }}
                  >
                    <MenuItem value="">
                      {!safePeriodId ? 'Pilih period dulu' : (isComponentLoading ? 'Memuat...' : 'Semua Komponen')}
                    </MenuItem>
                    {componentOptions.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.code ? `${c.code} • ` : ''}{c.nama || '-'} • {String(c.type || '').toUpperCase()}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {!safePeriodId ? 'Pilih period dulu.' : 'Opsional. Filter per komponen.'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="ppdb_test_session_id" sx={{ mt: 0 }}>
                    Sesi Tes
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_test_session_id"
                    name="ppdb_test_session_id"
                    value={safeSessionId}
                    onChange={(e) => onChangeSession(e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!safePeriodId}
                    inputProps={{ 'aria-label': 'Pilih Sesi' }}
                    MenuProps={{
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' },
                      PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                    }}
                  >
                    <MenuItem value="">
                      {!safePeriodId ? 'Pilih period dulu' : (isSessionLoading ? 'Memuat...' : 'Semua Sesi')}
                    </MenuItem>
                    {sessionOptions.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.title || '-'} • {String(s.status || '').toUpperCase()}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {!safePeriodId ? 'Pilih period dulu.' : 'Opsional. Filter per sesi.'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="ppdb_test_session_room_id" sx={{ mt: 0 }}>
                    Ruang
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_test_session_room_id"
                    name="ppdb_test_session_room_id"
                    value={safeSessionRoomId}
                    onChange={(e) => onChangeRoom(e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!safeSessionId}
                    inputProps={{ 'aria-label': 'Pilih Ruang' }}
                    MenuProps={{
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' },
                      PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                    }}
                  >
                    <MenuItem value="">
                      {!safeSessionId ? 'Pilih sesi dulu' : (isSessionRoomLoading ? 'Memuat...' : 'Semua Ruang')}
                    </MenuItem>
                    {sessionRoomOptions.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {(r.room_label || r.nama || '-')}{' • '}{String(r.mode || '-').toUpperCase()}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {!safeSessionId ? 'Pilih sesi dulu.' : 'Opsional. Filter per ruang.'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="nilai_status" sx={{ mt: 0 }}>
                    Status Nilai
                  </CustomFormLabel>

                  <CustomSelect
                    id="nilai_status"
                    name="nilai_status"
                    value={nilaiStatus}
                    onChange={(e) => setParam('nilai_status', e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!safePeriodId}
                    inputProps={{ 'aria-label': 'Pilih Status Nilai' }}
                    MenuProps={{
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' },
                      PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                    }}
                  >
                    <MenuItem value="ALL">{NILAI_STATUS_LABEL.ALL}</MenuItem>
                    <MenuItem value="GRADED">{NILAI_STATUS_LABEL.GRADED}</MenuItem>
                    <MenuItem value="NEEDS_ATTENTION">{NILAI_STATUS_LABEL.NEEDS_ATTENTION}</MenuItem>
                    <MenuItem value="UNGRADED">{NILAI_STATUS_LABEL.UNGRADED}</MenuItem>
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Filter status penilaian.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="attendance_status" sx={{ mt: 0 }}>
                    Check-in
                  </CustomFormLabel>

                  <CustomSelect
                    id="attendance_status"
                    name="attendance_status"
                    value={attendanceStatus}
                    onChange={(e) => setParam('attendance_status', e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!safePeriodId}
                    inputProps={{ 'aria-label': 'Pilih Status Check-in' }}
                    MenuProps={{
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' },
                      PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                    }}
                  >
                    <MenuItem value="ALL">{ATTENDANCE_STATUS_LABEL.ALL}</MenuItem>
                    <MenuItem value="NOT_CHECKED_IN">{ATTENDANCE_STATUS_LABEL.NOT_CHECKED_IN}</MenuItem>
                    <MenuItem value="PRESENT">{ATTENDANCE_STATUS_LABEL.PRESENT}</MenuItem>
                    <MenuItem value="LATE">{ATTENDANCE_STATUS_LABEL.LATE}</MenuItem>
                    <MenuItem value="ABSENT">{ATTENDANCE_STATUS_LABEL.ABSENT}</MenuItem>
                    <MenuItem value="DISQUALIFIED">{ATTENDANCE_STATUS_LABEL.DISQUALIFIED}</MenuItem>
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Filter berdasarkan status check-in.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      onClick={clearAllFilters}
                      sx={{ height: 40, alignSelf: 'flex-start', fontWeight: 800, mt: 3.4 }}
                      disabled={!safePeriodId}
                    >
                      Reset Filter
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>

        {/* ✅ Status cards pakai backend summary */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {STATUS_CARDS.map((c) => (
            <Grid key={c.key} size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                active={String(nilaiStatus || '').toUpperCase() === c.key}
                title={c.label}
                value={
                  c.key === 'GRADED'
                    ? (summary?.GRADED ?? 0)
                    : c.key === 'NEEDS_ATTENTION'
                      ? (summary?.NEEDS_ATTENTION ?? 0)
                      : (summary?.UNGRADED ?? 0)
                }
                helper={c.helper}
                onClick={() => setParam('nilai_status', String(nilaiStatus || '').toUpperCase() === c.key ? 'ALL' : c.key)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Active chips + total */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {activeFilterChips.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Menampilkan semua data dalam period terpilih.
              </Typography>
            ) : (
              <>
                {activeFilterChips.map((c) => (
                  <Chip
                    key={c.key}
                    label={c.label}
                    onDelete={() => {
                      // period wajib -> jangan bisa dihapus dari chip
                      if (c.key === 'ppdb_period_id') return;
                      setParam(c.key, '');
                    }}
                  />
                ))}
                <Chip label="Reset Filter" color="warning" onClick={clearAllFilters} />
              </>
            )}

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              {isLoading ? <CircularProgress size={18} /> : null}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total: <b>{Number(meta?.total || 0)}</b>
              </Typography>
            </Stack>
          </Box>
        </Paper>

        {/* Table */}
        <PpdbInputNilaiTable
          rows={rows}
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
          handleViewParticipant={(participant_id) => navigate(`/dashboard/admin-sekolah/ppdb-input-nilai/detail/${participant_id}`)}
          handleOpenApp={(ppdb_application_id) => navigate(`/dashboard/admin-sekolah/ppdb-pendaftar/detail/${ppdb_application_id}`)}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.response?.data?.msg || error?.message}
          hasAnyFilter={hasAnyFilter}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbInputNilaiList;