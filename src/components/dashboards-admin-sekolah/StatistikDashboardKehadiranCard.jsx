import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';
import { Box, Typography, Skeleton, useTheme } from '@mui/material';
import axiosInstance from 'src/utils/axiosInstance';

const fetchStatistikKehadiran = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/dashboard/statistik-kehadiran');
  return res.data;
};

const StatistikDashboardKehadiranCard = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data, isLoading, isError } = useQuery({
    queryKey:          ['statistikKehadiran'],
    queryFn:           fetchStatistikKehadiran,
    refetchInterval:   60_000,
    staleTime:         30_000,
    refetchOnWindowFocus: true,
  });

  const stats = data?.data ?? {};
  const meta  = data?.meta ?? {};

  // ===========================================================================
  // Computed sub-labels — FE hitung dari data mentah API
  // ===========================================================================

  // "82.2% siswa aktif" — guard division by zero
  const hadirPct = meta.total_siswa_aktif
    ? (((stats.Hadir ?? 0) / meta.total_siswa_aktif) * 100).toFixed(1)
    : '0.0';

  // "↑ dari 26 kemarin" — naik = merah (buruk), turun = hijau (baik)
  const tkHari    = stats['Tanpa Keterangan'] ?? 0;
  const tkKemarin = meta.yesterday?.['Tanpa Keterangan'] ?? 0;
  const tkDelta   = tkHari - tkKemarin;
  const tkDir     = tkDelta > 0 ? '↑' : tkDelta < 0 ? '↓' : null;
  const tkColor   = tkDelta > 0 ? '#E53E3E'
                  : tkDelta < 0 ? '#38A169'
                  : theme.palette.text.disabled;
  const tkSub     = tkDir
    ? `${tkDir} dari ${tkKemarin} kemarin`
    : 'sama seperti kemarin';

  // ===========================================================================
  // Card definitions
  // ===========================================================================
  const CARDS = [
    {
      key:      'hadir',
      label:    'Hadir masuk',
      value:    stats.Hadir ?? 0,
      sub:      `${hadirPct}% siswa aktif`,
      subColor: '#38A169',
      accent:   '#38A169',
      bg:       isDark ? 'rgba(56,161,105,0.09)' : '#F0FFF4',
    },
    {
      key:      'tk',
      label:    'Tanpa keterangan',
      value:    tkHari,
      sub:      tkSub,
      subColor: tkColor,
      accent:   '#E53E3E',
      bg:       isDark ? 'rgba(229,62,62,0.09)' : '#FFF5F5',
    },
    {
      key:      'izin',
      label:    'Izin',
      value:    stats.Izin ?? 0,
      sub:      'terkonfirmasi',
      subColor: '#D69E2E',
      accent:   '#D69E2E',
      bg:       isDark ? 'rgba(214,158,46,0.09)' : '#FFFFF0',
    },
    {
      key:      'sakit',
      label:    'Sakit',
      value:    stats.Sakit ?? 0,
      sub:      'terkonfirmasi',
      subColor: '#3182CE',
      accent:   '#3182CE',
      bg:       isDark ? 'rgba(49,130,206,0.09)' : '#EBF8FF',
    },
    {
      key:      'terlambat',
      label:    'Terlambat',
      value:    stats.Terlambat ?? 0,
      sub:      'sudah tercatat',
      subColor: theme.palette.text.secondary,
      accent:   '#DD6B20',
      bg:       isDark ? 'rgba(221,107,32,0.09)' : '#FFFAF0',
    },
  ];

  // ===========================================================================
  // Loading state — skeleton sesuai jumlah card
  // ===========================================================================
  if (isLoading) {
    return (
      <Grid container spacing={2} columns={12} mt={0}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
            <Skeleton
              variant="rounded"
              height={90}
              sx={{ borderRadius: '12px' }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  // ===========================================================================
  // Error state
  // ===========================================================================
  if (isError) {
    return (
      <Box
        sx={{
          display:        'flex',
          justifyContent: 'center',
          alignItems:     'center',
          height:         '90px',
        }}
      >
        <Typography variant="body2" color="error">
          Gagal memuat statistik kehadiran
        </Typography>
      </Box>
    );
  }

  // ===========================================================================
  // Render cards
  // ===========================================================================
  return (
    <Grid container spacing={2} columns={12} mt={0}>
      {CARDS.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={card.key}>
          <Box
            sx={{
              p:               2,
              height:          '90px',
              borderRadius:    '12px',
              backgroundColor: card.bg,
              border:          isDark
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(0,0,0,0.05)',
              borderLeft:      `4px solid ${card.accent}`,
              boxShadow:       theme.shadows[1],
              display:         'flex',
              flexDirection:   'column',
              justifyContent:  'space-between',
            }}
          >
            {/* Angka + label status */}
            <Box>
              <Typography
                sx={{
                  fontSize:   '1.75rem',
                  fontWeight: 700,
                  color:      card.accent,
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color:      theme.palette.text.secondary,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  display:    'block',
                }}
              >
                {card.label}
              </Typography>
            </Box>

            {/* Sub-label dinamis */}
            <Typography
              variant="caption"
              sx={{
                color:      card.subColor,
                fontWeight: 600,
                display:    'block',
              }}
            >
              {card.sub}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatistikDashboardKehadiranCard;