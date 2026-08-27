import { Link } from 'react-router-dom';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchStats = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/absensi/statistik', {
    params: { noCache: 1 },
  });
  return res.data.data;
};

const fetchJumlahSiswa = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/statistik/siswa');
  return res.data.data;
};

const StatItem = ({ label, value, sub, color }) => (
  <Box sx={{ minWidth: 120 }}>
    <Typography variant="h3" fontWeight={700} sx={{ color, lineHeight: 1.1 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
      {label}
    </Typography>
    {sub && (
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {sub}
      </Typography>
    )}
  </Box>
);

const RingkasanKehadiran = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['absensiStatistik'],
    queryFn: fetchStats,
    staleTime: 30000,
  });

  const { data: totalSiswa } = useQuery({
    queryKey: ['jumlahSiswa'],
    queryFn: fetchJumlahSiswa,
    staleTime: 300000,
  });

  const hadir = Number(stats?.Hadir ?? 0);
  const tanpaKeterangan = Number(stats?.['Tanpa Keterangan'] ?? 0);
  const izin = Number(stats?.Izin ?? 0);
  const sakit = Number(stats?.Sakit ?? 0);
  const terlambat = Number(stats?.Terlambat ?? 0);
  const total = Number(totalSiswa ?? 0);
  const persen = total > 0 ? ((hadir / total) * 100).toFixed(1) : null;

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: '10px',
        backgroundColor: isDark ? theme.palette.action.hover : theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="overline" fontWeight={700} sx={{ color: 'text.secondary', letterSpacing: 1 }}>
          RINGKASAN KEHADIRAN HARI INI
        </Typography>
        <Box
          component={Link}
          to="/dashboard/admin-sekolah/absensi-siswa"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
        >
          <IconArrowRight size={14} />
          HALAMAN ABSENSI
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <StatItem
            label="Hadir masuk"
            value={hadir}
            sub={persen ? `${persen}% siswa aktif` : undefined}
            color="#059669"
          />
          <StatItem
            label="Tanpa keterangan"
            value={tanpaKeterangan}
            color="#DC2626"
          />
          <StatItem
            label="Izin terkonfirmasi"
            value={izin}
            color="#2563EB"
          />
          <StatItem
            label="Sakit terkonfirmasi"
            value={sakit}
            color="#D97706"
          />
          <StatItem
            label="Terlambat"
            value={terlambat}
            color="#7C3AED"
          />
        </Box>
      )}
    </Box>
  );
};

export default RingkasanKehadiran;
