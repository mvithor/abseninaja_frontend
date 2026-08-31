import { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
// import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import PageContainer from 'src/components/container/PageContainer';
import axiosInstance from 'src/utils/axiosInstance';
import ProfileDataSiswaPanel from 'src/components/dashboard-kepala-jurusan/ProfileDataSiswaPanel';
import RingkasanKuadranCards from 'src/components/dashboard-kepala-jurusan/RingkasanKuadranCards';
import KelasTabs from 'src/components/dashboard-kepala-jurusan/KelasTabs';
import PapanKuadranSiswa from 'src/components/dashboard-kepala-jurusan/PapanKuadranSiswa';

const fetchProfilSiswa = async (kelasId) => {
  const res = await axiosInstance.get('/api/v1/kepala-jurusan/profile-siswa', {
    params: kelasId ? { kelas_id: kelasId } : {},
  });
  return res.data.data;
};

const KepalaJurusan = () => {
  // const user = useSelector((state) => state.user);
  const [kelasId, setKelasId] = useState(null);

  // Satu fetch per perubahan filter kelas — bukan per-kartu, jadi tidak N+1.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profilSiswaJurusan', kelasId],
    queryFn: () => fetchProfilSiswa(kelasId),
    staleTime: 30000,
  });

  return (
    <PageContainer title="Dashboard Kepala Jurusan" description="Dashboard Kepala Jurusan">
      <Box sx={{ p: 3 }}>
        {/* <Typography variant="h5" gutterBottom>
          Selamat datang, {user?.name || 'Kepala Jurusan'}
        </Typography> */}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Typography variant="body2" color="error">
            Gagal memuat data profil siswa.
          </Typography>
        )}

        {data && (
          <>
            <KelasTabs kelasOptions={data.kelas_options} kelasId={kelasId} onChange={setKelasId} />
            <RingkasanKuadranCards totalSiswa={data.total_siswa} ringkasan={data.ringkasan} />
            <ProfileDataSiswaPanel
              kuadran={data.kuadran}
              ringkasan={data.ringkasan}
              ambangBehavior={data.ambang_behavior_baik}
              ambangCompetency={data.ambang_competency_baik}
            />
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default KepalaJurusan;