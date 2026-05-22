import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, CircularProgress, Button, Stack } from "@mui/material";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";

import PpdbSesiJadwalDetailContent from "src/apps/admin-sekolah/ppdb/ppdb-sesi-jadwal/PpdbSesiJadwalDetailContent";

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const fetchDetail = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-sesi-jadwal/${id}/detail`);
  return res.data?.data;
};

const patchDetailAction = async ({ id, payload }) => {
  const res = await axiosInstance.patch(`/api/v1/admin-sekolah/ppdb-sesi-jadwal/${id}/detail`, payload);
  return res.data;
};

const PpdbSesiJadwalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdbSesiJadwalDetail", id],
    queryFn: () => fetchDetail(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Gagal memuat detail sesi jadwal";
      setError(String(msg));
      setTimeout(() => setError(""), 3500);
    },
  });

  const status = useMemo(() => safeUpper(data?.status), [data?.status]);

  const actionMutation = useMutation({
    mutationFn: ({ payload }) => patchDetailAction({ id, payload }),
    onSuccess: (res) => {
      setSuccess(res?.msg || "Aksi berhasil");
      queryClient.invalidateQueries({ queryKey: ["ppdbSesiJadwalDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdbSesiJadwalList"] }); // sesuaikan key list kamu
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Aksi gagal dilakukan";
      const details = err?.response?.data?.errors || [];
      if (Array.isArray(details) && details.length > 0) {
        setError(details.join(", "));
      } else {
        setError(String(msg));
      }
      setTimeout(() => setError(""), 3500);
    },
  });

  // ✅ FIX: HAPUS param sessionId karena id sudah dari useParams()
  const handlePublish = () => {
    actionMutation.mutate({ payload: { action: "PUBLISH" } });
  };

  const handleUnpublish = () => {
    actionMutation.mutate({ payload: { action: "UNPUBLISH" } });
  };

  const handleCancel = (cancelled_reason) => {
    actionMutation.mutate({
      payload: { action: "CANCEL", cancelled_reason: String(cancelled_reason || "").trim() },
    });
  };

  return (
    <PageContainer title="Detail Sesi Jadwal" description="Detail Sesi Jadwal">
      <ParentCard
        title="Detail Sesi Jadwal"
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Kembali
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate(`/dashboard/admin-sekolah/ppdb/sesi-jadwal/edit/${id}`)}
              disabled={status !== "DRAFT"}
              title={status !== "DRAFT" ? "Edit hanya tersedia saat status DRAFT" : ""}
            >
              Edit
            </Button>
          </Stack>
        }
      >
        <Alerts
          error={error || (isError && (queryError?.message || "Gagal memuat data"))}
          success={success}
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="60px">
            <CircularProgress />
          </Box>
        ) : (
          <PpdbSesiJadwalDetailContent
            detail={data}
            onBack={() => navigate(-1)}
            onEdit={() => navigate(`/dashboard/admin-sekolah/ppdb/sesi-jadwal/edit/${id}`)}
            onPublish={() => handlePublish()}
            onUnpublish={() => handleUnpublish()}
            onCancel={(_, reason) => handleCancel(reason)}
            isActionLoading={actionMutation.isLoading}
          />
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbSesiJadwalDetail;