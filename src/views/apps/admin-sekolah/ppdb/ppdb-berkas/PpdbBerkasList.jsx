// src/apps/admin-sekolah/ppdb/ppdb-berkas/PpdbBerkasList.jsx
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Divider
} from '@mui/material';
import { IconRefresh, IconLock, IconCheck, IconAlertTriangle, IconListDetails } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import SearchButton from 'src/components/button-group/SearchButton';
import FilterButton from 'src/components/button-group/FilterButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import PpdbBerkasTable from 'src/apps/admin-sekolah/ppdb/ppdb-berkas/PpdbBerkasTable';

// ✅ filter state dokumen (server)
const VERIF_STATE_CARDS = [
  { key: 'NEED_REVIEW', label: 'Perlu Review', helper: 'Ada dokumen wajib belum direview / butuh tindakan', icon: IconListDetails },
  { key: 'INCOMPLETE', label: 'Belum Lengkap', helper: 'Ada dokumen wajib belum diupload', icon: IconAlertTriangle },
  { key: 'COMPLETE', label: 'Lengkap', helper: 'Dokumen wajib approved semua', icon: IconCheck }
];

// ✅ status aplikasi (unlock & resubmit)
const STATUS_FILTERS = [
  { key: 'FINALIZED', label: 'Siap Diverifikasi', helper: 'Locked (FINALIZED) — antrian utama untuk admin', icon: IconLock },
  { key: 'REVISION_REQUIRED', label: 'Menunggu Resubmit', helper: 'UNLOCKED — pendaftar sedang revisi, admin tunggu FINALIZED ulang', icon: IconAlertTriangle },
  { key: 'VERIFIED', label: 'Sudah Verified', helper: 'Opsional: audit / review ulang', icon: IconCheck },
  { key: 'SUBMITTED', label: 'Belum Finalisasi', helper: 'Submit tapi belum locked (read-only)', icon: IconListDetails }
];

const fetchBerkasQueue = async ({ page, limit, q, status, verification_state }) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  // ✅ default: queue_time asc untuk “antrian”
  params.set('sort_by', 'queue_time');
  params.set('sort_dir', 'asc');

  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (verification_state) params.set('verification_state', verification_state);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-berkas?${params.toString()}`);

  return {
    data: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { page: 1, limit, total_rows: 0, total_pages: 1 }
  };
};

const StatCard = ({ active, title, helper, icon: Icon, onClick }) => {
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
        {Icon ? <Icon size={18} /> : null}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 900 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.4, color: 'text.secondary' }}>
            {helper}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const PpdbBerkasList = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const page = Math.max(0, Number(sp.get('page') || 0)); // UI 0-based
  const rowsPerPage = Math.max(6, Number(sp.get('limit') || 12)); // cards: enakan 12
  const q = String(sp.get('q') || '');

  // ✅ default sesuai konsep: antrian admin = FINALIZED + NEED_REVIEW
  const status = String(sp.get('status') || 'FINALIZED');
  const verification_state = String(sp.get('verification_state') || 'NEED_REVIEW');

  const queryKey = useMemo(
    () => ['ppdb-berkas-queue', { page, rowsPerPage, q, status, verification_state }],
    [page, rowsPerPage, q, status, verification_state]
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchBerkasQueue({
        page: page + 1,
        limit: rowsPerPage,
        q: q || null,
        status: status || null,
        verification_state: verification_state || null
      }),
    keepPreviousData: true
  });

  const rows = data?.data || [];
  const meta = data?.meta || {};

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (status) chips.push({ key: 'status', label: `Status: ${status}` });
    if (verification_state) chips.push({ key: 'verification_state', label: `State: ${verification_state}` });
    if (q) chips.push({ key: 'q', label: `Cari: ${q}` });
    return chips;
  }, [status, verification_state, q]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(sp);
    if (!val) next.delete(key);
    else next.set(key, val);
    if (key !== 'page') next.set('page', '0');
    setSp(next);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams(sp);
    next.set('status', 'FINALIZED');
    next.set('verification_state', 'NEED_REVIEW');
    next.delete('q');
    next.set('page', '0');
    setSp(next);
  };

  const onClickStatus = (nextStatus) => {
    const active = status === nextStatus;
    if (active) {
      setParam('status', '');
      return;
    }

    // ✅ UX: kalau masuk REVISION_REQUIRED, state dokumen wajib tidak terlalu relevan (menunggu resubmit)
    if (nextStatus === 'REVISION_REQUIRED') {
      const next = new URLSearchParams(sp);
      next.set('status', 'REVISION_REQUIRED');
      next.delete('verification_state');
      next.set('page', '0');
      setSp(next);
      return;
    }

    setParam('status', nextStatus);
  };

  return (
    <PageContainer title="Verifikasi Berkas PPDB" description="Antrian verifikasi dokumen PPDB">
      <ParentCard title="Verifikasi Berkas PPDB">
        {isError ? (
          <Alerts error={error?.response?.data?.msg || 'Gagal memuat antrian verifikasi'} />
        ) : null}

        {/* Header controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%', mb: 2 }}>
          <SearchButton
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Cari (kode / nama / WA / NISN)"
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<IconRefresh size={18} />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Refresh
            </Button>
            <FilterButton />
          </Stack>
        </Box>

        {/* Status (workflow) cards */}
        <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1, color: 'text.secondary' }}>
          Workflow
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {STATUS_FILTERS.map((c) => (
            <Grid item xs={12} sm={6} md={4} key={c.key}>
              <StatCard
                active={status === c.key}
                title={c.label}
                helper={c.helper}
                icon={c.icon}
                onClick={() => onClickStatus(c.key)}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* Verification state cards */}
        <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1, color: 'text.secondary' }}>
          Kondisi Dokumen Wajib
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {VERIF_STATE_CARDS.map((c) => (
            <Grid item xs={12} sm={6} md={4} key={c.key}>
              <StatCard
                active={verification_state === c.key}
                title={c.label}
                helper={c.helper}
                icon={c.icon}
                onClick={() => setParam('verification_state', verification_state === c.key ? '' : c.key)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Active filter chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
          {activeFilterChips.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Menampilkan semua antrian.
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoading || isFetching ? <CircularProgress size={18} /> : null}
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Total row: <b>{Number(meta?.total_rows || 0)}</b>
            </Typography>
          </Box>
        </Box>

        {/* Cards */}
        <PpdbBerkasTable
          rows={rows}
          onView={(id) => navigate(`/dashboard/admin-sekolah/ppdb-berkas/verifikasi/${id}`)}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.response?.data?.msg || error?.message}
        />

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Halaman <b>{Number(meta?.page || page + 1)}</b> / <b>{Number(meta?.total_pages || 1)}</b>
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="Prev"
              variant="outlined"
              onClick={() => setParam('page', String(Math.max(0, page - 1)))}
              disabled={page <= 0}
            />
            <Chip
              label="Next"
              variant="outlined"
              onClick={() => setParam('page', String(page + 1))}
              disabled={Number(meta?.total_pages || 1) <= page + 1}
            />
          </Box>
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbBerkasList;
