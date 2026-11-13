import PropTypes from 'prop-types';
import { Box, Button, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { IconCalendarOff } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import DashboardCard from 'src/components/shared/DashboardCard';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API, LINGKUP } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { metaStatusJadwal } from 'src/components/jadwal-bk/jadwalConfig';

// Sesi konseling milik BK yang login untuk hari ini. Kunci query sama dengan "Agenda Hari Ini"
// di halaman Jadwal Konseling, jadi datanya berbagi cache.
const JadwalHariIniCard = ({ hariIni, onLihatSemua }) => {
  const params = { lingkup: LINGKUP.SAYA, tanggal_mulai: hariIni, tanggal_selesai: hariIni };
  const { data = [], isLoading } = useQuery({
    queryKey: ['bk-jadwal', params],
    queryFn: async () => (await axiosInstance.get(`${BK_API}/jadwal`, { params })).data?.data || [],
  });

  return (
    <DashboardCard
      title="Jadwal Konseling Hari Ini"
      subtitle={`${data.filter((j) => j.status?.kode === 'terjadwal').length} sesi menunggu`}
      action={<Button size="small" onClick={onLihatSemua} sx={{ textTransform: 'none' }}>Buka kalender</Button>}
    >
      {isLoading ? (
        <Stack spacing={1}>{[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
      ) : data.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <IconCalendarOff size={40} color="#94A3B8" />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Tidak ada sesi hari ini</Typography>
        </Box>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1}>
          {data.map((j) => {
            const meta = metaStatusJadwal(j.status?.kode);
            return (
              <Box key={j.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2">{j.jam_mulai}–{j.jam_selesai} · {j.lokasi}</Typography>
                  <Typography variant="body2" noWrap>{j.siswa.map((s) => s.nama).join(', ')}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{j.topik}</Typography>
                </Box>
                <Chip size="small" variant="outlined" color={meta.color} label={`${meta.simbol}${meta.label}`} />
              </Box>
            );
          })}
        </Stack>
      )}
    </DashboardCard>
  );
};

JadwalHariIniCard.propTypes = {
  hariIni: PropTypes.string.isRequired,
  onLihatSemua: PropTypes.func.isRequired,
};

export default JadwalHariIniCard;
