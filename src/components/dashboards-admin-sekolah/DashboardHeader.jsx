import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Chip, useTheme } from '@mui/material';
import { IconQrcode, IconPencil, IconBrandWhatsapp, IconFileDownload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import ExportLaporanKehadiranDialog from './ExportLaporanKehadiranDialog';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const fetchWaSession = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/wa/session');
  return res.data.data;
};

const DashboardHeader = ({ pendingCount = 0 }) => {
  const theme = useTheme();
  const [now, setNow] = useState(new Date());
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: waSession = [] } = useQuery({
    queryKey: ['waSession'],
    queryFn: fetchWaSession,
    staleTime: 60000,
  });

  const isWaAktif = Array.isArray(waSession)
    ? waSession.some((s) => s.status === 'connected')
    : false;

  const hari = HARI[now.getDay()];
  const tgl = now.getDate();
  const bln = BULAN[now.getMonth()];
  const thn = now.getFullYear();
  const jam = String(now.getHours()).padStart(2, '0');
  const mnt = String(now.getMinutes()).padStart(2, '0');

  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? theme.palette.action.hover : theme.palette.background.paper;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          p: 2,
          mb: 2,
          borderRadius: '10px',
          backgroundColor: cardBg,
          boxShadow: theme.shadows[1],
          border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
        }}
      >
        {/* Info kiri: tanggal, jam, status WA, pending */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
            {hari}, {tgl} {bln} {thn}
          </Typography>

          <Chip
            label={`${jam}.${mnt} WITA`}
            size="small"
            sx={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, fontSize: '0.75rem' }}
          />

          <Chip
            label={isWaAktif ? 'WA Aktif' : 'WA Tidak Aktif'}
            size="small"
            icon={<IconBrandWhatsapp size={14} />}
            sx={{
              backgroundColor: isWaAktif ? '#D1FAE5' : '#FEE2E2',
              color: isWaAktif ? '#065F46' : '#991B1B',
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-icon': { color: isWaAktif ? '#065F46' : '#991B1B' },
            }}
          />

          {pendingCount > 0 && (
            <Chip
              label={`${pendingCount} item pending`}
              size="small"
              sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600, fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Tombol aksi kanan: Export | Scan QR | Absensi Manual | Blast WA */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconFileDownload size={16} />}
            onClick={() => setExportOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              color: '#4F46E5',
              borderColor: '#4F46E5',
              '&:hover': { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
            }}
          >
            Export Kehadiran
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<IconQrcode size={16} />}
            component={Link}
            to="/dashboard/admin-sekolah/absensi"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Scan QR
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<IconPencil size={16} />}
            component={Link}
            to="/dashboard/admin-sekolah/absensi-siswa/tambah"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Absensi Manual
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<IconBrandWhatsapp size={16} />}
            component={Link}
            to="/dashboard/admin-sekolah/whatsapp"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              color: '#059669',
              borderColor: '#059669',
              '&:hover': { backgroundColor: '#D1FAE5', borderColor: '#059669' },
            }}
          >
            Blast WA
          </Button>
        </Box>
      </Box>

      <ExportLaporanKehadiranDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </>
  );
};

export default DashboardHeader;
