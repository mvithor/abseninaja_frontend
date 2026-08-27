import { Box, Typography, Divider, CircularProgress, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchStat = (path) => async () => {
  const res = await axiosInstance.get(path);
  return res.data.data;
};

const fetchWaSession = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/wa/session');
  const data = Array.isArray(res.data.data) ? res.data.data : [];
  return data.some((s) => s.status === 'connected');
};

const fetchTahunAjaran = async () => {
  const res = await axiosInstance.get('/api/v1/admin-sekolah/tahun-ajaran');
  const list = Array.isArray(res.data.data) ? res.data.data : [];
  return list.find((t) => t.is_aktif) || list[0] || null;
};

const Row = ({ label, value, valueNode }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6 }}>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    {valueNode || (
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    )}
  </Box>
);

const StatistikSekolah = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: siswa, isLoading: l1 } = useQuery({ queryKey: ['jumlahSiswa'], queryFn: fetchStat('/api/v1/admin-sekolah/statistik/siswa'), staleTime: 300000 });
  const { data: kelas, isLoading: l2 } = useQuery({ queryKey: ['jumlahKelas'], queryFn: fetchStat('/api/v1/admin-sekolah/statistik/kelas'), staleTime: 300000 });
  const { data: guru, isLoading: l3 } = useQuery({ queryKey: ['jumlahGuru'], queryFn: fetchStat('/api/v1/admin-sekolah/statistik/guru'), staleTime: 300000 });
  const { data: staf, isLoading: l4 } = useQuery({ queryKey: ['jumlahStaf'], queryFn: fetchStat('/api/v1/admin-sekolah/statistik/staf'), staleTime: 300000 });
  const { data: ekskul, isLoading: l5 } = useQuery({ queryKey: ['jumlahEkskul'], queryFn: fetchStat('/api/v1/admin-sekolah/statistik/ekskul'), staleTime: 300000 });
  const { data: waAktif } = useQuery({ queryKey: ['waSession'], queryFn: fetchWaSession, staleTime: 60000 });
  const { data: ta } = useQuery({ queryKey: ['tahunAjaranAktif'], queryFn: fetchTahunAjaran, staleTime: 300000 });

  const isLoading = l1 || l2 || l3 || l4 || l5;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        backgroundColor: isDark ? theme.palette.action.hover : theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Typography variant="overline" fontWeight={700} sx={{ color: 'text.secondary', letterSpacing: 1 }}>
        STATISTIK SEKOLAH
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <Box sx={{ mt: 1 }}>
          <Row label="Siswa aktif" value={siswa ?? '—'} />
          <Row label="Kelas" value={kelas ?? '—'} />
          <Row label="Guru" value={guru ?? '—'} />
          <Row label="Staf" value={staf ?? '—'} />
          <Row label="Ekskul" value={ekskul ?? '—'} />

          <Divider sx={{ my: 1 }} />

          <Row
            label="Session"
            valueNode={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: waAktif ? '#059669' : '#9CA3AF',
                  }}
                />
                <Typography variant="body2" fontWeight={700} sx={{ color: waAktif ? '#059669' : '#9CA3AF' }}>
                  {waAktif ? 'Aktif' : 'Tidak Aktif'}
                </Typography>
              </Box>
            }
          />
          {ta && (
            <>
              <Row label="TA" value={ta.tahun_ajaran || '—'} />
              <Row label="Semester" value={ta.semester || '—'} />
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StatistikSekolah;
