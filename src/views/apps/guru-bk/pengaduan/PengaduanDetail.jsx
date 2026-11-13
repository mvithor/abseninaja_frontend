import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { IconAlertOctagon, IconArrowLeft, IconShieldLock } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import ChildCard from "src/components/shared/ChildCard";
import PercakapanPelapor from "src/apps/guru-bk/pengaduan/Detail/PercakapanPelapor";
import CatatanInternal from "src/apps/guru-bk/pengaduan/Detail/CatatanInternal";
import KelolaPengaduanPanel from "src/apps/guru-bk/pengaduan/Detail/KelolaPengaduanPanel";
import { useKonteksBk } from "src/components/pemetaan-siswa/useKonteksBk";
import { BK_API } from "src/components/pemetaan-siswa/pemetaanConfig";
import { metaStatusPengaduan, metaUrgensi } from "src/components/pengaduan-bk/pengaduanConfig";
import { formatTanggalWaktu } from "src/components/perangkat-ajar/perangkatAjarConfig";
import { useSchoolTimezone } from "src/hooks/useSchoolTimezone";
import axiosInstance from "src/utils/axiosInstance";

const URL_PENGADUAN = "/dashboard/guru-bk/pengaduan";
const AKTIF = ["baru", "ditinjau", "ditindaklanjuti"];

const PengaduanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const timezone = useSchoolTimezone();
  const [pesan, setPesan] = useState(null);
  const safeId = useMemo(() => (id && isUUID(id) ? id : null), [id]);
  const { data: konteks } = useKonteksBk();

  useEffect(() => {
    if (!safeId) navigate(URL_PENGADUAN);
  }, [safeId, navigate]);

  const { data: p, isLoading, isError, error } = useQuery({
    queryKey: ["bk-pengaduan-detail", safeId],
    queryFn: async () => (await axiosInstance.get(`${BK_API}/pengaduan/${safeId}`)).data?.data,
    enabled: !!safeId,
    refetchInterval: 30_000, // balasan pelapor bisa masuk saat halaman terbuka
  });

  // 404 (juga saat polling): pengaduan ditugaskan ulang ke BK lain atau di luar lingkup. Kembali ke kotak masuk.
  useEffect(() => {
    if (isError && error?.response?.status === 404) {
      navigate(URL_PENGADUAN, {
        replace: true,
        state: { pesan: "Pengaduan tidak ditemukan atau sudah tidak ditugaskan kepada Anda." },
      });
    }
  }, [isError, error, navigate]);

  const tampilPesan = (m) => {
    setPesan(m);
    setTimeout(() => setPesan(null), 4000);
  };

  return (
    <PageContainer title="Detail Pengaduan" description="Detail pengaduan anonim">
      <ParentCard title="Detail Pengaduan">
        <Alerts
          error={(pesan?.tipe === "error" && pesan.teks) || (isError && (error?.response?.data?.msg || error?.message))}
          success={pesan?.tipe === "success" && pesan.teks}
        />
        <Button startIcon={<IconArrowLeft size={18} />} onClick={() => navigate(URL_PENGADUAN)} color="secondary" sx={{ mb: 2 }}>
          Kembali
        </Button>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : p ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                <ChildCard>
                  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
                    {p.urgensi?.kode === "darurat" && <IconAlertOctagon size={20} />}
                    <Typography variant="h5">{p.kategori?.label}</Typography>
                    <Chip size="small" label={metaUrgensi(p.urgensi?.kode).label} color={metaUrgensi(p.urgensi?.kode).color} />
                    <Chip size="small" variant="outlined" label={metaStatusPengaduan(p.status?.kode).label} color={metaStatusPengaduan(p.status?.kode).color} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tiket {p.kode_tiket} · masuk {formatTanggalWaktu(p.dibuat_pada, timezone)}
                    {p.tingkat && ` · pelapor dari tingkat ${p.tingkat}`}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line", mb: 2 }}>{p.isi}</Typography>
                  <Typography variant="body2"><strong>Lokasi kejadian:</strong> {p.lokasi || "-"}</Typography>
                  <Alert severity="info" icon={<IconShieldLock size={20} />} sx={{ mt: 2 }}>
                    Pelapor anonim. Jangan mencoba mengidentifikasi pelapor; fokus pada penanganan kejadian.
                  </Alert>
                </ChildCard>
                <PercakapanPelapor pengaduan={p} timezone={timezone} bisaBalas={AKTIF.includes(p.status?.kode)} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <KelolaPengaduanPanel
                  pengaduan={p}
                  isKoordinator={Boolean(konteks?.is_koordinator)}
                  onPesan={tampilPesan}
                  onCatatJurnal={() => navigate(`/dashboard/guru-bk/jurnal/tambah?pengaduan=${p.id}`)}
                />
                <CatatanInternal pengaduan={p} timezone={timezone} />
              </Stack>
            </Grid>
          </Grid>
        ) : null}
      </ParentCard>
    </PageContainer>
  );
};

export default PengaduanDetail;
