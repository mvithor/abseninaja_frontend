import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Chip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import PageContainer from 'src/components/container/PageContainer';
import KpiPemetaanRow from 'src/components/dashboard-guru-bk/KpiPemetaanRow';
import RingkasanDimensiCard from 'src/components/dashboard-guru-bk/RingkasanDimensiCard';
import SiswaPrioritasCard from 'src/components/dashboard-guru-bk/SiswaPrioritasCard';
import KelasBinaanCard from 'src/components/dashboard-guru-bk/KelasBinaanCard';
import TindakLanjutCard from 'src/components/dashboard-guru-bk/TindakLanjutCard';
import JadwalHariIniCard from 'src/components/dashboard-guru-bk/JadwalHariIniCard';
import PengaduanRingkasCard from 'src/components/dashboard-guru-bk/PengaduanRingkasCard';
import PemilihBagianDashboard from 'src/components/dashboard-guru-bk/PemilihBagianDashboard';
import PenangananDetailDialog from 'src/components/jurnal-bk/PenangananDetailDialog';
import PermintaanAksesBanner from 'src/components/jurnal-bk/PermintaanAksesBanner';
import { hariIniDi } from 'src/components/jurnal-bk/jurnalConfig';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import PemilihLingkup from 'src/components/pemetaan-siswa/PemilihLingkup';
import { useKonteksBk } from 'src/components/pemetaan-siswa/useKonteksBk';
import { useRingkasanPemetaan } from 'src/components/pemetaan-siswa/useRingkasanPemetaan';
import { BK_API, LINGKUP } from 'src/components/pemetaan-siswa/pemetaanConfig';
import DetailSiswaDrawer from 'src/apps/guru-bk/pemetaan-siswa/DetailSiswaDrawer';
import { IconCalendarEvent, IconChecklist, IconMapSearch } from '@tabler/icons-react';

const URL_PEMETAAN = '/dashboard/guru-bk/pemetaan-siswa';

// Dashboard dibagi 3 bagian; hanya satu yang tampil, dipilih lewat tombol di atas (disimpan di ?bagian=).
const BAGIAN = [
  { kode: 'pemetaan', label: 'Pemetaan & Prioritas', keterangan: 'Ringkasan siswa, pemetaan per dimensi, siswa prioritas', icon: IconMapSearch },
  { kode: 'layanan', label: 'Layanan Hari Ini', keterangan: 'Jadwal konseling & pengaduan anonim', icon: IconCalendarEvent },
  { kode: 'tindak-lanjut', label: 'Tindak Lanjut & Kelas', keterangan: 'Tindak lanjut penanganan & kelas binaan', icon: IconChecklist },
];
// Lingkup Kelas Saya / Semua Kelas hanya memengaruhi data pemetaan, tindak lanjut, dan kelas.
const BAGIAN_BERLINGKUP = ['pemetaan', 'tindak-lanjut'];

const DashboardGuruBk = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const bagian = BAGIAN.some((b) => b.kode === searchParams.get('bagian')) ? searchParams.get('bagian') : BAGIAN[0].kode;
  const pilihBagian = (kode) => setSearchParams(kode === BAGIAN[0].kode ? {} : { bagian: kode }, { replace: true });
  const [lingkup, setLingkup] = useState(LINGKUP.SAYA);
  const [siswaDetail, setSiswaDetail] = useState(null);
  const [penanganan, setPenanganan] = useState(null);
  const timezone = useSchoolTimezone();

  // Bukan anggota / nonaktif sudah ditangani GerbangKonteksBk di level rute.
  const { data: konteks } = useKonteksBk();
  const isKoordinator = Boolean(konteks?.is_koordinator);
  const lingkupEfektif = isKoordinator ? lingkup : LINGKUP.SAYA;
  const { data: ringkasan, isLoading, isError, error } = useRingkasanPemetaan({ lingkup: lingkupEfektif });

  // Tautan ke Pemetaan Siswa membawa lingkup yang sedang dilihat.
  const bukaPemetaan = (params = {}) => {
    const query = new URLSearchParams({ ...(lingkupEfektif === LINGKUP.SEMUA ? { lingkup: LINGKUP.SEMUA } : {}), ...params });
    navigate(`${URL_PEMETAAN}${query.toString() ? `?${query}` : ''}`);
  };

  // Pengaduan darurat ditandai di tombol "Layanan Hari Ini" supaya terlihat dari bagian mana pun.
  const { data: ringkasanPengaduan } = useQuery({
    queryKey: ['bk-pengaduan', { kelompok: 'aktif', limit: 1, ringkas: true }],
    queryFn: async () => (await axiosInstance.get(`${BK_API}/pengaduan`, { params: { kelompok: 'aktif', limit: 1 } })).data?.meta?.ringkasan || {},
    refetchInterval: 60_000,
    enabled: Boolean(konteks?.aktif),
  });
  const penanda = ringkasanPengaduan?.darurat_aktif ? { layanan: `${ringkasanPengaduan.darurat_aktif} darurat` } : {};


  return (
    <PageContainer title="Dashboard Guru BK" description="Dashboard Bimbingan dan Konseling">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4">Selamat datang, {user?.name || 'Guru BK'}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
              {isKoordinator ? 'Koordinator BK' : 'Guru BK'} · Kelas tanggung jawab:
            </Typography>
            {konteks?.kelas?.length ? (
              konteks.kelas.map((k) => <Chip key={k.id} size="small" label={k.nama} />)
            ) : (
              <Typography variant="body2" color="warning.dark">belum ada</Typography>
            )}
          </Box>
        </Box>
        {isKoordinator && BAGIAN_BERLINGKUP.includes(bagian) && <PemilihLingkup value={lingkupEfektif} onChange={setLingkup} />}
      </Box>

      {isError ? (
        <Alert severity="error">{error?.response?.data?.msg || 'Data pemetaan gagal dimuat.'}</Alert>
      ) : (
        // pb: layout utama tidak memberi jarak bawah, jadi kartu terakhir akan menempel ke tepi bawah halaman.
        <Box sx={{ pb: 5 }}>
          <PermintaanAksesBanner timezone={timezone} onLihatCatatan={setPenanganan} />
          <PemilihBagianDashboard bagianList={BAGIAN} value={bagian} onChange={pilihBagian} penanda={penanda} />

          {bagian === 'pemetaan' && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <KpiPemetaanRow
                  ringkasan={ringkasan}
                  isLoading={isLoading}
                  onPerhatian={() => bukaPemetaan({ perhatian: 'semua' })}
                  onPrioritas={() => bukaPemetaan({ perhatian: 'semua', sort: 'perhatian' })}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <RingkasanDimensiCard
                  ringkasan={ringkasan}
                  isLoading={isLoading}
                  onPilihDimensi={(kode) => bukaPemetaan({ dimensi: kode, perhatian: kode })}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 7 }}>
                <SiswaPrioritasCard
                  siswaList={ringkasan?.siswa_prioritas || []}
                  isLoading={isLoading}
                  onDetail={setSiswaDetail}
                  onLihatSemua={() => bukaPemetaan({ perhatian: 'semua', sort: 'perhatian' })}
                />
              </Grid>
            </Grid>
          )}

          {bagian === 'layanan' && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <JadwalHariIniCard hariIni={hariIniDi(timezone)} onLihatSemua={() => navigate('/dashboard/guru-bk/jadwal')} />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <PengaduanRingkasCard
                  onBuka={(p) => navigate(`/dashboard/guru-bk/pengaduan/${p.id}`)}
                  onLihatSemua={() => navigate('/dashboard/guru-bk/pengaduan')}
                />
              </Grid>
            </Grid>
          )}

          {bagian === 'tindak-lanjut' && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <TindakLanjutCard
                  lingkup={lingkupEfektif}
                  hariIni={hariIniDi(timezone)}
                  onDetail={setPenanganan}
                  onLihatSemua={() =>
                    navigate(`/dashboard/guru-bk/jurnal?status=tindak_lanjut&dari=${hariIniDi(timezone, -29)}&sampai=${hariIniDi(timezone)}`)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 7 }}>
                <KelasBinaanCard
                  perKelas={ringkasan?.per_kelas || []}
                  isLoading={isLoading}
                  tampilkanBk={lingkupEfektif === LINGKUP.SEMUA}
                  onPilihKelas={(kelasId) => bukaPemetaan({ kelas: kelasId })}
                />
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      <DetailSiswaDrawer siswa={siswaDetail} onClose={() => setSiswaDetail(null)} />
      <PenangananDetailDialog entri={penanganan} timezone={timezone} onClose={() => setPenanganan(null)} />
    </PageContainer>
  );
};

export default DashboardGuruBk;
