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
import { gayaKartu, gayaTautan, warnaRingkasan } from 'src/apps/guru-lad/ringkasan/gayaRingkasan';
import { lencanaPerhatian } from 'src/apps/guru-lad/ringkasan/ringkasan';
import {
  bacaMasukan, bacaRingkasan, kunciLad, pesanGalat,
} from 'src/apps/guru-lad/api';
import { ringkasAmbang } from 'src/apps/guru-lad/rentang';

const DASAR = '/dashboard/guru-lad';

// Tab diurutkan dari gambaran besar ke data mentah. Ringkasan di depan karena itu yang dicari guru saat membuka kelas.
const gayaTab = (w) => ({
  minHeight: 48,
  '& .MuiTabs-indicator': { height: 3, bgcolor: w.navy },
  '& .MuiTab-root': {
    minHeight: 48, minWidth: 0, px: 2, textTransform: 'none', fontSize: 14, fontWeight: 500, color: w.sekunder,
  },
  '& .MuiTab-root.Mui-selected': { color: w.navy, fontWeight: 700 },
  '& .MuiTab-root:focus-visible': { outline: `2px solid ${w.navy}`, outlineOffset: -2 },
});

function LabelPerhatian({ n }) {
  const w = warnaRingkasan(useTheme());
  if (n === null) return 'Perlu Perhatian';
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      Perlu Perhatian
      <Box
        component="span"
        aria-label={`${n} siswa perlu perhatian`}
        sx={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, px: '6px', borderRadius: '11px',
          bgcolor: w.ink, color: w.kartu, fontSize: 12, fontWeight: 700, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
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
  if (error) {
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
    `${siswa.length} siswa`,
    `${lm.length} lingkup materi`,
    aturanVersi ? `Aturan versi ${aturanVersi}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <PageContainer title={`${kelas.nama_kelas} ${kelas.mapel} | Analitik Pembelajaran`} description="Ringkasan dan data kelas">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 }, maxWidth: 1180, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Button
              startIcon={<IconArrowLeft size={18} />}
              onClick={() => navigate(DASAR)}
              sx={{ minHeight: 36, px: 0.5, textTransform: 'none', fontSize: 14, color: w.tautan }}
            >
              Semua kelas
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
              <Typography component="h1" sx={{ fontSize: { xs: 24, md: 28 }, lineHeight: { xs: '30px', md: '34px' }, fontWeight: 700, color: w.ink }}>
                {`${kelas.nama_kelas} · ${kelas.mapel}`}
              </Typography>
              <Typography sx={{ fontSize: { xs: 13, md: 14 }, color: w.sekunder }}>{meta}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, md: 1.5 }, flexWrap: 'wrap' }}>
              {readOnly && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex', alignItems: 'center', minHeight: 24, px: 1, borderRadius: '4px', bgcolor: w.ink, color: w.kartu, fontSize: 12, fontWeight: 600,
                  }}
                >
                  {`Kelas kasus ${kelas.kasus_kode ?? ''}`.trim()}
                </Box>
              )}
              <Typography sx={{ fontSize: 14, color: w.sekunder, display: { xs: 'none', md: 'block' } }}>
                Batas nilai (remedial bagian / KKTP / pengayaan)
              </Typography>
              <Box
                component="span"
                title="Remedial bagian tertentu / KKTP / pengayaan"
                sx={{
                  display: 'inline-flex', alignItems: 'center', minHeight: { xs: 32, md: 36 }, px: 1.5, border: `1px solid ${w.ink}`, borderRadius: '6px', fontWeight: 700, fontSize: 14, bgcolor: w.kartu, color: w.ink,
                }}
              >
                {ringkasAmbang(kelas)}
              </Box>
              {!readOnly && (
                <Box component="button" type="button" onClick={() => pindah('struktur')} sx={gayaTautan(w)}>Ubah di Struktur</Box>
              )}
            </Box>
          </Box>
          {readOnly && (
            <Alert severity="info">Kelas kasus hanya dapat dilihat, tidak dapat diubah.</Alert>
          )}
        </Box>

        <Box sx={{ ...gayaKartu(w), overflow: 'hidden', mx: { xs: -2, sm: 0 }, borderRadius: { xs: 0, sm: '8px' }, borderLeftWidth: { xs: 0, sm: 1 }, borderRightWidth: { xs: 0, sm: 1 } }}>
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
            <Tab value="siswa" label={`Siswa (${siswa.length})`} />
          </Tabs>
        </Box>

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

        {tab !== 'ringkasan' && (
          <Box sx={{ ...gayaKartu(w), p: { xs: 2, md: 3 }, minWidth: 0 }}>
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
                onCatatRemedial={readOnly ? undefined : setRemedialAwal}
              />
            )}
            {tab === 'struktur' && <StrukturPanel kelas={kelas} lm={lm} readOnly={readOnly} onBerubah={muatUlang} />}
            {tab === 'siswa' && <SiswaPanel kelasId={kelasId} siswa={siswa} readOnly={readOnly} onBerubah={muatUlang} />}
          </Box>
        )}

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
  );
}
