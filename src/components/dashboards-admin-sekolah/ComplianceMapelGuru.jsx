import { Box, Typography, Button, CircularProgress, useTheme } from '@mui/material';
import { IconBrandWhatsapp, IconAlertTriangle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchCompliance = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/monitoring/compliance-mapel-guru');
  // Backend mengembalikan { per_waktu: [...], ringkasan: {...} }
  const perWaktu = Array.isArray(res.data.per_waktu) ? res.data.per_waktu : [];
  return perWaktu;
};

// Hitung apakah slot waktu sudah lewat berdasarkan jam_selesai (format "HH:MM")
const hitungIsLewat = (jamSelesai) => {
  if (!jamSelesai) return false;
  const [h, m] = jamSelesai.split(':').map(Number);
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() > h * 60 + m;
};

const SlotRow = ({ jamMulai, jamSelesai, sudahDiisi, total }) => {
  const isLewat = hitungIsLewat(jamSelesai);
  const persen = isLewat && total > 0 ? Math.round((sudahDiisi / total) * 100) : null;
  const belumDiisi = isLewat ? total - sudahDiisi : null;
  const isLow = persen != null && persen < 50;
  const jam = `${jamMulai} - ${jamSelesai}`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4 }}>
      <Typography variant="caption" sx={{ width: 90, flexShrink: 0, color: 'text.secondary', fontSize: '0.7rem' }}>
        {jam}
      </Typography>
      {persen != null ? (
        <>
          <Box sx={{ flex: 1, height: 10, backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${persen}%`,
                backgroundColor: isLow ? '#F97316' : '#34D399',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </Box>
          <Typography variant="caption" fontWeight={700} sx={{ width: 30, textAlign: 'right', fontSize: '0.7rem', color: isLow ? '#D97706' : '#059669' }}>
            {persen}%
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', width: 40 }}>
            {sudahDiisi}/{total}
          </Typography>
        </>
      ) : (
        <>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
            — blm
          </Typography>
        </>
      )}
    </Box>
  );
};

const ComplianceMapelGuru = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: slots = [], isLoading, isError } = useQuery({
    queryKey: ['complianceMapelGuru'],
    queryFn: fetchCompliance,
    staleTime: 60000,
    retry: false,
  });

  // Cari slot yang sudah lewat dan masih ada yang belum isi
  const overdueSlot = slots.find((s) => {
    const isLewat = hitungIsLewat(s.jam_selesai);
    return isLewat && s.belum_diisi > 0;
  });

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
        Compliance absensi mapel guru
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        % per slot waktu hari ini
      </Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {(isError || (!isLoading && slots.length === 0)) ? (
        <Box sx={{ py: 3, textAlign: 'center', color: 'text.disabled' }}>
          <Typography variant="caption">
            {isError ? 'Gagal memuat data compliance' : 'Belum ada jadwal mapel hari ini'}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mt: 1.5 }}>
            {slots.map((slot, i) => (
              <SlotRow
                key={i}
                jamMulai={slot.jam_mulai}
                jamSelesai={slot.jam_selesai}
                sudahDiisi={slot.sudah_diisi}
                total={slot.total}
              />
            ))}
          </Box>

          {overdueSlot && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1.5, p: 1, backgroundColor: '#FEE2E2', borderRadius: '6px' }}>
              <IconAlertTriangle size={12} color="#DC2626" style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#991B1B', fontSize: '0.65rem' }}>
                Sesi {overdueSlot.jam_mulai}–{overdueSlot.jam_selesai}: {overdueSlot.belum_diisi} guru belum isi (jam sudah lewat)
              </Typography>
            </Box>
          )}

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
            Reminder WA
          </Button>
        </>
      )}
    </Box>
  );
};

export default ComplianceMapelGuru;
