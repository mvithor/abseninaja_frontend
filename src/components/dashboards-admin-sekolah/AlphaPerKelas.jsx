import { Box, Typography, Button, CircularProgress, useTheme } from '@mui/material';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchAlpha = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/absensi/alpha-per-kelas');
  return Array.isArray(res.data.data) ? res.data.data : [];
};

const BAR_COLORS = ['#EF4444', '#F97316', '#FBBF24', '#A3E635', '#6EE7B7'];

const AlphaPerKelas = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: alpha = [], isLoading, isError } = useQuery({
    queryKey: ['alphaPerKelas'],
    queryFn: fetchAlpha,
    staleTime: 60000,
    retry: false,
  });

  const top5 = alpha.slice(0, 5);
  const maxVal = top5.length > 0 ? Math.max(...top5.map((a) => a.jumlah_alpha), 1) : 1;
  const topClass = top5[0];

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
      <Typography variant="subtitle2" fontWeight={700}>
        Alpha per kelas hari ini
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        top 5 kelas · sorted ↓
      </Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {(isError || (!isLoading && top5.length === 0)) ? (
        <Box sx={{ py: 3, textAlign: 'center', color: 'text.disabled' }}>
          <Typography variant="caption">
            {isError ? 'Gagal memuat data alpha' : 'Tidak ada siswa alpha hari ini'}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
            {top5.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ width: 70, flexShrink: 0, color: 'text.secondary', fontSize: '0.72rem' }} noWrap>
                  {item.nama_kelas}
                </Typography>
                <Box sx={{ flex: 1, height: 18, backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(item.jumlah_alpha / maxVal) * 100}%`,
                      backgroundColor: BAR_COLORS[i] || BAR_COLORS[4],
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </Box>
                <Typography variant="caption" fontWeight={700} sx={{ width: 20, textAlign: 'right', fontSize: '0.72rem' }}>
                  {item.jumlah_alpha}
                </Typography>
              </Box>
            ))}
          </Box>

          {topClass && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconBrandWhatsapp size={13} />}
              sx={{
                mt: 1.5,
                fontSize: '0.7rem',
                textTransform: 'none',
                borderRadius: '8px',
                color: '#059669',
                borderColor: '#059669',
                '&:hover': { backgroundColor: '#D1FAE5', borderColor: '#059669' },
              }}
            >
              Notif WA {topClass.nama_kelas} →
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default AlphaPerKelas;
