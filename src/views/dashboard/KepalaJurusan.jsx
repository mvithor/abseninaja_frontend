import { useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { IconAlertTriangle, IconRefresh, IconInfoCircle } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import { T, RADIUS, SHADOW_CARD } from 'src/components/dashboard-kepala-jurusan/sga/sgaConfig';
import { useDashboard } from 'src/components/dashboard-kepala-jurusan/sga/useDashboard';
import AppHeader from 'src/components/dashboard-kepala-jurusan/sga/AppHeader';
import ClassTabs from 'src/components/dashboard-kepala-jurusan/sga/ClassTabs';
import KpiRow from 'src/components/dashboard-kepala-jurusan/sga/KpiRow';
import PanelCard from 'src/components/dashboard-kepala-jurusan/sga/PanelCard';
import QuadrantMatrix from 'src/components/dashboard-kepala-jurusan/sga/QuadrantMatrix';
import EarlyWarningPanel from 'src/components/dashboard-kepala-jurusan/sga/EarlyWarningPanel';
import { KpiRowSkeleton, QuadrantSkeleton, EarlyWarningSkeleton } from 'src/components/dashboard-kepala-jurusan/sga/Skeletons';

// ═══════════════════════════════════════════════════════════════════════════
// SGA Dashboard Kepala Jurusan — terhubung ke backend.
// Satu endpoint (GET /api/v1/kepala-jurusan/dashboard) menyuplai seluruh halaman
// (dok "Endpoint Dashboard Kepala Jurusan"). Data mentah dinormalisasi oleh
// useDashboard → adapter, jadi komponen di bawah tetap presentational.
// ═══════════════════════════════════════════════════════════════════════════

// Kartu state (error / empty) — putih, center, opsional tombol aksi.
const StateCard = ({ icon, title, message, actionLabel, onAction }) => (
  <Box sx={{ backgroundColor: T.surface, borderRadius: RADIUS.card, border: `1px solid ${T.border}`, boxShadow: SHADOW_CARD, p: { xs: 4, md: 6 }, textAlign: 'center' }}>
    {icon}
    <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: T.textPrimary, mt: 1.5 }}>{title}</Typography>
    <Typography sx={{ fontSize: '0.875rem', color: T.textSecondary, mt: 0.5, maxWidth: 460, mx: 'auto' }}>{message}</Typography>
    {onAction && (
      <Button
        onClick={onAction}
        startIcon={<IconRefresh size={16} />}
        variant="outlined"
        sx={{ mt: 2.5, textTransform: 'none', fontWeight: 600, borderRadius: RADIUS.pill, borderColor: T.primary, color: T.primary, '&:hover': { borderColor: T.primaryHover, backgroundColor: T.primarySoft } }}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

const KepalaJurusan = () => {
  const reduxUser = useSelector((state) => state.user);
  const [classId, setClassId] = useState('all');

  const { data, isFetching, isError, error, refetch, isEmpty, emptyMsg } = useDashboard(classId);

  const handleChangeClass = useCallback((id) => {
    setClassId(id); // React Query refetch otomatis via queryKey
  }, []);

  // v1.0: drill-down siswa belum ada — handler aman. Nanti navigasi ke
  // /kepala-jurusan/profile-siswa/{siswa_id} (dok §7).
  const handleStudentClick = useCallback((studentId) => {
    console.log('[SGA] student clicked:', studentId);
  }, []);

  const errMsg = error?.response?.data?.msg || 'Gagal memuat data dashboard. Periksa koneksi lalu coba lagi.';

  // Ambang scatter (dua sumbu) + fallback aman bila konfigurasi jurusan kosong.
  const ambangBehavior = data?.meta.ambangBehavior ?? data?.meta.threshold ?? 70;
  const ambangCompetency = data?.meta.ambangCompetency ?? data?.meta.threshold ?? 70;
  const captionThreshold = data?.meta.threshold ?? data?.meta.ambangCompetency ?? '—';

  const displayUser = {
    name: data?.user.name || reduxUser?.name || 'Kepala Jurusan',
    role: data?.user.role || 'Kepala Jurusan',
    avatarUrl: data?.user.avatarUrl ?? null,
  };

  return (
    <PageContainer title="Skill Gap Advisor" description="Dashboard Kepala Jurusan — Skill Gap Advisor">
      <Box
        sx={{
          backgroundColor: T.pageBg,
          mx: { xs: -2, sm: '-24px' },
          mt: { xs: -2, sm: '-24px' },
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 4 },
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {isError ? (
            <StateCard
              icon={<IconAlertTriangle size={40} color={T.dangerStrong} />}
              title="Gagal memuat data"
              message={errMsg}
              actionLabel="Coba Lagi"
              onAction={() => refetch()}
            />
          ) : isEmpty ? (
            <StateCard
              icon={<IconInfoCircle size={40} color={T.textMuted} />}
              title="Data belum tersedia"
              message={emptyMsg}
            />
          ) : !data ? (
            <>
              <KpiRowSkeleton />
              <QuadrantSkeleton />
              <EarlyWarningSkeleton />
            </>
          ) : (
            <>
              <AppHeader
                schoolName={data.meta.schoolName}
                academicYear={data.meta.academicYear}
                semester={data.meta.semester}
                ewsCount={data.earlyWarnings.length}
                user={displayUser}
              />

              <Box>
                <ClassTabs items={data.classes} activeId={classId} onChange={handleChangeClass} loading={isFetching} />
              </Box>

              {isFetching ? <KpiRowSkeleton /> : <KpiRow kpi={data.kpi} />}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {isFetching ? (
                  <QuadrantSkeleton />
                ) : (
                  <PanelCard>
                    <QuadrantMatrix
                      quadrants={data.quadrants}
                      quadrantTotals={data.quadrantTotals}
                      threshold={captionThreshold}
                      thresholdX={ambangBehavior}
                      thresholdY={ambangCompetency}
                      onStudentClick={handleStudentClick}
                    />
                  </PanelCard>
                )}

                {isFetching ? (
                  <EarlyWarningSkeleton />
                ) : (
                  <PanelCard>
                    <EarlyWarningPanel entries={data.earlyWarnings} onStudentClick={handleStudentClick} />
                  </PanelCard>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default KepalaJurusan;
