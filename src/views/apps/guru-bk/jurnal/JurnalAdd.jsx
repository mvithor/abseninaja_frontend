import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import JurnalForm from "src/apps/guru-bk/jurnal/JurnalForm";
import { BK_API } from "src/components/pemetaan-siswa/pemetaanConfig";
import { invalidasiJurnal } from "src/components/jurnal-bk/jurnalConfig";
import { KATEGORI_KE_JURNAL } from "src/components/pengaduan-bk/pengaduanConfig";
import { parseTanggalYMD, pesanGalat } from "src/components/perangkat-ajar/perangkatAjarConfig";
import axiosInstance from "src/utils/axiosInstance";

const ambil = (path) => async () => (await axiosInstance.get(`${BK_API}${path}`)).data?.data;
const uuidAtauNull = (v) => (isUUID(v || "") ? v : null);

// Sumber isi awal (opsional, lewat query string):
//   ?siswa=<id>      dari Riwayat Siswa: siswa terisi
//   ?jadwal=<id>     "Catat hasil" sesi konseling: tanggal, jam, siswa, layanan, topik terisi; sesi jadi selesai
//   ?pengaduan=<id>  dari pengaduan anonim: kategori & uraian terisi; pengaduan jadi ditindaklanjuti
const JurnalAdd = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const siswaId = uuidAtauNull(searchParams.get("siswa"));
  const jadwalId = uuidAtauNull(searchParams.get("jadwal"));
  const pengaduanId = uuidAtauNull(searchParams.get("pengaduan"));

  const siswaQ = useQuery({
    queryKey: ["bk-pemetaan-siswa-detail", siswaId],
    queryFn: ambil(`/pemetaan/siswa/${siswaId}`),
    enabled: !!siswaId,
  });
  const jadwalQ = useQuery({ queryKey: ["bk-jadwal-detail", jadwalId], queryFn: ambil(`/jadwal/${jadwalId}`), enabled: !!jadwalId });
  const pengaduanQ = useQuery({
    queryKey: ["bk-pengaduan-detail", pengaduanId],
    queryFn: ambil(`/pengaduan/${pengaduanId}`),
    enabled: !!pengaduanId,
  });

  const memuat = siswaQ.isLoading || jadwalQ.isLoading || pengaduanQ.isLoading;
  const jadwal = jadwalQ.data;
  const pengaduan = pengaduanQ.data;
  const siswa = siswaQ.data;

  const nilaiAwal = jadwal
    ? {
        tanggal: parseTanggalYMD(jadwal.tanggal),
        jam_mulai: jadwal.jam_mulai,
        jam_selesai: jadwal.jam_selesai,
        siswa: jadwal.siswa,
        jenis_layanan: jadwal.jenis_layanan?.kode,
        judul: jadwal.topik,
      }
    : pengaduan
      ? {
          kategori: KATEGORI_KE_JURNAL[pengaduan.kategori?.kode],
          judul: `Tindak lanjut pengaduan ${pengaduan.kode_tiket}: ${pengaduan.kategori?.label}`,
          uraian: `Berdasarkan pengaduan anonim ${pengaduan.kode_tiket}:\n${pengaduan.isi}`,
          rahasia: true,
        }
      : {};
  const siswaAwal = siswa ? [{ id: siswa.id, nama: siswa.nama, nis: siswa.nis, kelas: siswa.kelas }] : [];

  const mutation = useMutation({
    mutationFn: async (payload) =>
      (await axiosInstance.post(`${BK_API}/jurnal`, { ...payload, jadwal_id: jadwalId || undefined, pengaduan_id: pengaduanId || undefined })).data,
    onSuccess: (data) => {
      invalidasiJurnal(queryClient);
      ["bk-jadwal", "bk-jadwal-detail", "bk-pengaduan", "bk-pengaduan-detail"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      setError("");
      setSuccess(data?.msg || "Catatan penanganan berhasil disimpan");
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      setSuccess("");
      setError(pesanGalat(err, "Terjadi kesalahan saat menyimpan catatan"));
    },
  });

  return (
    <PageContainer title="Tambah Catatan Penanganan" description="Jurnal Harian Penanganan Siswa">
      <ParentCard title={jadwal ? "Catat Hasil Sesi Konseling" : "Tambah Catatan Penanganan"}>
        <Alerts error={error} success={success} />
        {jadwal && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Setelah disimpan, sesi &quot;{jadwal.topik}&quot; otomatis ditandai <strong>Selesai</strong>.
          </Alert>
        )}
        {pengaduan && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Catatan ini akan ditautkan ke pengaduan {pengaduan.kode_tiket}. Pilih siswa yang terlibat bila sudah teridentifikasi;
            jangan mencantumkan pelapor.
          </Alert>
        )}
        {memuat ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <JurnalForm
            siswaAwal={siswaAwal}
            nilaiAwal={nilaiAwal}
            onSubmit={(payload) => mutation.mutate(payload)}
            onCancel={() => navigate(-1)}
            isSubmitting={mutation.isPending}
          />
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default JurnalAdd;
