import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import PageContainer from 'src/components/container/PageContainer';
import Alerts from 'src/components/alerts/Alerts';
import RingkasanPerangkatAjarCard from 'src/components/dashboard-guru-sekolah/RingkasanPerangkatAjarCard';
import PerluTindakanCard from 'src/components/dashboard-guru-sekolah/PerluTindakanCard';
import DeadlineMendatangCard from 'src/components/dashboard-guru-sekolah/DeadlineMendatangCard';
import { ringkasPerangkatSaya } from 'src/components/dashboard-guru-sekolah/ringkasPerangkatSaya';
import UnggahPerangkatAjarDialog from 'src/apps/guru-sekolah/perangkat-ajar/UnggahPerangkatAjarDialog';
import { useSemesterTerpilih, labelSemester } from 'src/components/perangkat-ajar/useSemesterTerpilih';
import { GURU_API } from 'src/components/perangkat-ajar/perangkatAjarConfig';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import axiosInstance from 'src/utils/axiosInstance';

const URL_PERANGKAT_AJAR = '/dashboard/guru-sekolah/perangkat-ajar';

// Kunci query sama dengan halaman Perangkat Ajar Saya, jadi data dibagi lewat cache TanStack Query.
const fetchPerangkatAjarSaya = async (semesterId) => {
  const res = await axiosInstance.get(`${GURU_API}/perangkat-ajar`, {
    params: { semester_ajaran_id: semesterId },
  });
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const DashboardGuruSekolah = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const timezone = useSchoolTimezone();
  const [success, setSuccess] = useState('');
  const [targetUnggah, setTargetUnggah] = useState(null);

  const { options: semesterOptions, semesterId, isLoading: isSemesterLoading } = useSemesterTerpilih(GURU_API);
  const semester = semesterOptions.find((s) => s.id === semesterId);

  const { data: penugasanList = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['guru-perangkat-saya', semesterId],
    queryFn: () => fetchPerangkatAjarSaya(semesterId),
    enabled: !!semesterId,
  });

  const ringkasan = useMemo(() => ringkasPerangkatSaya(penugasanList), [penugasanList]);
  const keHalamanPerangkat = () => navigate(`${URL_PERANGKAT_AJAR}${semesterId ? `?semester=${semesterId}` : ''}`);

  const handleUnggahSukses = (msg) => {
    setTargetUnggah(null);
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const memuat = isLoading || isSemesterLoading;

  return (
    <PageContainer title="Dashboard Guru Sekolah" description="Dashboard Guru Sekolah">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Selamat datang, {user?.name || 'Guru'}</Typography>
        <Typography variant="body1" color="text.secondary">
          Pantau dan lengkapi perangkat ajar Anda untuk {semester ? labelSemester(semester) : 'semester aktif'}.
        </Typography>
      </Box>

      <Alerts success={success} />

      {memuat ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={() => refetch()}>Coba lagi</Button>}
        >
          {error?.response?.data?.msg || 'Data perangkat ajar gagal dimuat.'}
        </Alert>
      ) : !semesterId || penugasanList.length === 0 ? (
        <Alert severity="info">
          {semesterId
            ? 'Anda belum memiliki penugasan mapel di semester aktif, jadi belum ada perangkat ajar yang perlu dikumpulkan.'
            : 'Belum ada semester ajaran aktif.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RingkasanPerangkatAjarCard
              ringkasan={ringkasan}
              semesterLabel={semester ? labelSemester(semester) : undefined}
              onLihatSemua={keHalamanPerangkat}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <DeadlineMendatangCard items={ringkasan.deadlineMendatang} timezone={timezone} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <PerluTindakanCard
              items={ringkasan.perluTindakan}
              timezone={timezone}
              onUnggah={(penugasan, dokumen) => setTargetUnggah({ penugasan, dokumen })}
              onLihatSemua={keHalamanPerangkat}
            />
          </Grid>
        </Grid>
      )}

      {targetUnggah && (
        <UnggahPerangkatAjarDialog
          key={`${targetUnggah.penugasan.id}-${targetUnggah.dokumen.jenis?.kode}`}
          target={targetUnggah}
          onClose={() => setTargetUnggah(null)}
          onSuccess={handleUnggahSukses}
        />
      )}
    </PageContainer>
  );
};

export default DashboardGuruSekolah;
