import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ProfilSiswaDetailContent from 'src/apps/kepala-jurusan/profil-siswa/Detail/ProfilSiswaDetailContent';
import { exportProfilSiswaPdf } from 'src/views/apps/kepala-jurusan/profil-siswa/profilSiswaExportApi';

// [ASUMSI ROUTE] param :siswaId, sesuai handleLihatDetail di ProfilSiswaList.jsx
const fetchProfilSiswaDetail = async (siswaId) => {
  const res = await axiosInstance.get(`/api/v1/kepala-jurusan/profile-siswa/${siswaId}`);
  return res.data?.data ?? null;
};

const ProfilSiswaDetail = () => {
  const { siswaId } = useParams();

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profil-siswa-detail', siswaId],
    queryFn: () => fetchProfilSiswaDetail(siswaId),
    enabled: !!siswaId,
  });

  const handleCetak = async () => {
    if (exporting) return;
    setExporting(true);
    setExportError('');
    setExportSuccess('');
    try {
      await exportProfilSiswaPdf(siswaId, { namaSiswa: data?.header?.nama });
      setExportSuccess('PDF Profil Kesiapan Kerja berhasil diunduh.');
      setTimeout(() => setExportSuccess(''), 2500);
    } catch (err) {
      setExportError(err?.message || 'Gagal membuat dokumen, coba lagi.');
      setTimeout(() => setExportError(''), 4000);
    } finally {
      setExporting(false);
    }
  };

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

  // [PLACEHOLDER] Tindak lanjut ke guru yang bersangkutan. Response
  // detail siswa belum memuat data kontak/ID guru, jadi handler ini
  // sengaja dibuat sebagai titik sambung: ganti isinya dengan navigasi
  // ke halaman/pesan guru begitu backend menyediakan data guru pengampu.
  // Payload: { jenis, target, targetLabel, kodeUnit?, komponen?, ... }
  const handleTindakLanjutGuru = (payload) => {
    console.log('[TindakLanjutGuru]', payload);
  };

  return (
    <PageContainer title={`Profil — ${data.header.nama}`} description="Detail Profil Kesiapan PKL">
      <Alerts error={exportError} success={exportSuccess} />
      <ProfilSiswaDetailContent
        data={data}
        onCetak={handleCetak}
        exporting={exporting}
        onTindakLanjutGuru={handleTindakLanjutGuru}
      />
    </PageContainer>
  );
};

export default ProfilSiswaDetail;