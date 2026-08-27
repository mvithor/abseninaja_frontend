import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchTren = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/absensi/tren-7-hari');
  return Array.isArray(res.data.data) ? res.data.data : [];
};

const HARI_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const TrenKehadiran = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: tren = [], isLoading, isError } = useQuery({
    queryKey: ['trenKehadiran7Hari'],
    queryFn: fetchTren,
    staleTime: 120000,
    retry: false,
  });

  const withPersen = tren.map((t) => ({
    ...t,
    persen: t.total > 0 ? Math.round((t.hadir / t.total) * 100) : 0,
  }));

  const max = withPersen.length > 0 ? Math.max(...withPersen.map((t) => t.persen), 1) : 100;
  const anomaly = withPersen.find((t) => t.persen < 75 && t.label === 'Jum');

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        backgroundColor: isDark ? theme.palette.action.hover : theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
        height: '100%',
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
        Tren kehadiran 7 hari
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        % hadir harian
      </Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {(isError || (!isLoading && withPersen.length === 0)) ? (
        <Box sx={{ py: 3, textAlign: 'center', color: 'text.disabled' }}>
          <Typography variant="caption">
            {isError ? 'Gagal memuat data tren kehadiran' : 'Belum ada data tren 7 hari'}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.8, mt: 2, height: 80 }}>
            {withPersen.map((item, i) => {
              const isToday = item.label === 'Hari Ini' || i === withPersen.length - 1;
              const h = Math.max(4, (item.persen / max) * 72);
              return (
                <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                  <Typography variant="caption" fontWeight={isToday ? 700 : 400} sx={{ fontSize: '0.65rem', color: isToday ? 'primary.main' : 'text.secondary' }}>
                    {item.persen}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: `${h}px`,
                      borderRadius: '4px 4px 0 0',
                      backgroundColor: isToday
                        ? '#F59E0B'
                        : item.persen < 75
                        ? '#FCA5A5'
                        : '#34D399',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
                    {item.label || HARI_SHORT[i]}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {anomaly && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1.5, p: 1, backgroundColor: '#FEF3C7', borderRadius: '6px' }}>
              <IconAlertTriangle size={12} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#92400E', fontSize: '0.65rem' }}>
                Jumat konsisten {anomaly.persen}% — pola permanen, bukan anomali
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TrenKehadiran;
