import { useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, CircularProgress, Tab, Tabs, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconArrowLeft } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import useAksesLad from 'src/apps/guru-lad/useAksesLad';
import SiswaPanel from 'src/apps/guru-lad/kelas/SiswaPanel';
import StrukturPanel from 'src/apps/guru-lad/kelas/StrukturPanel';
import NilaiTpGrid from 'src/apps/guru-lad/nilai/NilaiTpGrid';
import EvaluasiPanel from 'src/apps/guru-lad/evaluasi/EvaluasiPanel';
import ProyekPanel from 'src/apps/guru-lad/proyek/ProyekPanel';
import RemedialPanel from 'src/apps/guru-lad/remedial/RemedialPanel';
import RemedialDialog from 'src/apps/guru-lad/remedial/RemedialDialog';
import KehadiranPanel from 'src/apps/guru-lad/kehadiran/KehadiranPanel';
import RingkasanPanel from 'src/apps/guru-lad/ringkasan/RingkasanPanel';
import TemaLad from 'src/apps/guru-lad/gaya/TemaLad';
import KartuHalaman from 'src/apps/guru-lad/komponen/KartuHalaman';
import { gayaTautan, warnaRingkasan } from 'src/apps/guru-lad/ringkasan/gayaRingkasan';
import { lencanaPerhatian } from 'src/apps/guru-lad/ringkasan/ringkasan';
import {
  bacaMasukan, bacaRingkasan, kunciLad, pesanGalat,
} from 'src/apps/guru-lad/api';
import { ringkasAmbang } from 'src/apps/guru-lad/rentang';

const DASAR = '/dashboard/guru-lad';

// Tab diurutkan dari gambaran besar ke data mentah. Ringkasan di depan karena itu yang dicari guru saat membuka kelas.
const gayaTab = (w) => ({
  minHeight: 48,
  mt: -1,
  borderBottom: `1px solid ${w.garis}`,
  '& .MuiTabs-indicator': { height: 2, bgcolor: w.primer },
  '& .MuiTab-root': {
    minHeight: 48, minWidth: 0, px: 2, textTransform: 'none', fontSize: 14, fontWeight: 500, color: w.ink,
  },
  '& .MuiTab-root:hover': { color: w.primer },
  '& .MuiTab-root.Mui-selected': { color: w.primer, fontWeight: 500 },
  '& .MuiTab-root:focus-visible': { outline: `2px solid ${w.primer}`, outlineOffset: -2 },
});

function LabelPerhatian({ n }) {
  if (n === null) return 'Perlu Perhatian';
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      Perlu Perhatian
      <Box
        component="span"
        aria-label={`${n} murid perlu perhatian`}
        sx={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, px: '7px', borderRadius: '8px',
          bgcolor: 'primary.main', color: '#fff', fontSize: 13, fontWeight: 700, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
        }}
      >
        {n}
      </Box>
    </Box>
  );
}

export default function LadKelas() {
  const { kelasId } = useParams();
  const navigate = useNavigate();
  const lokasi = useLocation();
  const qc = useQueryClient();
  const akses = useAksesLad();
  const w = warnaRingkasan(useTheme());
  const [tabPilihan, setTabPilihan] = useState(null);
  // TP yang disorot di tab Nilai (dari ketukan pada Ringkasan); null berarti tidak ada sorotan.
  const [sorotTp, setSorotTp] = useState(null);
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

  // Ringkasan (FR-10) dipakai tab Ringkasan DAN angka di label tab Perlu Perhatian. Angkanya dari evaluasi yang
  // sama dengan tab itu. Kegagalannya tidak boleh mengganggu halaman: label cukup tanpa angka.
  const ringkasan = useQuery({
    queryKey: kunciLad.ringkasan(kelasId),
    queryFn: () => bacaRingkasan(kelasId),
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
  // Layar galat penuh HANYA bila tidak ada data sama sekali. Bila muat ulang gagal tetapi data sebelumnya masih ada
  // (mis. koneksi putus tepat setelah simpan), tab dan isian yang belum tersimpan tidak boleh hilang.
  if (error && !data) {
    const tidakAda = error.response?.status === 404;
    return (
      <PageContainer title="Kelas | Analitik Pembelajaran" description="Detail kelas">
        <Alert severity={tidakAda ? 'warning' : 'error'} action={<Button onClick={() => navigate(DASAR)}>Kembali</Button>}>
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
    // Kembali dari profil siswa membuka tab yang tadi dipakai.
    const dariProfil = typeof lokasi.state?.tab === 'string' ? lokasi.state.tab : null;
    if (dariProfil) tabAwalRef.current = dariProfil;
    else if (siswa.length === 0 && !readOnly) tabAwalRef.current = 'siswa';
    else if (lm.length === 0 && !readOnly) tabAwalRef.current = 'struktur';
    else tabAwalRef.current = 'ringkasan';
  }
  const tab = tabPilihan ?? tabAwalRef.current;

  const pindah = (tujuan, opsi = {}) => {
    setTabPilihan(tujuan);
    setSorotTp(opsi.sorot ?? null);
  };
  const bukaProfil = (siswaId) => navigate(`${DASAR}/kelas/${kelasId}/siswa/${siswaId}`, { state: { dari: 'ringkasan' } });
  const aturanVersi = ringkasan.data?.aturan_versi ?? akses.aturanVersi;
  const meta = [
    `${kelas.semester} ${kelas.tahun_ajaran}`.trim(),
    `${siswa.length} murid`,
    `${lm.length} lingkup materi`,
    aturanVersi ? `Aturan versi ${aturanVersi}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <TemaLad>
    <PageContainer title={`${kelas.nama_kelas} ${kelas.mapel} | Analitik Pembelajaran`} description="Ringkasan dan data kelas">
      {/* Satu kolom minmax(0, 1fr): tabel lebar bergulir di dalam kartunya, bukan melebarkan seluruh halaman. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', alignContent: 'start', gap: { xs: 2, md: 2.5 }, mx: 'auto' }}>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<IconArrowLeft size={20} />}
            onClick={() => navigate(DASAR)}
            sx={{ minHeight: 40, px: 3, borderRadius: '7px', textTransform: 'none', fontSize: 14, fontWeight: 500, boxShadow: 'none', color: '#fff' }}
          >
            Semua kelas
          </Button>
        </Box>

        <KartuHalaman
          tingkat="h1"
          judul={`${kelas.nama_kelas} · ${kelas.mapel}`}
          aksi={readOnly ? (
            <Box
              component="span"
              sx={{
                display: 'inline-flex', alignItems: 'center', minHeight: 26, px: '10px', borderRadius: '8px', bgcolor: 'primary.main', color: '#fff', fontSize: 13, fontWeight: 600,
              }}
            >
              {`Kelas kasus ${kelas.kasus_kode ?? ''}`.trim()}
            </Box>
          ) : undefined}
        >
          {readOnly && <Alert severity="info">Kelas kasus hanya dapat dilihat, tidak dapat diubah.</Alert>}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px 24px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 14, color: w.sekunder }}>{meta}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', fontSize: 14, color: w.sekunder }}>
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Batas nilai (remedial bagian / KKTP / pengayaan)</Box>
              <Box
                component="b"
                title="Remedial bagian tertentu / KKTP / pengayaan"
                sx={{
                  display: 'inline-flex', alignItems: 'center', minHeight: 32, px: 1.5, border: `1px solid ${w.garisTegas}`, borderRadius: '7px', fontWeight: 600, bgcolor: w.kartu, color: w.ink,
                }}
              >
                {ringkasAmbang(kelas)}
              </Box>
              {!readOnly && (
                <Box component="button" type="button" onClick={() => pindah('struktur')} sx={{ ...gayaTautan(w), fontSize: 14 }}>Ubah di Struktur</Box>
              )}
            </Box>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, v) => pindah(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Bagian data kelas"
            sx={gayaTab(w)}
          >
            <Tab value="ringkasan" label="Ringkasan" />
            <Tab value="nilai" label="Nilai TP" />
            <Tab value="proyek" label={`Proyek (${proyek.length})`} />
            <Tab value="remedial" label={`Remedial (${remedial.length})`} />
            <Tab value="kehadiran" label={`Kehadiran (${pertemuan.length})`} />
            <Tab value="perhatian" label={<LabelPerhatian n={lencanaPerhatian(ringkasan.data)} />} />
            <Tab value="struktur" label={`Struktur (${lm.length})`} />
            <Tab value="siswa" label={`Murid (${siswa.length})`} />
          </Tabs>

          {tab === 'ringkasan' && (
          <RingkasanPanel
            ringkasan={ringkasan}
            siswa={siswa}
            lm={lm}
            nilaiTp={nilaiTp}
            onPindah={pindah}
            onBukaProfil={bukaProfil}
          />
        )}


        {tab === 'nilai' && (
          <NilaiTpGrid
            kelasId={kelasId}
            kelas={kelas}
            siswa={siswa}
            lm={lm}
            nilaiTp={nilaiTp}
            readOnly={readOnly}
            onTersimpan={muatUlang}
            sorot={sorotTp}
            onHapusSorot={() => setSorotTp(null)}
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
          />
        )}
        {tab === 'struktur' && <StrukturPanel kelas={kelas} lm={lm} readOnly={readOnly} onBerubah={muatUlang} />}
        {tab === 'siswa' && <SiswaPanel kelasId={kelasId} siswa={siswa} readOnly={readOnly} onBerubah={muatUlang} />}
        </KartuHalaman>

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
      </Box>
    </PageContainer>
    </TemaLad>
  );
}
