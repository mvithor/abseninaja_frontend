import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import FiturSekolahEditForm from "src/apps/super-admin/fitur-tambahan-sekolah/edit/FiturSekolahEditForm";

const fetchFiturSekolah = async (sekolahId) => {
  const response = await axiosInstance.get(`/api/v1/super-admin/fitur-tambahan/${sekolahId}`);
  return response.data; // { data, meta } — meta bisa TIDAK ADA kalau data kosong
};

const FiturTambahanEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [togglingKey, setTogglingKey] = useState(null);
  // Deaktivasi dua tahap: null = tidak ada dialog terbuka. Kalau backend
  // balas peringatan:true (preview dampak tanpa eksekusi), state ini diisi
  // dan dialog konfirmasi muncul. Baru kalau user konfirmasi, request kedua
  // dikirim dengan confirm:true.
  const [confirmDialog, setConfirmDialog] = useState(null);

  // sekolah_id integer, BUKAN uuid — beda dari siswa.id
  const safeId = useMemo(() => {
    const parsed = Number(id);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [id]);

  // Fallback dari data yang sudah ada di tangan waktu user klik "Kelola" di
  // list — dipakai kalau response getFiturSekolah kebetulan tidak membawa
  // meta (cabang eligibleKeys.length === 0 di backend tidak menyertakannya).
  const fallbackMeta = location.state?.nama
    ? {
        nama: location.state.nama,
        bentuk_pendidikan_kode: location.state?.bentuk_pendidikan?.kode || null,
      }
    : null;

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["fitur-sekolah", safeId],
    queryFn: () => fetchFiturSekolah(safeId),
    enabled: !!safeId,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data fitur";
      setError(msg);
    },
  });

  // Redirect lewat effect — SEMUA hook di atas dan di bawah ini tetap
  // terpanggil setiap render, urutannya gak pernah berubah. Ini pola yang
  // sama persis dengan SiswaEdit.jsx.
  useEffect(() => {
    if (!safeId) {
      navigate("/dashboard/super-admin/fitur-tambahan");
    }
  }, [safeId, navigate]);

  const fiturList = data?.data || [];
  const meta = data?.meta || fallbackMeta;

  const toggleMutation = useMutation({
    mutationFn: async ({ fiturKey, enabled, confirm }) => {
      const response = await axiosInstance.put(
        `/api/v1/super-admin/fitur-tambahan/${safeId}/fitur/${fiturKey}`,
        { enabled, confirm },
      );
      return response.data;
    },
    onSuccess: (response, variables) => {
      // Deaktivasi tahap pertama — belum benar-benar dieksekusi backend,
      // cuma preview dampak. Buka dialog, jangan invalidate query (belum
      // ada yang berubah).
      if (response.peringatan) {
        setTogglingKey(null);
        setConfirmDialog({
          fiturKey: variables.fiturKey,
          jumlahJurusanAktif: response.jumlah_jurusan_aktif,
          jumlahKepalaJurusanAktif: response.jumlah_kepala_jurusan_aktif,
          pesan: response.pesan,
        });
        return;
      }

      setTogglingKey(null);
      setConfirmDialog(null);
      setSuccess(response.msg || "Fitur berhasil diperbarui");
      setTimeout(() => setSuccess(""), 3000);
      queryClient.invalidateQueries(["fitur-sekolah", safeId]);
    },
    onError: (err) => {
      setTogglingKey(null);
      const data = err?.response?.data;
      const parts = [
        data?.msg,
        data?.missing_dependencies?.length
          ? `Perlu aktif dulu: ${data.missing_dependencies.join(', ')}`
          : null,
        data?.blocking_dependents?.length
          ? `Nonaktifkan dulu: ${data.blocking_dependents.join(', ')}`
          : null,
      ].filter(Boolean);
      setError(parts.join(' — ') || "Terjadi kesalahan saat memperbarui fitur");
      setTimeout(() => setError(""), 4000);
    },
  });

  // Aktivasi maupun deaktivasi sama-sama mulai dengan confirm:false —
  // backend yang menentukan apakah itu langsung dieksekusi (aktivasi) atau
  // baru preview dampak (deaktivasi). Tidak perlu percabangan di FE.
  const handleToggle = (fiturKey, nextEnabled) => {
    setTogglingKey(fiturKey);
    toggleMutation.mutate({ fiturKey, enabled: nextEnabled, confirm: false });
  };

  const handleConfirmDeactivate = () => {
    if (!confirmDialog) return;
    setTogglingKey(confirmDialog.fiturKey);
    toggleMutation.mutate({
      fiturKey: confirmDialog.fiturKey,
      enabled: false,
      confirm: true,
    });
  };

  const handleCancelDialog = () => setConfirmDialog(null);

  const handleCancel = () => navigate("/dashboard/super-admin/fitur-tambahan");

  // Early return buat RENDER (bukan hook) — aman di sini karena semua hook
  // di atas sudah selesai dipanggil, urutannya tetap konsisten tiap render.
  if (!safeId) {
    return null;
  }

  return (
    <PageContainer title="Kelola Fitur Sekolah" description="Kelola Fitur Tambahan Sekolah">
      <ParentCard title="Kelola Fitur Tambahan">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <FiturSekolahEditForm
          meta={meta}
          fiturList={fiturList}
          onToggle={handleToggle}
          togglingKey={togglingKey}
          handleCancel={handleCancel}
          isLoading={isLoading}
        />
      </ParentCard>

      <Dialog open={Boolean(confirmDialog)} onClose={handleCancelDialog} fullWidth maxWidth="sm">
        <DialogTitle>Konfirmasi Nonaktifkan Fitur</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {confirmDialog?.pesan}
          </DialogContentText>
          <DialogContentText>
            Jurusan aktif terdampak: <strong>{confirmDialog?.jumlahJurusanAktif ?? 0}</strong>
          </DialogContentText>
          <DialogContentText>
            Kepala Jurusan ter-assign: <strong>{confirmDialog?.jumlahKepalaJurusanAktif ?? 0}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog} disabled={toggleMutation.isPending}>
            Batal
          </Button>
          <Button
            onClick={handleConfirmDeactivate}
            color="error"
            variant="contained"
            disabled={toggleMutation.isPending}
            startIcon={toggleMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Ya, Nonaktifkan
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default FiturTambahanEdit;