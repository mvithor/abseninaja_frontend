import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
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
import PpdbNilaiTable from 'src/apps/admin-sekolah/ppdb/ppdb-nilai/PpdbNilaiTable';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

const NILAI_STATUS_LABEL = {
  ALL: 'Semua',
  GRADED: 'Sudah dinilai',
  UNGRADED: 'Belum dinilai',
  NEEDS_ATTENTION: 'Perlu diproses',
};

const STATUS_CARDS = [
  { key: 'GRADED', label: NILAI_STATUS_LABEL.GRADED, helper: 'Nilai sudah diberikan (graded_at/score terisi)' },
  { key: 'NEEDS_ATTENTION', label: NILAI_STATUS_LABEL.NEEDS_ATTENTION, helper: 'Sudah hadir/selesai, tapi belum dinilai' },
  { key: 'UNGRADED', label: NILAI_STATUS_LABEL.UNGRADED, helper: 'Belum dinilai atau belum ikut tes' },
];

const prettyNilaiStatus = (s) => {
  const k = String(s || '').toUpperCase();
  return NILAI_STATUS_LABEL[k] || (k ? `Legacy: ${k}` : '-');
};

const getSafeMapLabel = (mapLike, id) => {
  if (!id) return null;
  if (!(mapLike instanceof Map)) return '-';
  const v = mapLike.get(id);
  return v ? v : '-';
};

const API_BASE = '/api/v1/admin-sekolah/ppdb-nilai-monitor';

// ====== DROPDOWN ENDPOINTS ======
const API_DD_PERIOD = '/api/v1/admin-sekolah/dropdown/ppdb-period';
const API_DD_WAVETRACK = '/api/v1/admin-sekolah/dropdown/ppdb-wave-track';
const API_DD_COMPONENT = '/api/v1/admin-sekolah/dropdown/ppdb-komponen-tes';
const API_DD_SESSION = '/api/v1/admin-sekolah/dropdown/ppdb-test-session';

const MENU_PROPS = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
};

const fetchNilaiMonitor = async ({ page, limit, q, status, periodId, waveTrackId, componentId, sessionId }) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  if (q) params.set('q', q);
  if (status && String(status).toUpperCase() !== 'ALL') params.set('status', status);

  if (periodId) params.set('ppdb_period_id', periodId);
  if (waveTrackId) params.set('ppdb_wave_track_id', waveTrackId);
  if (componentId) params.set('ppdb_test_component_id', componentId);
  if (sessionId) params.set('ppdb_test_session_id', sessionId);

  const res = await axiosInstance.get(`${API_BASE}?${params.toString()}`);

  const meta = res.data?.meta || { page: 1, limit, offset: 0, count: 0 };
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  const summary = res.data?.meta?.summary || { total: 0, GRADED: 0, UNGRADED: 0, NEEDS_ATTENTION: 0, NO_PARTICIPANT: 0 };

  return { data: rows, meta, summary };
};

// ====== Dropdown fetchers ======
const fetchPeriodDropdown = async () => {
  const params = new URLSearchParams();
  params.set('exclude_archived', 'true');
  params.set('limit', '100');
  const res = await axiosInstance.get(`${API_DD_PERIOD}?${params.toString()}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchWaveTrackDropdown = async ({ periodId }) => {
  if (!periodId) return [];
  const params = new URLSearchParams();
  params.set('ppdb_period_id', periodId);
  params.set('limit', '100');
  const res = await axiosInstance.get(`${API_DD_WAVETRACK}?${params.toString()}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchComponentDropdown = async ({ periodId }) => {
  if (!periodId) return [];
  const params = new URLSearchParams();
  params.set('ppdb_period_id', periodId);
  params.set('limit', '100');
  const res = await axiosInstance.get(`${API_DD_COMPONENT}?${params.toString()}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchSessionDropdown = async ({ periodId, waveTrackId, componentId }) => {
  if (!periodId) return [];
  const params = new URLSearchParams();
  params.set('ppdb_period_id', periodId);
  params.set('limit', '100');

  if (waveTrackId) params.set('ppdb_wave_track_id', waveTrackId);
  if (componentId) params.set('ppdb_test_component_id', componentId);

  const res = await axiosInstance.get(`${API_DD_SESSION}?${params.toString()}`);
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

const PpdbNilaiList = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const page = Math.max(0, Number(sp.get('page') || 0)); 
  const rowsPerPage = Math.max(5, Number(sp.get('limit') || 10));

  const q = String(sp.get('q') || '');
  const status = String(sp.get('status') || 'ALL');

  const periodId = String(sp.get('ppdb_period_id') || '');
  const waveTrackId = String(sp.get('ppdb_wave_track_id') || '');
  const componentId = String(sp.get('ppdb_test_component_id') || '');
  const sessionId = String(sp.get('ppdb_test_session_id') || '');

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

    next.delete('ppdb_period_id');
    next.delete('ppdb_wave_track_id');
    next.delete('ppdb_test_component_id');
    next.delete('ppdb_test_session_id');

    next.delete('status');
    next.delete('q');

    next.set('page', '0');
    setSp(next);
  };

  const hasAnyFilter = !!(q || (status && status !== 'ALL') || periodId || waveTrackId || componentId || sessionId);

  // ===== Dropdown queries =====
  const { data: periodOptions = [], isLoading: isPeriodLoading } = useQuery({
    queryKey: ['ppdb-dd-period'],
    queryFn: fetchPeriodDropdown,
    refetchOnWindowFocus: false,
  });

  const { data: waveTrackOptions = [], isLoading: isWaveTrackLoading } = useQuery({
    queryKey: ['ppdb-dd-wavetrack', periodId],
    queryFn: () => fetchWaveTrackDropdown({ periodId }),
    enabled: Boolean(periodId),
    refetchOnWindowFocus: false,
  });

  const { data: componentOptions = [], isLoading: isComponentLoading } = useQuery({
    queryKey: ['ppdb-dd-component', periodId],
    queryFn: () => fetchComponentDropdown({ periodId }),
    enabled: Boolean(periodId),
    refetchOnWindowFocus: false,
  });

  const { data: sessionOptions = [], isLoading: isSessionLoading } = useQuery({
    queryKey: ['ppdb-dd-session', periodId, waveTrackId, componentId],
    queryFn: () => fetchSessionDropdown({ periodId, waveTrackId, componentId }),
    enabled: Boolean(periodId),
    refetchOnWindowFocus: false,
  });

  // label maps untuk chip
  const periodLabelMap = useMemo(() => {
    const m = new Map();
    periodOptions.forEach((p) => m.set(p.id, `${p.nama} • ${String(p.status || '').toUpperCase()} • TA ${p.tahun_ajaran || '-'}`));
    return m;
  }, [periodOptions]);

  const waveTrackLabelMap = useMemo(() => {
    const m = new Map();
    waveTrackOptions.forEach((w) => {
      const wave = w.wave_nama || '-';
      const track = w.track_nama || '-';
      const kode = w.track_kode ? ` (${w.track_kode})` : '';
      const open = w.is_open === true ? 'OPEN' : w.is_open === false ? 'CLOSED' : '-';
      m.set(w.id, `${wave} • ${track}${kode} • ${open}`);
    });
    return m;
  }, [waveTrackOptions]);

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
      m.set(s.id, `${s.title || '-'} • ${String(s.mode || '').toUpperCase()} • ${String(s.status || '').toUpperCase()}`);
    });
    return m;
  }, [sessionOptions]);

  // ===== data query =====
  const queryKey = useMemo(
    () => ['ppdb-nilai-monitor', { page, rowsPerPage, q, status, periodId, waveTrackId, componentId, sessionId }],
    [page, rowsPerPage, q, status, periodId, waveTrackId, componentId, sessionId]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      fetchNilaiMonitor({
        page: page + 1,
        limit: rowsPerPage,
        q: q || null,
        status: status || 'ALL',
        periodId: periodId || null,
        waveTrackId: waveTrackId || null,
        componentId: componentId || null,
        sessionId: sessionId || null,
      }),
    keepPreviousData: true,
  });

  const rows = data?.data || [];
  const meta = data?.meta || {};
  const summary = data?.summary || {};

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (periodId) chips.push({ key: 'ppdb_period_id', label: `Period: ${getSafeMapLabel(periodLabelMap, periodId) || '-'}` });
    if (waveTrackId) chips.push({ key: 'ppdb_wave_track_id', label: `WaveTrack: ${getSafeMapLabel(waveTrackLabelMap, waveTrackId) || '-'}` });
    if (componentId) chips.push({ key: 'ppdb_test_component_id', label: `Component: ${getSafeMapLabel(componentLabelMap, componentId) || '-'}` });
    if (sessionId) chips.push({ key: 'ppdb_test_session_id', label: `Session: ${getSafeMapLabel(sessionLabelMap, sessionId) || '-'}` });

    if (status && status !== 'ALL') chips.push({ key: 'status', label: `Status: ${prettyNilaiStatus(status)}` });
    if (q) chips.push({ key: 'q', label: `Cari: ${q}` });

    return chips;
  }, [periodId, waveTrackId, componentId, sessionId, status, q, periodLabelMap, waveTrackLabelMap, componentLabelMap, sessionLabelMap]);

  // ===== Handlers =====
  const onChangePeriod = (val) => {
    const next = new URLSearchParams(sp);

    if (!val) {
      next.delete('ppdb_period_id');
      next.delete('ppdb_wave_track_id');
      next.delete('ppdb_test_component_id');
      next.delete('ppdb_test_session_id');
    } else {
      next.set('ppdb_period_id', val);
      next.delete('ppdb_wave_track_id');
      next.delete('ppdb_test_component_id');
      next.delete('ppdb_test_session_id');
    }

    next.set('page', '0');
    setSp(next);
  };

  const onChangeWaveTrack = (val) => {
    const next = new URLSearchParams(sp);
    if (!val) next.delete('ppdb_wave_track_id');
    else next.set('ppdb_wave_track_id', val);

    next.delete('ppdb_test_session_id');
    next.set('page', '0');
    setSp(next);
  };

  const onChangeComponent = (val) => {
    const next = new URLSearchParams(sp);
    if (!val) next.delete('ppdb_test_component_id');
    else next.set('ppdb_test_component_id', val);

    next.delete('ppdb_test_session_id');
    next.set('page', '0');
    setSp(next);
  };

  const onChangeSession = (val) => setParam('ppdb_test_session_id', val);

  return (
    <PageContainer title="Monitoring Nilai PPDB" description="Monitoring nilai peserta PPDB">
      <ParentCard title="Monitoring Nilai PPDB">
        {isError ? (
          <Alerts error={error?.response?.data?.msg || error?.message || 'Gagal memuat monitoring nilai'} />
        ) : null}

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%', mb: 2 }}>
          <SearchButton
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Cari (nama / kode pendaftaran)"
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box onClick={() => setIsFilterOpen((v) => !v)} sx={{ display: 'inline-flex' }}>
              <FilterButton />
            </Box>

            <Button variant="contained" onClick={() => setParam('page', '0')}>
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Filter Card (collapsible) */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2 }}>
                Filter Monitoring Nilai
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
                Pilih filter melalui dropdown agar hasil konsisten dan mudah dibaca.
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
                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 0 }}>
                    PPDB Period
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_period_id"
                    name="ppdb_period_id"
                    value={periodId}
                    onChange={(e) => onChangePeriod(e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={isPeriodLoading}
                    inputProps={{ 'aria-label': 'Pilih Period' }}
                    MenuProps={MENU_PROPS}
                  >
                    <MenuItem value="">
                      {isPeriodLoading ? 'Memuat...' : 'Semua Period'}
                    </MenuItem>
                    {periodOptions.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nama} • {String(p.status || '').toUpperCase()} • TA {p.tahun_ajaran || '-'}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Wajib dipilih untuk memuat dropdown lain.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="ppdb_wave_track_id" sx={{ mt: 0 }}>
                    WaveTrack
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_wave_track_id"
                    name="ppdb_wave_track_id"
                    value={waveTrackId}
                    onChange={(e) => onChangeWaveTrack(e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!periodId}
                    inputProps={{ 'aria-label': 'Pilih WaveTrack' }}
                    MenuProps={MENU_PROPS}
                  >
                    <MenuItem value="">
                      {!periodId ? 'Pilih Period dulu' : (isWaveTrackLoading ? 'Memuat...' : 'Semua WaveTrack')}
                    </MenuItem>
                    {waveTrackOptions.map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.wave_nama || '-'} • {w.track_nama || '-'}{w.track_kode ? ` (${w.track_kode})` : ''} • {w.is_open === true ? 'OPEN' : w.is_open === false ? 'CLOSED' : '-'}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {!periodId ? 'Pilih Period dulu.' : 'Opsional. Persempit scope.'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="ppdb_test_component_id" sx={{ mt: 0 }}>
                    Komponen Tes
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_test_component_id"
                    name="ppdb_test_component_id"
                    value={componentId}
                    onChange={(e) => onChangeComponent(e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!periodId}
                    inputProps={{ 'aria-label': 'Pilih Komponen' }}
                    MenuProps={MENU_PROPS}
                  >
                    <MenuItem value="">
                      {!periodId ? 'Pilih Period dulu' : (isComponentLoading ? 'Memuat...' : 'Semua Komponen')}
                    </MenuItem>
                    {componentOptions.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.code ? `${c.code} • ` : ''}{c.nama || '-'} • {String(c.type || '').toUpperCase()}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {!periodId ? 'Pilih Period dulu.' : 'Opsional. Filter per komponen.'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="ppdb_test_session_id" sx={{ mt: 0 }}>
                    Sesi Tes
                  </CustomFormLabel>

                  <CustomSelect
                    id="ppdb_test_session_id"
                    name="ppdb_test_session_id"
                    value={sessionId}
                    onChange={(e) => onChangeSession(e.target.value)}
                    fullWidth
                    displayEmpty
                    disabled={!periodId}
                    inputProps={{ 'aria-label': 'Pilih Sesi' }}
                    MenuProps={MENU_PROPS}
                  >
                    <MenuItem value="">
                      {!periodId ? 'Pilih Period dulu' : (isSessionLoading ? 'Memuat...' : 'Semua Sesi')}
                    </MenuItem>
                    {sessionOptions.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.title || '-'} • {String(s.mode || '').toUpperCase()} • {String(s.status || '').toUpperCase()}
                      </MenuItem>
                    ))}
                  </CustomSelect>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {!periodId ? 'Pilih Period dulu.' : 'Opsional. Filter per sesi.'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <CustomFormLabel htmlFor="status" sx={{ mt: 0 }}>
                    Status Nilai
                  </CustomFormLabel>

                  <CustomSelect
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) => setParam('status', e.target.value)}
                    fullWidth
                    displayEmpty
                    inputProps={{ 'aria-label': 'Pilih Status Nilai' }}
                    MenuProps={MENU_PROPS}
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
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      onClick={clearAllFilters}
                      sx={{ height: 40, alignSelf: 'flex-start', fontWeight: 800, mt: 3.4 }}
                    >
                      Reset Filter
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>

        {/* Status cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {STATUS_CARDS.map((c) => (
            <Grid key={c.key} size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                active={String(status || '').toUpperCase() === c.key}
                title={c.label}
                value={
                  c.key === 'GRADED'
                    ? (summary?.GRADED ?? 0)
                    : c.key === 'NEEDS_ATTENTION'
                      ? (summary?.NEEDS_ATTENTION ?? 0)
                      : (summary?.UNGRADED ?? 0)
                }
                helper={c.helper}
                onClick={() => setParam('status', String(status || '').toUpperCase() === c.key ? 'ALL' : c.key)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Active chips + total */}
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {activeFilterChips.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Menampilkan semua data. Kalau tabel berat, pilih minimal Period.
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
                Total: <b>{summary?.total ?? meta?.count ?? 0}</b>
              </Typography>
            </Stack>
          </Box>
        </Paper>

        {/* Table */}
        <PpdbNilaiTable
          rows={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={Number(meta?.count || 0)}
          handleChangePage={(_, p) => setParam('page', String(p))}
          handleChangeRowsPerPage={(e) => {
            const v = parseInt(e.target.value, 10);
            const next = new URLSearchParams(sp);
            next.set('limit', String(v));
            next.set('page', '0');
            setSp(next);
          }}
          handleViewDetail={(ppdb_application_id) => navigate(`/dashboard/admin-sekolah/ppdb-nilai/detail/${ppdb_application_id}`)}
          handleOpenApp={(ppdb_application_id) => navigate(`/dashboard/admin-sekolah/ppdb-pendaftar/detail/${ppdb_application_id}`)}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.response?.data?.msg || error?.message}
          hasAnyFilter={hasAnyFilter}
          periodLabelMap={periodLabelMap}
          waveTrackLabelMap={waveTrackLabelMap}
          componentLabelMap={componentLabelMap}
          sessionLabelMap={sessionLabelMap}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbNilaiList;