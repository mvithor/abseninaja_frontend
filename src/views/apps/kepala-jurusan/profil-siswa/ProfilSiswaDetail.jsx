import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import PageContainer from 'src/components/container/PageContainer';
import ProfilSiswaDetailContent from 'src/apps/kepala-jurusan/profil-siswa/Detail/ProfilSiswaDetailContent';

// [ASUMSI ROUTE] param :siswaId, sesuai handleLihatDetail di ProfilSiswaList.jsx
const fetchProfilSiswaDetail = async (siswaId) => {
  const res = await axiosInstance.get(`/api/v1/kepala-jurusan/profile-siswa/${siswaId}`);
  return res.data?.data ?? null;
};

const ProfilSiswaDetail = () => {
  const { siswaId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profil-siswa-detail', siswaId],
    queryFn: () => fetchProfilSiswaDetail(siswaId),
    enabled: !!siswaId,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error">Gagal memuat profil siswa, atau siswa tidak ditemukan.</Typography>
      </Box>
    );
  }

  return (
    <PageContainer title={`Profil — ${data.header.nama}`} description="Detail Profil Kesiapan PKL">
      <ProfilSiswaDetailContent data={data} />
    </PageContainer>
  );
};

export default ProfilSiswaDetail;