import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Chip, useTheme } from '@mui/material';
import { IconQrcode, IconPencil, IconBrandWhatsapp, IconFileDownload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import ExportLaporanKehadiranDialog from './ExportLaporanKehadiranDialog';
import { useSchoolTimezone, TZ_LABEL } from 'src/hooks/useSchoolTimezone';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const WEEKDAY_SHORT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const getSchoolParts = (timezone, date) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric',
      hour12: false,
    }).formatToParts(date).map((p) => [p.type, p.value])
  );
  return {
    dayIndex: WEEKDAY_SHORT[parts.weekday],
    tgl: parseInt(parts.day),
    bln: parseInt(parts.month) - 1,
    thn: parseInt(parts.year),
    hours: parseInt(parts.hour) % 24,
    minutes: parseInt(parts.minute),
  };
};

const fetchWaSession = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/wa/session');
  return res.data.data;
};

const DashboardHeader = ({ pendingCount = 0 }) => {
  const theme = useTheme();
  const timezone = useSchoolTimezone();
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

  const p = getSchoolParts(timezone, now);
  const hari = HARI[p.dayIndex];
  const tgl = p.tgl;
  const bln = BULAN[p.bln];
  const thn = p.thn;
  const jam = String(p.hours).padStart(2, '0');
  const mnt = String(p.minutes).padStart(2, '0');
  const tzLabel = TZ_LABEL[timezone] || 'WIB';

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
            label={`${jam}.${mnt} ${tzLabel}`}
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
              '&:hover': {
                backgroundColor: '#4F46E5',
                borderColor: '#4338CA',
                color: '#FFFFFF',
                '& .MuiButton-startIcon': { color: '#FFFFFF' },
              },
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
              '&:hover': {
                backgroundColor: '#059669',
                borderColor: '#047857',
                color: '#FFFFFF',
                '& .MuiButton-startIcon': { color: '#FFFFFF' },
              },
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
