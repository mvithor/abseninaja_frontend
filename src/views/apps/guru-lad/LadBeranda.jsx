import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, CircularProgress } from '@mui/material';
import { IconFileImport, IconPlus } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import AddButton from 'src/components/button-group/AddButton';
import SearchButton from 'src/components/button-group/SearchButton';
import useAksesLad from 'src/apps/guru-lad/useAksesLad';
import BuatKelasDialog from 'src/apps/guru-lad/beranda/BuatKelasDialog';
import KelasTable from 'src/apps/guru-lad/beranda/KelasTable';
import ImporBlankoDialog from 'src/apps/guru-lad/impor/ImporBlankoDialog';
import { ringkasHasilSimpan } from 'src/apps/guru-lad/impor/impor';
import { daftarKelas, kunciLad, pesanGalat } from 'src/apps/guru-lad/api';

const PESAN_KOSONG = 'Belum ada kelas. Pilih Tambah Kelas lalu isi daftar siswa, struktur TP, dan nilainya, atau Impor dari Blanko bila nilai sudah ada di Excel.';
const PESAN_TIDAK_COCOK = 'Tidak ada kelas yang cocok dengan pencarian.';

const SX_TOMBOL = { width: { xs: '100%', sm: 'auto' }, maxWidth: 'none', ml: 0 };

// Teks yang dicari: nama kelas, mapel, semester, tahun ajaran, dan jenis ("kelas nyata" / "kasus a").
const teksCari = (k) => [
  k.nama_kelas,
  k.mapel,
  k.semester,
  k.tahun_ajaran,
  k.jenis === 'NYATA' ? 'kelas nyata' : `kasus ${k.kasus_kode ?? ''}`,
].join(' ').toLowerCase();

export default function LadBeranda() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const akses = useAksesLad();
  const [dialog, setDialog] = useState(false);
  const [dialogImpor, setDialogImpor] = useState(false);
  const [infoImpor, setInfoImpor] = useState('');
  const [cari, setCari] = useState('');
  const [halaman, setHalaman] = useState(0);
  const [barisPerHalaman, setBarisPerHalaman] = useState(5);

  const { data, isLoading, error } = useQuery({
    queryKey: kunciLad.daftarKelas,
    queryFn: daftarKelas,
    enabled: akses.boleh,
  });
  const kelas = useMemo(() => data?.kelas ?? [], [data]);

  const kelasTampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return kata ? kelas.filter((k) => teksCari(k).includes(kata)) : kelas;
  }, [kelas, cari]);

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
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <SearchButton
            value={cari}
            onChange={(e) => { setCari(e.target.value); setHalaman(0); }}
            placeholder="Cari kelas atau mapel"
            inputProps={{ 'aria-label': 'Cari kelas atau mata pelajaran' }}
          />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, ml: { sm: 'auto' } }}>
            <AddButton icon={<IconFileImport size={18} />} onClick={() => setDialogImpor(true)} sx={SX_TOMBOL}>
              Impor dari Blanko
            </AddButton>
            <AddButton icon={<IconPlus size={20} />} onClick={() => setDialog(true)} sx={SX_TOMBOL}>
              Tambah Kelas
            </AddButton>
          </Box>
        </Box>

        {infoImpor && <Alert severity="success" onClose={() => setInfoImpor('')} sx={{ mb: 2 }}>{infoImpor}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{pesanGalat(error)}</Alert>}

        {!error && (
          <KelasTable
            kelas={kelasTampil}
            page={halaman}
            rowsPerPage={barisPerHalaman}
            onPageChange={(_, baru) => setHalaman(baru)}
            onRowsPerPageChange={(e) => { setBarisPerHalaman(parseInt(e.target.value, 10)); setHalaman(0); }}
            onBuka={(id) => navigate(`/dashboard/guru-lad/kelas/${id}`)}
            memuat={isLoading}
            pesanKosong={cari.trim() ? PESAN_TIDAK_COCOK : PESAN_KOSONG}
          />
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