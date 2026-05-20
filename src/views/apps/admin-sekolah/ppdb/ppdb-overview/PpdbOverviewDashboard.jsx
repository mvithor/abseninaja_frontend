import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

import PpdbOverviewKpiCards from 'src/apps/admin-sekolah/ppdb/ppdb-overview/PpdbOverviewKpiCards';
import PpdbOverviewBreakdownTable from 'src/apps/admin-sekolah/ppdb/ppdb-overview/PpdbOverviewBreakdownTable';
import PpdbOverviewQueueTable from 'src/apps/admin-sekolah/ppdb/ppdb-overview/PpdbOverviewQueueTable';

const fetchOverviewSummary = async ({ ppdbPeriodId }) => {
  const params = new URLSearchParams();
  if (ppdbPeriodId) params.set('ppdb_period_id', ppdbPeriodId);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-overview/summary?${params.toString()}`);
  return res.data?.data || null;
};

const fetchOverviewBreakdownV2 = async ({ ppdbPeriodId, waveTrackId }) => {
  const params = new URLSearchParams();
  if (ppdbPeriodId) params.set('ppdb_period_id', ppdbPeriodId);
  if (waveTrackId) params.set('ppdb_wave_track_id', waveTrackId);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-overview/breakdown-v2?${params.toString()}`);
  return res.data?.data || { items: [], meta: {} };
};

const fetchOverviewToday = async ({ ppdbPeriodId, ongoingLimit = 20, nextLimit = 20 }) => {
  const params = new URLSearchParams();
  if (ppdbPeriodId) params.set('ppdb_period_id', ppdbPeriodId);
  params.set('ongoing_limit', String(ongoingLimit));
  params.set('next_limit', String(nextLimit));

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-overview/today?${params.toString()}`);
  return res.data?.data || null;
};

const fetchQueue = async ({ ppdbPeriodId, waveTrackId, page, limit }) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('status', 'FINALIZED');
  if (ppdbPeriodId) params.set('ppdb_period_id', ppdbPeriodId);
  if (waveTrackId) params.set('ppdb_wave_track_id', waveTrackId);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-overview/queue?${params.toString()}`);
  return {
    data: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { page: 1, limit, total_rows: 0, total_pages: 1 }
  };
};

const prettyChip = (label, color = 'default', onDelete) => (
  <Chip
    label={label}
    color={color}
    onDelete={onDelete}
    sx={{ mr: 1, mb: 1 }}
  />
);

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const pickScheduleLabel = (s) => {
  const title = s?.title || s?.EventType?.nama || '-';
  const wave = s?.WaveTrack?.Wave?.nama || '-';
  const track = s?.WaveTrack?.Track?.nama || '-';
  const location = s?.location || '-';
  return { title, wave, track, location };
};

const ScheduleItem = ({ item, kind = 'ONGOING' }) => {
  const x = pickScheduleLabel(item);
  const start = formatDateTime(item?.start_at);
  const end = item?.end_at ? formatDateTime(item.end_at) : 'Sampai selesai';

  const chipProps =
    kind === 'ONGOING'
      ? { label: 'ONGOING', color: 'success', variant: 'outlined' }
      : { label: 'NEXT', color: 'info', variant: 'outlined' };

  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
            {x.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {x.wave} • {x.track}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {start} — {end}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Lokasi: <b>{x.location}</b>
          </Typography>
        </Box>

        <Chip size="small" {...chipProps} />
      </Box>
    </Paper>
  );
};

const PpdbOverviewDashboard = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // filter global
  const ppdbPeriodId = String(sp.get('ppdb_period_id') || '');
  const waveTrackId = String(sp.get('ppdb_wave_track_id') || '');

  // pagination breakdown (client-side pagination biar simple)
  const bPage = Math.max(0, Number(sp.get('b_page') || 0)); // 0-based
  const bLimit = Math.max(5, Number(sp.get('b_limit') || 10));

  // pagination queue
  const qPage = Math.max(0, Number(sp.get('q_page') || 0)); // 0-based
  const qLimit = Math.max(5, Number(sp.get('q_limit') || 10));

  const setParam = (key, val) => {
    const next = new URLSearchParams(sp);
    if (!val) next.delete(key);
    else next.set(key, val);

    // reset page ketika filter berubah
    if (key === 'ppdb_period_id' || key === 'ppdb_wave_track_id') {
      next.set('b_page', '0');
      next.set('q_page', '0');
    }
    setSp(next);
  };

  const clearWaveTrackFilter = () => {
    const next = new URLSearchParams(sp);
    next.delete('ppdb_wave_track_id');
    next.set('b_page', '0');
    next.set('q_page', '0');
    setSp(next);
  };

  const summaryQueryKey = useMemo(
    () => ['ppdb-overview-summary', { ppdbPeriodId }],
    [ppdbPeriodId]
  );

  const breakdownQueryKey = useMemo(
    () => ['ppdb-overview-breakdown-v2', { ppdbPeriodId, waveTrackId }],
    [ppdbPeriodId, waveTrackId]
  );

  const todayQueryKey = useMemo(
    () => ['ppdb-overview-today', { ppdbPeriodId }],
    [ppdbPeriodId]
  );

  const queueQueryKey = useMemo(
    () => ['ppdb-overview-queue', { ppdbPeriodId, waveTrackId, qPage, qLimit }],
    [ppdbPeriodId, waveTrackId, qPage, qLimit]
  );

  const {
    data: summary,
    isLoading: sumLoading,
    isError: sumError,
    error: sumErr
  } = useQuery({
    queryKey: summaryQueryKey,
    queryFn: () => fetchOverviewSummary({ ppdbPeriodId: ppdbPeriodId || null }),
    keepPreviousData: true
  });

  const {
    data: breakdown,
    isLoading: brLoading,
    isError: brError,
    error: brErr
  } = useQuery({
    queryKey: breakdownQueryKey,
    queryFn: () => fetchOverviewBreakdownV2({ ppdbPeriodId: ppdbPeriodId || null, waveTrackId: waveTrackId || null }),
    keepPreviousData: true
  });

  const {
    data: today,
    isLoading: tdLoading,
    isError: tdError,
    error: tdErr
  } = useQuery({
    queryKey: todayQueryKey,
    queryFn: () => fetchOverviewToday({ ppdbPeriodId: ppdbPeriodId || null, ongoingLimit: 20, nextLimit: 20 }),
    keepPreviousData: true
  });

  const {
    data: queue,
    isLoading: qLoading,
    isError: qError,
    error: qErr
  } = useQuery({
    queryKey: queueQueryKey,
    queryFn: () =>
      fetchQueue({
        ppdbPeriodId: ppdbPeriodId || null,
        waveTrackId: waveTrackId || null,
        page: qPage + 1,
        limit: qLimit
      }),
    keepPreviousData: true
  });

  // ✅ FIX lint: breakdownItemsAll dibuat stabil pakai useMemo
  const breakdownItemsAll = useMemo(
    () => (Array.isArray(breakdown?.items) ? breakdown.items : []),
    [breakdown?.items]
  );

  const breakdownTotal = breakdownItemsAll.length;

  const breakdownItemsPaged = useMemo(() => {
    const start = bPage * bLimit;
    const end = start + bLimit;
    return breakdownItemsAll.slice(start, end);
  }, [breakdownItemsAll, bPage, bLimit]);

  const breakdownTableTotalCount = breakdownTotal;

  const queueList = queue?.data || [];
  const queueMeta = queue?.meta || { total_rows: 0 };

  const activeChips = useMemo(() => {
    const chips = [];
    if (ppdbPeriodId) chips.push({ key: 'ppdb_period_id', label: `Period: ${ppdbPeriodId}` });
    if (waveTrackId) chips.push({ key: 'ppdb_wave_track_id', label: `WaveTrack: ${waveTrackId}` });
    return chips;
  }, [ppdbPeriodId, waveTrackId]);

  const ongoingList = useMemo(
    () => (Array.isArray(today?.ongoing) ? today.ongoing : []),
    [today?.ongoing]
  );

  const nextList = useMemo(
    () => (Array.isArray(today?.next) ? today.next : []),
    [today?.next]
  );

  return (
    <PageContainer title="Overview PPDB" description="Dashboard ringkas PPDB (KPI + breakdown + queue)">
      <ParentCard title="Overview PPDB">
        {(sumError || brError || tdError || qError) ? (
          <Alerts
            error={
              sumErr?.response?.data?.msg ||
              brErr?.response?.data?.msg ||
              tdErr?.response?.data?.msg ||
              qErr?.response?.data?.msg ||
              'Gagal memuat overview'
            }
          />
        ) : null}

        {/* Header meta period */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {summary?.period?.nama || 'PPDB Overview'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Status Period: <b>{summary?.period?.status || '-'}</b>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(sumLoading || brLoading || tdLoading || qLoading) ? <CircularProgress size={18} /> : null}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Gelombang×Jalur OPEN: <b>{summary?.config_health?.wavetrack_open_count ?? 0}</b> • Track aktif:{' '}
                <b>{summary?.config_health?.track_active_count ?? 0}</b>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Active filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {activeChips.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Menampilkan semua jalur (waveTrack) pada period aktif.
              </Typography>
            ) : (
              <>
                {activeChips.map((c) => (
                  <Chip
                    key={c.key}
                    label={c.label}
                    onDelete={() => setParam(c.key, '')}
                  />
                ))}
                {waveTrackId ? (
                  <Chip label="Reset Jalur" color="warning" onClick={clearWaveTrackFilter} />
                ) : null}
              </>
            )}

            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Timezone: <b>{breakdown?.meta?.timezone || 'Asia/Jakarta'}</b>
            </Typography>
          </Box>
        </Paper>

        {/* KPI Cards */}
        <Box sx={{ mb: 2 }}>
          <PpdbOverviewKpiCards kpi={summary?.kpi || {}} />
        </Box>

        {/* Today / Alerts + Schedules */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Hari ini
              </Typography>

              {Array.isArray(today?.alerts) && today.alerts.length > 0 ? (
                today.alerts.map((a, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    {prettyChip(a?.message || 'Alert', a?.level === 'warning' ? 'warning' : 'default')}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Tidak ada alert konfigurasi.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                Ongoing ({ongoingList.length})
              </Typography>

              {ongoingList.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {ongoingList.map((s) => (
                    <ScheduleItem key={s?.id} item={s} kind="ONGOING" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Tidak ada jadwal ongoing.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                Next ({nextList.length})
              </Typography>

              {nextList.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {nextList.map((s) => (
                    <ScheduleItem key={s?.id} item={s} kind="NEXT" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Tidak ada jadwal berikutnya.
                </Typography>
              )}

              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                Menampilkan hingga <b>{today?.meta?.ongoing_limit ?? 20}</b> ongoing dan <b>{today?.meta?.next_limit ?? 20}</b> next.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Review Berkas
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`Pending: ${summary?.file_review?.pending ?? 0}`} variant="outlined" />
                <Chip label={`Approved: ${summary?.file_review?.approved ?? 0}`} color="success" variant="outlined" />
                <Chip label={`Rejected: ${summary?.file_review?.rejected ?? 0}`} color="error" variant="outlined" />
                <Chip label={`Revisi: ${summary?.file_review?.revision_required ?? 0}`} color="warning" variant="outlined" />
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                Ini agregat semua review berkas pada period (join review → file → application).
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Breakdown v2 table */}
        <ParentCard title="Breakdown Gelombang × Jalur (v2)">
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Ini sumber angka “total per jalur” dan “+pendaftar hari ini”. Jangan ambil dari queue/list, itu pasti bias.
          </Typography>

          <PpdbOverviewBreakdownTable
            items={breakdownItemsPaged}
            page={bPage}
            rowsPerPage={bLimit}
            totalCount={breakdownTableTotalCount}
            handleChangePage={(_, p) => setParam('b_page', String(p))}
            handleChangeRowsPerPage={(e) => {
              const v = parseInt(e.target.value, 10);
              const next = new URLSearchParams(sp);
              next.set('b_limit', String(v));
              next.set('b_page', '0');
              setSp(next);
            }}
            handleViewQueue={(waveTrackIdClicked) => {
              // set filter jalur -> otomatis queue ikut terfilter
              setParam('ppdb_wave_track_id', String(waveTrackIdClicked || ''));
            }}
            isLoading={brLoading}
            isError={brError}
            errorMessage={brErr?.response?.data?.msg || brErr?.message}
          />
        </ParentCard>

        <Box sx={{ my: 2 }} />

        {/* Queue table */}
        <ParentCard title="Queue (FINALIZED) — Siap Diverifikasi">
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Ini daftar kerja panitia. Kalau SLA Aging di breakdown tinggi, berarti queue ini dibiarkan menumpuk.
          </Typography>

          <PpdbOverviewQueueTable
            applicantList={queueList}
            page={qPage}
            rowsPerPage={qLimit}
            totalCount={Number(queueMeta?.total_rows || 0)}
            handleChangePage={(_, p) => setParam('q_page', String(p))}
            handleChangeRowsPerPage={(e) => {
              const v = parseInt(e.target.value, 10);
              const next = new URLSearchParams(sp);
              next.set('q_limit', String(v));
              next.set('q_page', '0');
              setSp(next);
            }}
            handleView={(id) => navigate(`/dashboard/admin-sekolah/ppdb-pendaftar/detail/${id}`)}
            isLoading={qLoading}
            isError={qError}
            errorMessage={qErr?.response?.data?.msg || qErr?.message}
          />
        </ParentCard>
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbOverviewDashboard;
