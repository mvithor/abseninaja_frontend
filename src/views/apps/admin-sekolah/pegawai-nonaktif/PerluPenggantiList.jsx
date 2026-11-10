import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Chip, CircularProgress, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import { KUNCI, URL_PEGAWAI } from 'src/apps/pegawai-status/api';
import { butirPengganti, labelAlasan } from 'src/apps/pegawai-status/status';
import { formatWaktu, pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import axiosInstance from 'src/utils/axiosInstance';

const Judul = ({ children }) => (
  <TableCell align="center"><Typography variant="h6" sx={{ fontSize: '1rem' }}>{children}</Typography></TableCell>
);

// Pegawai NONAKTIF yang masih tercatat memegang jadwal, wali kelas, guru mapel, ekskul, atau kepala jurusan pada
// periode aktif. Tugas itu tidak dipindahkan otomatis; halaman ini menunjukkan di mana harus diganti.
const PerluPenggantiList = () => {
  const timeZone = useSchoolTimezone();
  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: [KUNCI.perluPengganti],
    queryFn: async () => (await axiosInstance.get(`${URL_PEGAWAI}/perlu-pengganti`)).data.data,
  });

  return (
    <PageContainer title="Perlu Pengganti" description="Pegawai nonaktif yang masih memegang tugas">
      <ParentCard title="Perlu Pengganti">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: -1 }}>
          Pegawai nonaktif di bawah ini masih tercatat memegang tugas pada periode berjalan. Tugas tidak dipindahkan
          otomatis. Buka halaman yang sesuai untuk menggantinya.
        </Typography>
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <Judul>Nama</Judul>
                  <Judul>Alasan</Judul>
                  <Judul>Dinonaktifkan</Judul>
                  <Judul>Masih memegang</Judul>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4}><Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box></TableCell></TableRow>
                ) : isError ? (
                  <TableRow><TableCell colSpan={4} align="center"><Typography color="error" variant="h6">{pesanGalat(error, 'Terjadi kesalahan saat memuat data.')}</Typography></TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center"><Typography variant="h6" sx={{ py: 3 }}>Tidak ada tugas yang perlu diganti</Typography></TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.pegawai_id}>
                      <TableCell align="center"><Typography sx={{ fontSize: '1rem' }}>{item.nama || '-'}</Typography></TableCell>
                      <TableCell align="center"><Typography sx={{ fontSize: '1rem' }}>{labelAlasan(item.alasan_kode)}</Typography></TableCell>
                      <TableCell align="center"><Typography sx={{ fontSize: '1rem' }}>{formatWaktu(item.nonaktif_pada, timeZone)}</Typography></TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                          {butirPengganti(item.tanggung_jawab).map((b) => (
                            <Link key={b.kunci} component={RouterLink} to={b.href} underline="none">
                              <Chip clickable label={`${b.label}: ${b.jumlah}`} sx={{ borderRadius: '8px', fontWeight: 600 }} />
                            </Link>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </ParentCard>
    </PageContainer>
  );
};

export default PerluPenggantiList;
