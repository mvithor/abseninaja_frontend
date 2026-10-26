import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Chip, CircularProgress, Stack, Tab, Tabs, Typography,
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import useAksesLad from 'src/apps/guru-lad/useAksesLad';
import SiswaPanel from 'src/apps/guru-lad/kelas/SiswaPanel';
import StrukturPanel from 'src/apps/guru-lad/kelas/StrukturPanel';
import NilaiTpGrid from 'src/apps/guru-lad/nilai/NilaiTpGrid';
import EvaluasiPanel from 'src/apps/guru-lad/evaluasi/EvaluasiPanel';
import ProyekPanel from 'src/apps/guru-lad/proyek/ProyekPanel';
import RemedialPanel from 'src/apps/guru-lad/remedial/RemedialPanel';
import RemedialDialog from 'src/apps/guru-lad/remedial/RemedialDialog';
import KehadiranPanel from 'src/apps/guru-lad/kehadiran/KehadiranPanel';
import { bacaEvaluasi, bacaMasukan, kunciLad, pesanGalat } from 'src/apps/guru-lad/api';
import { labelTabPerhatian } from 'src/apps/guru-lad/evaluasi/penjelasan';
import { tampilAngka } from 'src/apps/guru-lad/rentang';

export default function LadKelas() {
  const { kelasId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const akses = useAksesLad();
  const [tabPilihan, setTabPilihan] = useState(null);
  // Dialog remedial dipakai bersama tab Remedial dan bukti penanda P1; null berarti tertutup.
  const [remedialAwal, setRemedialAwal] = useState(null);
  // Tab awal ditentukan sekali, dari keadaan kelas saat pertama dibuka. Bila dihitung ulang setiap data
  // berubah, menambah siswa pada kelas kosong melempar guru ke tab lain sebelum ia sempat melihat hasilnya.
  const tabAwalRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: kunciLad.masukan(kelasId),
    queryFn: () => bacaMasukan(kelasId),
    enabled: akses.boleh,
    retry: false,
  });

  // Kunci sama dengan EvaluasiPanel, jadi satu permintaan dipakai bersama. Hasilnya hanya untuk angka di label
  // tab; kegagalannya tidak boleh mengganggu halaman, label cukup tanpa angka.
  const evaluasi = useQuery({
    queryKey: kunciLad.evaluasi(kelasId),
    queryFn: () => bacaEvaluasi(kelasId),
    enabled: akses.boleh,
    retry: false,
  });

  const muatUlang = () => {
    qc.invalidateQueries({ queryKey: kunciLad.masukan(kelasId) });
    qc.invalidateQueries({ queryKey: kunciLad.daftarKelas });
  };

  if (akses.memuat || (akses.boleh && isLoading)) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  }
  if (!akses.boleh) {
    return (
      <PageContainer title="Analitik Pembelajaran" description="Dashboard analitik pembelajaran guru">
        <Alert severity="info">{akses.pesan ?? 'Fitur Analitik Pembelajaran belum tersedia untuk akun ini.'}</Alert>
      </PageContainer>
    );
  }
  if (error) {
    const tidakAda = error.response?.status === 404;
    return (
      <PageContainer title="Kelas | Analitik Pembelajaran" description="Detail kelas">
        <Alert severity={tidakAda ? 'warning' : 'error'} action={<Button onClick={() => navigate('/dashboard/guru-lad')}>Kembali</Button>}>
          {tidakAda ? 'Kelas tidak ditemukan.' : pesanGalat(error)}
        </Alert>
      </PageContainer>
    );
  }

  const {
    kelas, siswa, lm, nilai_tp: nilaiTp, proyek, nilai_proyek: nilaiProyek, remedial,
    pertemuan, kehadiran, waktu_sekolah: waktuSekolah,
  } = data;
  const readOnly = kelas.jenis !== 'NYATA';
  if (tabAwalRef.current === null) {
    if (readOnly) tabAwalRef.current = 'perhatian';
    else tabAwalRef.current = siswa.length === 0 ? 'siswa' : (lm.length === 0 ? 'struktur' : 'nilai');
  }
  const tab = tabPilihan ?? tabAwalRef.current;

  return (
    <PageContainer title={`${kelas.nama_kelas} ${kelas.mapel} | Analitik Pembelajaran`} description="Isi data kelas">
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/dashboard/guru-lad')}>Kelas Saya</Button>
      </Stack>

      <ParentCard title={`${kelas.nama_kelas} · ${kelas.mapel}`}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {kelas.semester} {kelas.tahun_ajaran} · {siswa.length} siswa · KKTP {tampilAngka(Number(kelas.kktp))} (remedial bagian dari {tampilAngka(Number(kelas.ambang_bagian))}, pengayaan dari {tampilAngka(Number(kelas.ambang_pengayaan))})
          </Typography>
          {readOnly && <Chip size="small" color="warning" label={`Kelas kasus ${kelas.kasus_kode ?? ''}`.trim()} />}
        </Stack>
        {readOnly && (
          <Alert severity="info" sx={{ mb: 2 }}>Kelas kasus hanya dapat dilihat, tidak dapat diubah.</Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTabPilihan(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }} aria-label="Bagian data kelas">
          <Tab value="nilai" label="Nilai TP" />
          <Tab value="proyek" label={`Proyek (${proyek.length})`} />
          <Tab value="remedial" label={`Remedial (${remedial.length})`} />
          <Tab value="kehadiran" label={`Kehadiran (${pertemuan.length})`} />
          <Tab value="perhatian" label={labelTabPerhatian(evaluasi.data)} />
          <Tab value="struktur" label={`Struktur (${lm.length})`} />
          <Tab value="siswa" label={`Siswa (${siswa.length})`} />
        </Tabs>

        {tab === 'nilai' && (
          <NilaiTpGrid
            kelasId={kelasId}
            kelas={kelas}
            siswa={siswa}
            lm={lm}
            nilaiTp={nilaiTp}
            readOnly={readOnly}
            onTersimpan={muatUlang}
          />
        )}
        {tab === 'proyek' && (
          <ProyekPanel
            kelasId={kelasId}
            siswa={siswa}
            proyek={proyek}
            nilaiProyek={nilaiProyek}
            readOnly={readOnly}
            onBerubah={muatUlang}
          />
        )}
        {tab === 'remedial' && (
          <RemedialPanel kelas={kelas} siswa={siswa} lm={lm} remedial={remedial} readOnly={readOnly} onBuka={setRemedialAwal} />
        )}
        {tab === 'kehadiran' && (
          <KehadiranPanel
            kelasId={kelasId}
            siswa={siswa}
            pertemuan={pertemuan}
            lm={lm}
            kehadiran={kehadiran}
            waktuSekolah={waktuSekolah}
            readOnly={readOnly}
            onBerubah={muatUlang}
          />
        )}
        {tab === 'perhatian' && (
          <EvaluasiPanel
            kelasId={kelasId}
            kelas={kelas}
            siswa={siswa}
            lm={lm}
            nilaiTp={nilaiTp}
            proyek={proyek}
            nilaiProyek={nilaiProyek}
            remedial={remedial}
            pertemuan={pertemuan}
            kehadiran={kehadiran}
            onCatatRemedial={readOnly ? undefined : setRemedialAwal}
          />
        )}
        {tab === 'struktur' && <StrukturPanel kelas={kelas} lm={lm} readOnly={readOnly} onBerubah={muatUlang} />}
        {tab === 'siswa' && <SiswaPanel kelasId={kelasId} siswa={siswa} readOnly={readOnly} onBerubah={muatUlang} />}
        {!readOnly && (
          <RemedialDialog
            buka={remedialAwal !== null}
            awal={remedialAwal ?? undefined}
            kelasId={kelasId}
            kelas={kelas}
            siswa={siswa}
            lm={lm}
            nilaiTp={nilaiTp}
            remedial={remedial}
            hariIni={waktuSekolah?.hari_ini}
            onBerubah={muatUlang}
            onTutup={() => setRemedialAwal(null)}
          />
        )}
      </ParentCard>
    </PageContainer>
  );
}
