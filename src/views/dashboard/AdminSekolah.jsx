import { Box, Typography, Divider, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

import AlertBanner from 'src/components/dashboards-admin-sekolah/AlertBanner';
import DashboardHeader from 'src/components/dashboards-admin-sekolah/DashboardHeader';
import RingkasanKehadiran from 'src/components/dashboards-admin-sekolah/RingkasanKehadiran';
import AbsensiMapelPerSesi from 'src/components/dashboards-admin-sekolah/AbsensiMapelPerSesi';
import PerizinanSiswaWidget from 'src/components/dashboards-admin-sekolah/PerizinanSiswaWidget';
import PerizinanPegawaiWidget from 'src/components/dashboards-admin-sekolah/PerizinanPegawaiWidget';
import StatistikSekolah from 'src/components/dashboards-admin-sekolah/StatistikSekolah';
import TrenKehadiran from 'src/components/dashboards-admin-sekolah/TrenKehadiran';
import AlphaPerKelas from 'src/components/dashboards-admin-sekolah/AlphaPerKelas';
import ComplianceMapelGuru from 'src/components/dashboards-admin-sekolah/ComplianceMapelGuru';

const hitungIsLewat = (jamSelesai) => {
  if (!jamSelesai) return false;
  const [h, m] = jamSelesai.split(':').map(Number);
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() > h * 60 + m;
};

const fetchPerizinanSiswa = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/perizinan-siswa');
  return Array.isArray(res.data.data) ? res.data.data : [];
};

const fetchPerizinanPegawai = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/perizinan-pegawai');
  return Array.isArray(res.data.data) ? res.data.data : [];
};

const fetchCompliance = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/monitoring/compliance-mapel-guru');
  return Array.isArray(res.data.per_waktu) ? res.data.per_waktu : [];
};

const AdminSekolah = () => {
  const theme = useTheme();

  const { data: perizinanSiswa = [] } = useQuery({
    queryKey: ['perizinanSiswa'],
    queryFn: fetchPerizinanSiswa,
    staleTime: 30000,
  });

  const { data: perizinanPegawai = [] } = useQuery({
    queryKey: ['perizinanPegawai'],
    queryFn: fetchPerizinanPegawai,
    staleTime: 30000,
  });

  const { data: complianceSlots = [] } = useQuery({
    queryKey: ['complianceMapelGuru'],
    queryFn: fetchCompliance,
    staleTime: 60000,
    retry: false,
  });

  const siswaCount = perizinanSiswa.filter((d) => d.status === 'Menunggu').length;
  const pegawaiCount = perizinanPegawai.filter((d) => d.status === 'Menunggu').length;
  const mapelBelumDiisiCount = complianceSlots
    .filter((s) => hitungIsLewat(s.jam_selesai) && (s.belum_diisi ?? 0) > 0)
    .reduce((sum, s) => sum + (s.belum_diisi ?? 0), 0);
  const pendingTotal = siswaCount + pegawaiCount;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Alert tindakan */}
      <AlertBanner
        perizinanSiswaCount={siswaCount}
        perizinanPegawaiCount={pegawaiCount}
        mapelBelumDiisiCount={mapelBelumDiisiCount}
      />

      {/* Header: tanggal, WA status, tombol aksi cepat */}
      <DashboardHeader pendingCount={pendingTotal} />

      {/* Ringkasan kehadiran hari ini */}
      <RingkasanKehadiran />

      {/* Baris utama: tabel mapel (kiri) + perizinan & statistik (kanan) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <AbsensiMapelPerSesi />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PerizinanSiswaWidget />
            <PerizinanPegawaiWidget />
            <StatistikSekolah />
          </Box>
        </Grid>
      </Grid>

      {/* Divider + label tren */}
      <Box sx={{ mb: 2 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Typography
          variant="overline"
          fontWeight={700}
          sx={{ color: 'text.secondary', letterSpacing: 1.5 }}
        >
          TREN &amp; ANALISIS
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', ml: 1.5 }}>
          data referensi harian
        </Typography>
      </Box>

      {/* Grid 3 kolom seimbang: tren kehadiran | alpha per kelas | compliance guru */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TrenKehadiran />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AlphaPerKelas />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ComplianceMapelGuru />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSekolah;
