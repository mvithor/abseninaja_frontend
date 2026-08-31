import { Box, Typography, CircularProgress, Divider, useTheme } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchTren = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/absensi/tren-7-hari');
  return Array.isArray(res.data.data) ? res.data.data : [];
};

const HARI_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const StatItem = ({ label, value, color }) => (
  <Box>
    <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mb: 0.2 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: color || 'text.primary', lineHeight: 1 }}>
      {value}
    </Typography>
  </Box>
);

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

  const rataRata = withPersen.length > 0
    ? Math.round(withPersen.reduce((s, t) => s + t.persen, 0) / withPersen.length)
    : null;
  const tertinggi = withPersen.length > 0
    ? withPersen.reduce((a, b) => (a.persen >= b.persen ? a : b))
    : null;
  const terendah = withPersen.length > 0
    ? withPersen.reduce((a, b) => (a.persen <= b.persen ? a : b))
    : null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        backgroundColor: isDark ? theme.palette.action.hover : theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {/* ── Judul ── */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700}>
          Tren kehadiran 7 hari
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          % hadir harian
        </Typography>
      </Box>

      {/* ── Loading ── */}
      {isLoading && (
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {/* ── Error / Kosong ── */}
      {!isLoading && (isError || withPersen.length === 0) && (
        <Box sx={{ py: 3, color: 'text.disabled' }}>
          <Typography variant="caption">
            {isError ? 'Gagal memuat data tren kehadiran' : 'Belum ada data tren 7 hari'}
          </Typography>
        </Box>
      )}

      {/* ── Statistik ringkasan ── */}
      {!isLoading && !isError && withPersen.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <StatItem
              label="Rata-rata"
              value={`${rataRata}%`}
              color={
                rataRata >= 85 ? '#059669' : rataRata >= 75 ? '#D97706' : '#EF4444'
              }
            />
            <StatItem
              label="Tertinggi"
              value={`${tertinggi.persen}%`}
              color="#059669"
            />
            <StatItem
              label="Terendah"
              value={`${terendah.persen}%`}
              color={terendah.persen < 75 ? '#EF4444' : '#D97706'}
            />
          </Box>

          <Divider sx={{ mt: 'auto' }} />

          {/* ── Bar chart ── */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 80 }}>
            {withPersen.map((item, i) => {
              const isToday = item.label === 'Hari Ini' || i === withPersen.length - 1;
              const h = Math.max(4, (item.persen / max) * 72);
              return (
                <Box
                  key={i}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? 'primary.main' : 'text.secondary',
                      lineHeight: 1,
                    }}
                  >
                    {item.persen}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: `${h}px`,
                      borderRadius: '3px 3px 0 0',
                      backgroundColor: isToday
                        ? '#F59E0B'
                        : item.persen < 75
                        ? '#FCA5A5'
                        : '#34D399',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', lineHeight: 1 }}>
                    {item.label || HARI_SHORT[i]}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* ── Legend warna ── */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {[
              { color: '#34D399', label: '≥75%' },
              { color: '#FCA5A5', label: '<75%' },
              { color: '#F59E0B', label: 'Hari ini' },
            ].map((l) => (
              <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: l.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled' }}>{l.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* ── Anomali ── */}
          {anomaly && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.5,
                p: 1,
                backgroundColor: isDark ? 'rgba(251,191,36,0.1)' : '#FEF3C7',
                borderRadius: '6px',
              }}
            >
              <IconAlertTriangle size={12} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.65rem', color: isDark ? '#FCD34D' : '#92400E' }}>
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
