import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { IconFileImport, IconPlus } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import useAksesLad from 'src/apps/guru-lad/useAksesLad';
import BuatKelasDialog from 'src/apps/guru-lad/beranda/BuatKelasDialog';
import ImporBlankoDialog from 'src/apps/guru-lad/impor/ImporBlankoDialog';
import { ringkasHasilSimpan } from 'src/apps/guru-lad/impor/impor';
import { daftarKelas, kunciLad, pesanGalat } from 'src/apps/guru-lad/api';
import { ringkasAmbang } from 'src/apps/guru-lad/rentang';

export default function LadBeranda() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const akses = useAksesLad();
  const [dialog, setDialog] = useState(false);
  const [dialogImpor, setDialogImpor] = useState(false);
  const [infoImpor, setInfoImpor] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: kunciLad.daftarKelas,
    queryFn: daftarKelas,
    enabled: akses.boleh,
  });
  const kelas = data?.kelas ?? [];

  if (akses.memuat) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  }
  if (!akses.boleh) {
    return (
      <PageContainer title="Analitik Pembelajaran" description="Dashboard analitik pembelajaran guru">
        <Alert severity="info">
          {akses.pesan ?? 'Fitur Analitik Pembelajaran belum tersedia untuk akun ini.'}
          {' '}Hubungi admin sekolah atau pengembang bila Anda seharusnya mendapat akses.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Kelas Saya | Analitik Pembelajaran" description="Daftar kelas dan mata pelajaran yang Anda ampu">
      <ParentCard title="Kelas Saya">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Setiap baris adalah satu mata pelajaran pada satu kelas dan semester.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<IconFileImport size={18} />} onClick={() => setDialogImpor(true)}>
              Impor dari Blanko
            </Button>
            <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => setDialog(true)}>
              Tambah Kelas
            </Button>
          </Stack>
        </Stack>

        {infoImpor && <Alert severity="success" onClose={() => setInfoImpor('')} sx={{ mb: 2 }}>{infoImpor}</Alert>}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{pesanGalat(error)}</Alert>}
        {isLoading && <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>}

        {!isLoading && !error && kelas.length === 0 && (
          <Alert severity="info">
            Belum ada kelas. Pilih Tambah Kelas lalu isi daftar siswa, struktur TP, dan nilainya, atau Impor dari Blanko bila nilai sudah ada di Excel.
          </Alert>
        )}

        {kelas.length > 0 && (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Daftar kelas">
              <TableHead>
                <TableRow>
                  <TableCell>Kelas</TableCell>
                  <TableCell>Mata pelajaran</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell align="right">Siswa</TableCell>
                  <TableCell align="right" title="Remedial bagian tertentu / KKTP / pengayaan">Batas nilai</TableCell>
                  <TableCell>Jenis</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kelas.map((k) => (
                  <TableRow
                    key={k.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/guru-lad/kelas/${k.id}`)}
                  >
                    <TableCell><Typography fontWeight={600}>{k.nama_kelas}</Typography></TableCell>
                    <TableCell>{k.mapel}</TableCell>
                    <TableCell>{k.semester} {k.tahun_ajaran}</TableCell>
                    <TableCell align="right">{k.jumlah_siswa}</TableCell>
                    <TableCell align="right" title="Remedial bagian tertentu / KKTP / pengayaan">{ringkasAmbang(k)}</TableCell>
                    <TableCell>
                      {k.jenis === 'NYATA'
                        ? <Chip size="small" variant="outlined" label="Kelas nyata" />
                        : <Chip size="small" color="warning" label={`Kasus ${k.kasus_kode ?? ''}`.trim()} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </ParentCard>

      <BuatKelasDialog
        buka={dialog}
        kelasAda={kelas}
        onTutup={() => setDialog(false)}
        onSukses={(hasil) => {
          setDialog(false);
          qc.invalidateQueries({ queryKey: kunciLad.daftarKelas });
          if (hasil?.kelas?.id) navigate(`/dashboard/guru-lad/kelas/${hasil.kelas.id}`);
        }}
      />

      <ImporBlankoDialog
        buka={dialogImpor}
        onTutup={() => setDialogImpor(false)}
        onSukses={(hasil) => {
          setDialogImpor(false);
          qc.invalidateQueries({ queryKey: kunciLad.daftarKelas });
          if (hasil?.kelas?.length === 1) navigate(`/dashboard/guru-lad/kelas/${hasil.kelas[0].id}`);
          else setInfoImpor(ringkasHasilSimpan(hasil));
        }}
      />
    </PageContainer>
  );
}
