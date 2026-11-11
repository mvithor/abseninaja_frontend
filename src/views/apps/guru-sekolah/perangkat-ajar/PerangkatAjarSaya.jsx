import { useMemo, useState } from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import SearchButton from "src/components/button-group/SearchButton";
import PenugasanSayaCard from "src/apps/guru-sekolah/perangkat-ajar/PenugasanSayaCard";
import UnggahPerangkatAjarDialog from "src/apps/guru-sekolah/perangkat-ajar/UnggahPerangkatAjarDialog";
import PemilihSemester from "src/components/perangkat-ajar/PemilihSemester";
import FilterVerifikasi from "src/components/perangkat-ajar/FilterVerifikasi";
import PdfPreviewDialog from "src/components/perangkat-ajar/PdfPreviewDialog";
import RiwayatVersiDialog from "src/components/perangkat-ajar/RiwayatVersiDialog";
import { useSemesterTerpilih } from "src/components/perangkat-ajar/useSemesterTerpilih";
import {
  formatTanggalWaktu,
  GURU_API,
  isKunciDibuka,
  labelPenugasan,
  PESAN_SEMESTER_ARSIP,
  saringPenugasan,
  sisaWaktuDeadline,
  statusUnggah,
  STATUS_PERANGKAT,
  VERIFIKASI,
} from "src/components/perangkat-ajar/perangkatAjarConfig";
import { useSchoolTimezone } from "src/hooks/useSchoolTimezone";
import axiosInstance from "src/utils/axiosInstance";

const TIGA_HARI_MS = 3 * 24 * 60 * 60 * 1000;

const fetchPerangkatAjarSaya = async (semesterId) => {
  const res = await axiosInstance.get(`${GURU_API}/perangkat-ajar`, {
    params: { semester_ajaran_id: semesterId },
  });
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const judulDokumen = (penugasan, dok) => `${dok.jenis?.label || "Dokumen"} · ${labelPenugasan(penugasan)}`;

// Ringkasan untuk banner (dihitung dari seluruh data, bukan hasil filter):
// deadline terdekat yang masih bisa diunggah, jumlah dokumen perlu revisi,
// dan jumlah dokumen belum diunggah yang sudah terkunci karena deadline lewat.
const ringkasBanner = (penugasanList) => {
  const now = new Date();
  let terdekat = null;
  let perluRevisi = 0;
  let terkunciBelumUnggah = 0;
  let dibuka = 0;

  penugasanList.forEach((penugasan) => {
    (penugasan.dokumen || []).forEach((dok) => {
      const { bisaUnggah, terkunci } = statusUnggah(dok, now);
      if (dok.status === STATUS_PERANGKAT.PERLU_REVISI) perluRevisi += 1;
      if (isKunciDibuka(dok, now)) dibuka += 1;
      if (terkunci && dok.status === STATUS_PERANGKAT.BELUM_UNGGAH) terkunciBelumUnggah += 1;
      if (bisaUnggah && dok.deadline) {
        const waktu = new Date(dok.deadline).getTime();
        if (waktu > now.getTime() && (!terdekat || waktu < terdekat.waktu)) {
          terdekat = { waktu, deadline: dok.deadline, label: judulDokumen(penugasan, dok) };
        }
      }
    });
  });

  return { terdekat, perluRevisi, terkunciBelumUnggah, dibuka, now };
};

const PerangkatAjarSaya = () => {
  const timezone = useSchoolTimezone();
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [verifikasi, setVerifikasi] = useState(VERIFIKASI.SEMUA);
  const [targetUnggah, setTargetUnggah] = useState(null);
  const [pratinjau, setPratinjau] = useState(null);
  const [riwayat, setRiwayat] = useState(null);

  const {
    options: semesterOptions,
    semesterId,
    setSemesterId,
    isArsip,
    isLoading: isSemesterLoading,
  } = useSemesterTerpilih(GURU_API);

  const { data: penugasanList = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["guru-perangkat-saya", semesterId],
    queryFn: () => fetchPerangkatAjarSaya(semesterId),
    enabled: !!semesterId,
    refetchOnWindowFocus: false,
  });

  const { terdekat, perluRevisi, terkunciBelumUnggah, dibuka, now } = useMemo(
    () => ringkasBanner(penugasanList),
    [penugasanList],
  );
  const penugasanTampil = useMemo(
    () => saringPenugasan(penugasanList, { q: search, verifikasi }),
    [penugasanList, search, verifikasi],
  );
  const adaFilter = Boolean(search.trim() || verifikasi);

  const handleUnggah = (penugasan, dokumen) => setTargetUnggah({ penugasan, dokumen });

  const handleUnggahSukses = (msg) => {
    setTargetUnggah(null);
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handlePratinjau = (penugasan, dok) => {
    setPratinjau({
      fileUrl: `${GURU_API}/perangkat-ajar/dokumen/${dok.id}/file`,
      judul: judulDokumen(penugasan, dok),
      namaFile: dok.file?.nama,
    });
  };

  const handleRiwayat = (penugasan, dok) => setRiwayat({ dokumenId: dok.id, judul: judulDokumen(penugasan, dok) });

  return (
    <PageContainer title="Perangkat Ajar Saya" description="Unggah Perangkat Ajar Guru">
      <ParentCard title="Perangkat Ajar Saya">
        <Alerts error={isError && (queryError?.response?.data?.msg || queryError?.message)} success={success} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Unggah perangkat ajar dalam format PDF. Unggahan terkunci otomatis setelah deadline.
          </Typography>
          <PemilihSemester
            options={semesterOptions}
            value={semesterId}
            onChange={setSemesterId}
            isLoading={isSemesterLoading}
          />
        </Box>

        {isArsip && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {PESAN_SEMESTER_ARSIP}
          </Alert>
        )}
        {!isArsip && perluRevisi > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {perluRevisi} perangkat ajar perlu direvisi. Baca catatan Waka Kurikulum, lalu klik <strong>Unggah Ulang</strong>.
          </Alert>
        )}
        {!isArsip && dibuka > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Waka Kurikulum membuka akses unggah untuk {dibuka} perangkat ajar yang sudah melewati deadline. Segera
            unggah sebelum batas waktunya berakhir.
          </Alert>
        )}
        {!isArsip && terdekat && (
          <Alert severity={terdekat.waktu - now.getTime() <= TIGA_HARI_MS ? "warning" : "info"} sx={{ mb: 2 }}>
            Deadline terdekat: <strong>{terdekat.label}</strong>, {formatTanggalWaktu(terdekat.deadline, timezone)} (
            {sisaWaktuDeadline(terdekat.deadline, now)})
          </Alert>
        )}
        {!isArsip && terkunciBelumUnggah > 0 && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            {terkunciBelumUnggah} perangkat ajar belum diunggah dan sudah terkunci karena deadline lewat. Hubungi Waka
            Kurikulum bila perlu dibuka kembali.
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <SearchButton
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mapel / kelas / jenis"
          />
          <FilterVerifikasi value={verifikasi} onChange={setVerifikasi} />
        </Box>

        {isLoading || isSemesterLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "160px" }}>
            <CircularProgress />
          </Box>
        ) : isError ? null : penugasanTampil.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ py: 4 }}>
            {!semesterId
              ? "Belum ada semester ajaran"
              : adaFilter
                ? "Tidak ada perangkat ajar yang cocok dengan pencarian atau filter"
                : "Anda belum memiliki penugasan mapel di semester ini"}
          </Typography>
        ) : (
          <Stack spacing={2}>
            {penugasanTampil.map((penugasan) => (
              <PenugasanSayaCard
                key={penugasan.id}
                penugasan={penugasan}
                timezone={timezone}
                onUnggah={handleUnggah}
                onPratinjau={handlePratinjau}
                onRiwayat={handleRiwayat}
                bacaSaja={isArsip}
              />
            ))}
          </Stack>
        )}
      </ParentCard>

      {targetUnggah && (
        <UnggahPerangkatAjarDialog
          key={`${targetUnggah.penugasan.id}-${targetUnggah.dokumen.jenis?.kode}`}
          target={targetUnggah}
          onClose={() => setTargetUnggah(null)}
          onSuccess={handleUnggahSukses}
        />
      )}

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
        apiBase={GURU_API}
        dokumenId={riwayat?.dokumenId}
        judul={riwayat?.judul}
        timezone={timezone}
      />
    </PageContainer>
  );
};

export default PerangkatAjarSaya;
