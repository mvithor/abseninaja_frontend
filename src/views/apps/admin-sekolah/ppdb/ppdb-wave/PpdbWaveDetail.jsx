import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Chip
} from "@mui/material";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbWaveDetailContent from "src/apps/admin-sekolah/ppdb/ppdb-wave/PpdbWaveDetailContent";

const fetchWaveById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-wave/${id}`);
  return res.data?.data;
};

const getStatusChipProps = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "OPEN") return { label: "OPEN", color: "success" };
  if (s === "DRAFT") return { label: "DRAFT", color: "default" };
  if (s === "CLOSED") return { label: "CLOSED", color: "warning" };
  if (s === "ARCHIVED") return { label: "ARCHIVED", color: "secondary" };
  return { label: s || "-", color: "default" };
};

const PpdbWaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirm, setConfirm] = useState({
    open: false,
    type: "", 
    title: "",
    description: ""
  });

  const { data: waveData, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdb-wave-detail", id],
    queryFn: () => fetchWaveById(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const msg = err?.response?.data?.msg || err?.message || "Gagal memuat detail gelombang";
      setError(String(msg));
      setTimeout(() => setError(""), 3000);
    }
  });

  const status = useMemo(() => String(waveData?.status || "").toUpperCase(), [waveData?.status]);
  const statusProps = useMemo(() => getStatusChipProps(status), [status]);

  const canOpen = status === "DRAFT";
  const canClose = status === "OPEN";

  const openMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/api/v1/admin-sekolah/ppdb-wave/${id}/open`);
      return res.data;
    },
    onSuccess: (res) => {
      setSuccess(res?.msg || "Gelombang berhasil dibuka");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["ppdb-wave-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-wave"] });
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Gagal membuka gelombang";
      setError(String(msg));
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    }
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/api/v1/admin-sekolah/ppdb-wave/${id}/close`);
      return res.data;
    },
    onSuccess: (res) => {
      setSuccess(res?.msg || "Gelombang berhasil ditutup");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["ppdb-wave-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-wave"] });
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Gagal menutup gelombang";
      setError(String(msg));
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    }
  });

  const isActionLoading = openMutation.isLoading || closeMutation.isLoading;

  const handleAskOpen = () => {
    if (!canOpen) {
      setError("Gelombang hanya bisa dibuka saat status masih DRAFT");
      setTimeout(() => setError(""), 2500);
      return;
    }
    setConfirm({
      open: true,
      type: "OPEN",
      title: "Buka Gelombang PPDB?",
      description:
        "Saat gelombang dibuka, pendaftaran bisa mulai berjalan. Pastikan tanggal buka/tutup sudah benar."
    });
  };

  const handleAskClose = () => {
    if (!canClose) {
      setError("Gelombang hanya bisa ditutup saat status OPEN");
      setTimeout(() => setError(""), 2500);
      return;
    }
    setConfirm({
      open: true,
      type: "CLOSE",
      title: "Tutup Gelombang PPDB?",
      description:
        "Saat gelombang ditutup, pendaftaran untuk gelombang ini dihentikan. Aksi ini tidak bisa dibatalkan dari halaman ini."
    });
  };

  const handleConfirm = () => {
    if (isActionLoading) return;

    if (confirm.type === "OPEN") openMutation.mutate();
    if (confirm.type === "CLOSE") closeMutation.mutate();

    setConfirm((p) => ({ ...p, open: false }));
  };

  const handleCancelConfirm = () => {
    if (isActionLoading) return;
    setConfirm((p) => ({ ...p, open: false }));
  };

  return (
    <PageContainer title="Detail Gelombang PMB" description="Detail Gelombang PMB">
      <ParentCard
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Detail Gelombang PMB
            </Typography>
            <Chip
                label="DRAFT"
                size="small"
                color="default"
                sx={{
                    borderRadius: '4px',
                    bgcolor: "#0A84FF",
                    color: "#fff",
                    fontWeight: 700,
                }}
                {...statusProps}
                />
          </Box>
        }
      >
        <Alerts
          error={error || (isError && (queryError?.message || "Gagal memuat data"))}
          success={success}
        />

        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 3 }}>
            <CircularProgress size={22} />
            <Typography>Memuat data...</Typography>
          </Box>
        ) : !waveData ? (
          <Box sx={{ py: 3 }}>
            <Typography color="error" sx={{ fontWeight: 600 }}>
              Data gelombang tidak ditemukan.
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Silakan kembali dan pilih gelombang lain.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Kembali
              </Button>
            </Box>
          </Box>
        ) : (
          <PpdbWaveDetailContent
            waveData={waveData}
            onOpenClick={handleAskOpen}
            onCloseClick={handleAskClose}
            onBack={() => navigate(-1)}
            isActionLoading={isActionLoading}
          />
        )}
      </ParentCard>

      <Dialog
        open={confirm.open}
        onClose={handleCancelConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
            {confirm.title}
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 2, opacity: 0.8 }}>
            {confirm.description}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button variant="outlined" onClick={handleCancelConfirm} disabled={isActionLoading}>
            Batal
          </Button>

          <Button
            variant="contained"
            color={confirm.type === "OPEN" ? "success" : "warning"}
            onClick={handleConfirm}
            disabled={isActionLoading}
          >
            {isActionLoading ? <CircularProgress size={22} /> : (confirm.type === "OPEN" ? "Buka" : "Tutup")}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PpdbWaveDetail;
