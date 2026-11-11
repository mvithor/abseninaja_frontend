import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, Stack, Typography } from "@mui/material";
import { IconArrowLeft } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import SearchButton from "src/components/button-group/SearchButton";
import PerangkatAjarGuruHeader from "src/apps/waka-kurikulum/perangkat-ajar/Detail/PerangkatAjarGuruHeader";
import PenugasanPerangkatCard from "src/apps/waka-kurikulum/perangkat-ajar/Detail/PenugasanPerangkatCard";
import ValidasiDialog from "src/apps/waka-kurikulum/validasi/ValidasiDialog";
import BukaKunciDialog from "src/apps/waka-kurikulum/perangkat-ajar/Detail/BukaKunciDialog";
import PemilihSemester from "src/components/perangkat-ajar/PemilihSemester";
import FilterVerifikasi from "src/components/perangkat-ajar/FilterVerifikasi";
import PdfPreviewDialog from "src/components/perangkat-ajar/PdfPreviewDialog";
import RiwayatVersiDialog from "src/components/perangkat-ajar/RiwayatVersiDialog";
import { useSemesterTerpilih } from "src/components/perangkat-ajar/useSemesterTerpilih";
import { pesanGalatFile, unduhFile } from "src/components/perangkat-ajar/perangkatAjarApi";
import {
  isIdAngka,
  isKonflik,
  labelPenugasan,
  PESAN_SEMESTER_ARSIP,
  pesanGalat,
  saringPenugasan,
  VERIFIKASI,
  WAKA_API,
} from "src/components/perangkat-ajar/perangkatAjarConfig";
import { useSchoolTimezone } from "src/hooks/useSchoolTimezone";
import axiosInstance from "src/utils/axiosInstance";

const fetchPerangkatAjarGuruDetail = async (guruId, semesterId) => {
  const res = await axiosInstance.get(`${WAKA_API}/perangkat-ajar/guru/${guruId}`, {
    params: { semester_ajaran_id: semesterId },
  });
  return res.data?.data || null;
};

const urlFileDokumen = (dokumenId) => `${WAKA_API}/perangkat-ajar/dokumen/${dokumenId}/file`;
const judulDokumen = (penugasan, dok) => `${dok.jenis?.label || "Dokumen"} · ${labelPenugasan(penugasan)}`;

const PerangkatAjarGuruDetail = () => {
  const { guruId } = useParams();
  const navigate = useNavigate();
  const timezone = useSchoolTimezone();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [verifikasi, setVerifikasi] = useState(VERIFIKASI.SEMUA);
  const [pratinjau, setPratinjau] = useState(null);
  const [riwayat, setRiwayat] = useState(null);
  const [validasi, setValidasi] = useState(null);
  const [bukaKunci, setBukaKunci] = useState(null);
  const [kunciKembali, setKunciKembali] = useState(null);
  const queryClient = useQueryClient();
  const [unduhSedangId, setUnduhSedangId] = useState(null);

  // guru_id = pegawai.id (angka), bukan UUID.
  const safeId = useMemo(() => (isIdAngka(guruId) ? guruId : null), [guruId]);
  const {
    options: semesterOptions,
    semesterId,
    setSemesterId,
    isArsip,
    isLoading: isSemesterLoading,
  } = useSemesterTerpilih(WAKA_API);

  useEffect(() => {
    if (!safeId) navigate("/dashboard/waka-kurikulum/perangkat-ajar");
  }, [safeId, navigate]);

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["waka-perangkat-guru-detail", safeId, semesterId],
    queryFn: () => fetchPerangkatAjarGuruDetail(safeId, semesterId),
    enabled: !!safeId && !!semesterId,
    refetchOnWindowFocus: false,
  });

  const penugasanList = useMemo(() => data?.penugasan || [], [data]);
  const penugasanTampil = useMemo(
    () => saringPenugasan(penugasanList, { q: search, verifikasi }),
    [penugasanList, search, verifikasi],
  );
  const adaFilter = Boolean(search.trim() || verifikasi);

  const handlePratinjau = (penugasan, dok) => {
    setPratinjau({ fileUrl: urlFileDokumen(dok.id), judul: judulDokumen(penugasan, dok), namaFile: dok.file?.nama });
  };

  const handleRiwayat = (penugasan, dok) => {
    setRiwayat({ dokumenId: dok.id, judul: judulDokumen(penugasan, dok) });
  };

  const handleValidasi = (penugasan, dok) => setValidasi({ guru: data?.guru, penugasan, dokumen: dok });

  const tampilkanSukses = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleValidasiSukses = (msg) => {
    setValidasi(null);
    tampilkanSukses(msg);
  };

  const handleBukaKunci = (penugasan, dok) => setBukaKunci({ guru: data?.guru, penugasan, dokumen: dok });

  const handleBukaKunciSukses = (msg) => {
    setBukaKunci(null);
    tampilkanSukses(msg);
  };

  const kunciKembaliMutation = useMutation({
    mutationFn: async (dokumenId) => {
      const res = await axiosInstance.delete(`${WAKA_API}/perangkat-ajar/dokumen/${dokumenId}/buka-kunci`);
      return res.data;
    },
    onSuccess: (res) => {
      setKunciKembali(null);
      queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-detail"] });
      queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-list"] });
      tampilkanSukses(res?.msg || "Akses unggah dikunci kembali");
    },
    onError: (err) => {
      setKunciKembali(null);
      // 409: status di layar sudah usang (mis. batas buka kunci sudah lewat), muat ulang.
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-detail"] });
      setError(pesanGalat(err, "Terjadi kesalahan saat mengunci kembali"));
      setTimeout(() => setError(""), 4000);
    },
  });

  const handleUnduh = async (dok) => {
    setUnduhSedangId(dok.id);
    try {
      await unduhFile(urlFileDokumen(dok.id), dok.file?.nama);
    } catch (err) {
      setError(await pesanGalatFile(err, "File gagal diunduh. Silakan coba lagi."));
      setTimeout(() => setError(""), 3000);
    } finally {
      setUnduhSedangId(null);
    }
  };

  const handleKembali = () => {
    const query = semesterId ? `?semester=${semesterId}` : "";
    navigate(`/dashboard/waka-kurikulum/perangkat-ajar${query}`);
  };

  return (
    <PageContainer title="Detail Perangkat Ajar Guru" description="Detail Perangkat Ajar Guru">
      <ParentCard title="Detail Perangkat Ajar Guru">
        <Alerts
          error={error || (isError && (queryError?.response?.data?.msg || queryError?.message))}
          success={success}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Button startIcon={<IconArrowLeft size={18} />} onClick={handleKembali} color="secondary">
            Kembali
          </Button>
          <PemilihSemester
            options={semesterOptions}
            value={semesterId}
            onChange={setSemesterId}
            isLoading={isSemesterLoading}
          />
        </Box>

        {isLoading || isSemesterLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "160px" }}>
            <CircularProgress />
          </Box>
        ) : data ? (
          <>
            <PerangkatAjarGuruHeader
              guru={data.guru}
              kelengkapanPersen={data.kelengkapan_persen}
              ringkasan={data.ringkasan}
              penugasanList={penugasanList}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <SearchButton
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari mapel / kelas / jenis"
              />
              <FilterVerifikasi value={verifikasi} onChange={setVerifikasi} />
            </Box>

            {isArsip && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {PESAN_SEMESTER_ARSIP}
              </Alert>
            )}

            {penugasanTampil.length === 0 ? (
              <Typography variant="h6" align="center" sx={{ py: 4 }}>
                {adaFilter
                  ? "Tidak ada perangkat ajar yang cocok dengan pencarian atau filter"
                  : "Guru ini belum memiliki penugasan mapel di semester terpilih"}
              </Typography>
            ) : (
              <Stack spacing={2}>
                {penugasanTampil.map((penugasan) => (
                  <PenugasanPerangkatCard
                    key={penugasan.id}
                    penugasan={penugasan}
                    timezone={timezone}
                    onPratinjau={handlePratinjau}
                    onUnduh={handleUnduh}
                    onRiwayat={handleRiwayat}
                    onValidasi={handleValidasi}
                    onBukaKunci={handleBukaKunci}
                    onKunciKembali={(penugasan, dok) => setKunciKembali({ penugasan, dokumen: dok })}
                    unduhSedangId={unduhSedangId}
                    bacaSaja={isArsip}
                  />
                ))}
              </Stack>
            )}
          </>
        ) : null}
      </ParentCard>

      <PdfPreviewDialog
        open={Boolean(pratinjau)}
        onClose={() => setPratinjau(null)}
        fileUrl={pratinjau?.fileUrl}
        judul={pratinjau?.judul}
        namaFile={pratinjau?.namaFile}
      />

      <RiwayatVersiDialog
        open={Boolean(riwayat)}
        onClose={() => setRiwayat(null)}
        apiBase={WAKA_API}
        dokumenId={riwayat?.dokumenId}
        judul={riwayat?.judul}
        timezone={timezone}
      />

      {bukaKunci && (
        <BukaKunciDialog
          key={bukaKunci.dokumen.id}
          target={bukaKunci}
          timezone={timezone}
          onClose={() => setBukaKunci(null)}
          onSuccess={handleBukaKunciSukses}
        />
      )}

      <Dialog open={Boolean(kunciKembali)} onClose={() => setKunciKembali(null)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 1 }}>
            Kunci kembali akses unggah?
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            {kunciKembali && judulDokumen(kunciKembali.penugasan, kunciKembali.dokumen)}. Guru tidak bisa lagi mengunggah
            dokumen ini karena deadline sudah lewat.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={() => setKunciKembali(null)}>
            Batal
          </Button>
          <Button
            sx={{ mr: 3, backgroundColor: "#F48C06", "&:hover": { backgroundColor: "#f7a944" } }}
            variant="contained"
            onClick={() => kunciKembaliMutation.mutate(kunciKembali.dokumen.id)}
            disabled={kunciKembaliMutation.isPending}
          >
            {kunciKembaliMutation.isPending ? "Memproses..." : "Kunci Kembali"}
          </Button>
        </DialogActions>
      </Dialog>

      {validasi && (
        <ValidasiDialog
          key={validasi.dokumen.id}
          target={validasi}
          timezone={timezone}
          onClose={() => setValidasi(null)}
          onSuccess={handleValidasiSukses}
        />
      )}
    </PageContainer>
  );
};

export default PerangkatAjarGuruDetail;
