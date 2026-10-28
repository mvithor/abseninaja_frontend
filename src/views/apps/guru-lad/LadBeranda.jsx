import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, CircularProgress, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconFileImport, IconPlus } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import AddButton from 'src/components/button-group/AddButton';
import SearchButton from 'src/components/button-group/SearchButton';
import useAksesLad from 'src/apps/guru-lad/useAksesLad';
import BuatKelasDialog from 'src/apps/guru-lad/beranda/BuatKelasDialog';
import KelasTable from 'src/apps/guru-lad/beranda/KelasTable';
import KelasLatihan from 'src/apps/guru-lad/beranda/KelasLatihan';
import BannerTertinggal from 'src/apps/guru-lad/beranda/BannerTertinggal';
import ImporBlankoDialog from 'src/apps/guru-lad/impor/ImporBlankoDialog';
import { ringkasHasilSimpan } from 'src/apps/guru-lad/impor/impor';
import { warnaRingkasan } from 'src/apps/guru-lad/ringkasan/gayaRingkasan';
import { kelasTertinggal, pisahKelas, ringkasBeranda } from 'src/apps/guru-lad/ringkasan/ringkasan';
import {
  bacaRingkasanSemuaKelas, daftarKelas, kunciLad, pesanGalat,
} from 'src/apps/guru-lad/api';

const PESAN_KOSONG = 'Belum ada kelas. Pilih Tambah Kelas lalu isi daftar siswa, struktur TP, dan nilainya, atau Impor dari Blanko bila nilai sudah ada di Excel.';
const PESAN_TIDAK_COCOK = 'Tidak ada kelas yang cocok dengan pencarian.';

// Pencarian baru berguna bila kelasnya banyak; di bawah ini hanya menambah satu kolom isian.
const MIN_KELAS_UNTUK_CARI = 6;

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
  const w = warnaRingkasan(useTheme());
  const [dialog, setDialog] = useState(false);
  const [dialogImpor, setDialogImpor] = useState(false);
  const [infoImpor, setInfoImpor] = useState('');
  const [cari, setCari] = useState('');

  // Satu permintaan untuk semua kelas beserta kartu angkanya (NFR-03), dan satu kejadian BUKA_BERANDA di server.
  const ringkasan = useQuery({
    queryKey: kunciLad.ringkasanSemua,
    queryFn: bacaRingkasanSemuaKelas,
    enabled: akses.boleh,
    retry: false,
  });
  // Cadangan bila ringkasan gagal dimuat (mis. server belum diperbarui): daftar kelas biasa tanpa kartu angka,
  // supaya guru tetap bisa membuka kelasnya. Kartu angkanya tampil sebagai "belum dapat dimuat", bukan 0.
  const cadangan = useQuery({
    queryKey: kunciLad.daftarKelas,
    queryFn: daftarKelas,
    enabled: akses.boleh && ringkasan.isError,
    retry: false,
  });

  const kelas = useMemo(() => ringkasan.data?.kelas ?? cadangan.data?.kelas ?? [], [ringkasan.data, cadangan.data]);
  const memuat = ringkasan.isLoading || (ringkasan.isError && cadangan.isLoading);
  const galat = ringkasan.isError && cadangan.isError ? cadangan.error : null;
  const tanpaRingkasan = ringkasan.isError && !cadangan.isError;

  const kelasTampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return kata ? kelas.filter((k) => teksCari(k).includes(kata)) : kelas;
  }, [kelas, cari]);
  const { nyata, kasus } = useMemo(() => pisahKelas(kelasTampil), [kelasTampil]);
  const semuaNyata = useMemo(() => pisahKelas(kelas).nyata, [kelas]);
  // Waktu dihitung ulang tiap data baru termuat, bukan tiap render, supaya "14 hari lalu" tidak berkedip.
  const tertinggal = useMemo(() => kelasTertinggal(semuaNyata, new Date()), [semuaNyata]);

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

  const bukaKelas = (id) => navigate(`/dashboard/guru-lad/kelas/${id}`);
  const ringkas = ringkasBeranda(semuaNyata);

  return (
    <PageContainer title="Kelas Saya | Analitik Pembelajaran" description="Daftar kelas dan mata pelajaran yang Anda ampu">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 }, maxWidth: 1180, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
            <Typography component="h1" sx={{ fontSize: { xs: 24, md: 28 }, lineHeight: { xs: '30px', md: '34px' }, fontWeight: 700, color: w.ink }}>
              Kelas saya
            </Typography>
            {ringkas && <Typography sx={{ fontSize: 14, color: w.sekunder }}>{ringkas}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
            <AddButton icon={<IconFileImport size={18} />} onClick={() => setDialogImpor(true)} sx={SX_TOMBOL}>
              Impor dari Blanko
            </AddButton>
            <AddButton icon={<IconPlus size={20} />} onClick={() => setDialog(true)} sx={SX_TOMBOL}>
              Tambah Kelas
            </AddButton>
          </Box>
        </Box>

        {infoImpor && <Alert severity="success" onClose={() => setInfoImpor('')}>{infoImpor}</Alert>}
        {galat && <Alert severity="error">{pesanGalat(galat)}</Alert>}
        {tanpaRingkasan && (
          <Alert
            severity="warning"
            action={<Button color="inherit" onClick={() => ringkasan.refetch()} disabled={ringkasan.isFetching}>Coba lagi</Button>}
          >
            {`Ringkasan kelas belum dapat dimuat (${pesanGalat(ringkasan.error, 'terjadi kesalahan')}). Daftar kelas tetap tampil tanpa angka.`}
          </Alert>
        )}

        {!galat && <BannerTertinggal daftar={tertinggal} onBuka={(id) => navigate(`/dashboard/guru-lad/kelas/${id}`, { state: { tab: 'nilai' } })} />}

        {kelas.length >= MIN_KELAS_UNTUK_CARI && (
          <SearchButton
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari kelas atau mapel"
            inputProps={{ 'aria-label': 'Cari kelas atau mata pelajaran' }}
          />
        )}

        {!galat && (
          <>
            <KelasTable
              kelas={nyata}
              onBuka={bukaKelas}
              memuat={memuat}
              pesanKosong={cari.trim() ? PESAN_TIDAK_COCOK : PESAN_KOSONG}
            />
            {!memuat && nyata.length > 1 && !tanpaRingkasan && (
              <Typography sx={{ fontSize: 14, color: w.sekunder }}>
                Diurutkan dari persentase siswa perlu perhatian yang tertinggi. Kelas yang angkanya belum bisa dibaca ada di bawah.
              </Typography>
            )}
            <KelasLatihan kelas={kasus} onBuka={bukaKelas} />
            {!memuat && !tanpaRingkasan && nyata.length > 0 && (
              <Typography sx={{ fontSize: 13, color: w.sekunder, borderTop: `1px solid ${w.garis}`, pt: 1.75, lineHeight: '20px' }}>
                Angka tiap kelas dihitung server dalam satu permintaan dengan aturan yang sama seperti di halaman kelas. Persentase memakai
                jumlah siswa kelas itu sebagai pembagi; kelas yang belum punya siswa atau struktur tidak diberi angka 0.
              </Typography>
            )}
          </>
        )}
      </Box>

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
