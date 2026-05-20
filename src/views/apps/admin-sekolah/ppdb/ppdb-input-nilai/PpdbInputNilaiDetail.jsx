import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, CircularProgress, Button, Stack } from "@mui/material";

import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbInputNilaiDetailContent from "src/apps/admin-sekolah/ppdb/ppdb-input-nilai/PpdbInputNilaiDetailContent";

const API_BASE = "/api/v1/admin-sekolah/ppdb-test-results";

const fetchInputNilaiDetail = async (participant_id) => {
  const res = await axiosInstance.get(`${API_BASE}/participant/${participant_id}`);
  return res.data?.data;

};

const upsertNilai = async ({ participant_id, payload }) => {
  const res = await axiosInstance.put(`${API_BASE}/participant/${participant_id}`, payload);
  return res.data?.data;
};

const reopenNilai = async ({ participant_id, reason }) => {
  const res = await axiosInstance.post(`${API_BASE}/participant/${participant_id}/reopen`, {
    reason: reason || "",
  });
  return res.data?.data;
};

const PpdbInputNilaiDetail = () => {
  const { participant_id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showError = (msg) => {
    setError(String(msg || "Terjadi kesalahan"));
    setTimeout(() => setError(""), 3500);
  };

  const showSuccess = (msg) => {
    setSuccess(String(msg || "Berhasil"));
    setTimeout(() => setSuccess(""), 2500);
  };

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdbInputNilaiDetail", participant_id],
    queryFn: () => fetchInputNilaiDetail(participant_id),
    enabled: Boolean(participant_id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Gagal memuat detail input nilai";
      showError(msg);
    },
  });

  const isResultFinal = useMemo(() => {
    const s = String(data?.Result?.status || "").toUpperCase();
    return s === "FINAL";
  }, [data?.Result?.status]);

  const mutationUpsert = useMutation({
    mutationFn: ({ payload }) => upsertNilai({ participant_id, payload }),
    onSuccess: () => {
      showSuccess("Nilai berhasil disimpan");
      qc.invalidateQueries({ queryKey: ["ppdbInputNilaiDetail", participant_id] });
      qc.invalidateQueries({ queryKey: ["ppdb-test-results-list"] });
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || err?.message || "Gagal menyimpan nilai";
      const metaReason = err?.response?.data?.meta?.reason;

      if (metaReason === "ATTENDANCE_NOT_ELIGIBLE") {
        showError(`${msg}. Pastikan peserta PRESENT/LATE.`);
        return;
      }
      if (metaReason === "SESSION_NOT_ALLOWED") {
        showError(`${msg}. Status sesi tidak mengizinkan penilaian.`);
        return;
      }
      if (metaReason === "RESULT_LOCKED_FINAL") {
        showError(`${msg}. Klik REOPEN dulu untuk mengubah.`);
        return;
      }
      if (metaReason === "ENROLLMENT_NOT_FOUND") {
        showError(`${msg}. Pipeline bootstrap enrollment bermasalah.`);
        return;
      }

      showError(msg);
    },
  });

  const mutationReopen = useMutation({
    mutationFn: ({ reason }) => reopenNilai({ participant_id, reason }),
    onSuccess: () => {
      showSuccess("Nilai berhasil di-reopen (FINAL → DRAFT)");
      qc.invalidateQueries({ queryKey: ["ppdbInputNilaiDetail", participant_id] });
      qc.invalidateQueries({ queryKey: ["ppdb-test-results-list"] });
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || err?.message || "Gagal reopen nilai";
      showError(msg);
    },
  });

  const isActionLoading = mutationUpsert.isPending || mutationReopen.isPending;

  const handleSubmitNilai = (payload) => {
    if (payload?.__client_error) {
      showError(payload.__client_error);
      return;
    }
    mutationUpsert.mutate({ payload });
  };

  const handleReopen = () => {
    mutationReopen.mutate({ reason: "" });
  };

  return (
    <PageContainer title="Input Nilai Tes" description="Input Nilai Tes">
      <ParentCard
        title="Input Nilai Tes"
        action={
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={isActionLoading}>
              Kembali
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={handleReopen}
              disabled={!isResultFinal || isActionLoading}
            >
              Reopen
            </Button>
          </Stack>
        }
      >
        <Alerts
          error={error || (isError && (queryError?.message || "Gagal memuat data"))}
          success={success}
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="80px">
            <CircularProgress />
          </Box>
        ) : (
          <PpdbInputNilaiDetailContent
            detail={data}
            onBack={() => navigate(-1)}
            isActionLoading={isActionLoading}
            onSubmitNilai={handleSubmitNilai}
            onReopen={handleReopen}
          />
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbInputNilaiDetail;