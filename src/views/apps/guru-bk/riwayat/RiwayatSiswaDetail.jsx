import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { IconArrowLeft, IconCalendarPlus, IconDownload, IconMapSearch, IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import RingkasanRiwayatCard from "src/apps/guru-bk/riwayat/Detail/RingkasanRiwayatCard";
import DetailSiswaDrawer from "src/apps/guru-bk/pemetaan-siswa/DetailSiswaDrawer";
import PenangananItem from "src/components/jurnal-bk/PenangananItem";
import PenangananDetailDialog from "src/components/jurnal-bk/PenangananDetailDialog";
import HapusPenangananDialog from "src/components/jurnal-bk/HapusPenangananDialog";
import PerhatianChips from "src/components/pemetaan-siswa/PerhatianChips";
import ExportProfilBkDialog from "src/components/pemetaan-siswa/ExportProfilBkDialog";
import { BK_API, labelJenisKelamin, teksNis } from "src/components/pemetaan-siswa/pemetaanConfig";
import { hariIniDi, KATEGORI_MASALAH } from "src/components/jurnal-bk/jurnalConfig";
import { useSchoolTimezone } from "src/hooks/useSchoolTimezone";
import axiosInstance from "src/utils/axiosInstance";

const URL_RIWAYAT = "/dashboard/guru-bk/riwayat-siswa";

const RiwayatSiswaDetail = () => {
  const { siswaId } = useParams();
  const navigate = useNavigate();
  const timezone = useSchoolTimezone();
  const hariIni = hariIniDi(timezone);
  const [kategori, setKategori] = useState("");
  const [detail, setDetail] = useState(null);
  const [hapus, setHapus] = useState(null);
  const [unduh, setUnduh] = useState(null);
  const [profil, setProfil] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const safeId = useMemo(() => (siswaId && isUUID(siswaId) ? siswaId : null), [siswaId]);
  useEffect(() => {
    if (!safeId) navigate(URL_RIWAYAT);
  }, [safeId, navigate]);

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["bk-riwayat-detail", safeId],
    queryFn: async () => (await axiosInstance.get(`${BK_API}/riwayat/${safeId}`)).data?.data,
    enabled: !!safeId,
  });

  const siswa = data?.siswa;
  const penanganan = useMemo(
    () => (data?.penanganan || []).filter((e) => !kategori || e.kategori?.kode === kategori),
    [data, kategori],
  );

  const pesan = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(""), 4000);
  };
  const ubah = (e) => navigate(`/dashboard/guru-bk/jurnal/edit/${e.id}`);
  const tambah = () => navigate(`/dashboard/guru-bk/jurnal/tambah?siswa=${safeId}`);

  return (
    <PageContainer title="Riwayat Permasalahan Siswa" description="Riwayat Permasalahan Siswa">
      <ParentCard title="Riwayat Permasalahan Siswa">
        <Alerts error={error || (isError && (queryError?.response?.data?.msg || queryError?.message))} success={success} />

        <Button startIcon={<IconArrowLeft size={18} />} onClick={() => navigate(URL_RIWAYAT)} color="secondary" sx={{ mb: 2 }}>
          Kembali
        </Button>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : siswa ? (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h4">{siswa.nama}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {teksNis(siswa.nis)} · {siswa.kelas?.nama || "-"} · {labelJenisKelamin(siswa.jenis_kelamin)}
                </Typography>
                <PerhatianChips perhatian={siswa.perhatian} />
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "flex-start" }}>
                <Button variant="outlined" startIcon={<IconMapSearch size={16} />} onClick={() => setProfil(siswa)} sx={{ textTransform: "none" }}>
                  Profil Pemetaan
                </Button>
                <Button variant="outlined" startIcon={<IconDownload size={16} />} onClick={() => setUnduh(siswa)} sx={{ textTransform: "none" }}>
                  Unduh Profil
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconCalendarPlus size={16} />}
                  onClick={() => navigate(`/dashboard/guru-bk/jadwal?siswa=${safeId}&buat=1`)}
                  sx={{ textTransform: "none" }}
                >
                  Jadwalkan Konseling
                </Button>
                <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={tambah} sx={{ textTransform: "none" }}>
                  Catat Penanganan
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <RingkasanRiwayatCard ringkasan={data.ringkasan} kategoriAktif={kategori} onPilihKategori={setKategori} />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Typography variant="h6">Timeline Penanganan</Typography>
                  {kategori && (
                    <Chip
                      size="small"
                      color="primary"
                      label={KATEGORI_MASALAH.find((k) => k.kode === kategori)?.label}
                      onDelete={() => setKategori("")}
                    />
                  )}
                </Box>
                {penanganan.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                    {kategori ? "Tidak ada catatan pada kategori ini." : "Belum ada catatan penanganan untuk siswa ini."}
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {penanganan.map((e) => (
                      <PenangananItem
                        key={e.id}
                        entri={e}
                        hariIni={hariIni}
                        tampilTanggal
                        tampilSiswa={e.siswa.length > 1}
                        onDetail={setDetail}
                        onUbah={ubah}
                        onHapus={setHapus}
                      />
                    ))}
                  </Stack>
                )}
              </Grid>
            </Grid>
          </>
        ) : null}
      </ParentCard>

      <PenangananDetailDialog entri={detail} timezone={timezone} onClose={() => setDetail(null)} onUbah={ubah} />
      <HapusPenangananDialog
        entri={hapus}
        onClose={() => setHapus(null)}
        onSuccess={(msg) => {
          setHapus(null);
          pesan(setSuccess, msg);
        }}
        onError={(msg) => {
          setHapus(null);
          pesan(setError, msg);
        }}
      />
      <ExportProfilBkDialog key={unduh?.id} siswa={unduh} onClose={() => setUnduh(null)} />
      <DetailSiswaDrawer siswa={profil} onClose={() => setProfil(null)} sembunyikanRiwayat />
    </PageContainer>
  );
};

export default RiwayatSiswaDetail;
