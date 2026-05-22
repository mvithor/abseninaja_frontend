import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, CircularProgress, Button, Stack } from "@mui/material";

import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";

import PpdbPeriodDetailContent from "src/apps/admin-sekolah/ppdb/ppdb-period/PpdbPeriodDetailContent";

const fetchPpdbPeriodDetail = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-period/${id}/detail`);
  return res.data?.data;
};

const PpdbPeriodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdbPeriodDetail", id],
    queryFn: () => fetchPpdbPeriodDetail(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const msg = err?.response?.data?.msg || err?.message || "Gagal memuat detail PPDB Period";
      setError(String(msg));
      setTimeout(() => setError(""), 3500);
    },
  });

  const status = useMemo(() => String(data?.status || "").toUpperCase(), [data?.status]);

  const actionMutation = useMutation({
    mutationFn: async ({ action }) => {
      // action: 'open' | 'close' | 'archive'
      const res = await axiosInstance.post(`/api/v1/admin-sekolah/ppdb-period-status/${id}/${action}`);
      return res.data;
    },
    onSuccess: (res) => {
      setSuccess(res?.msg || "Aksi berhasil");
      queryClient.invalidateQueries({ queryKey: ["ppdbPeriodDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["periods"] });
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

  const handleOpen = () => actionMutation.mutate({ action: "open" });
  const handleClose = () => actionMutation.mutate({ action: "close" });
  const handleArchive = () => actionMutation.mutate({ action: "archive" });

  return (
    <PageContainer title="Detail Periode PMB" description="Detail Periode PMB">
      <ParentCard
        title="Detail Periode PMB"
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Kembali
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/dashboard/admin-sekolah/ppdb-period/edit/${id}`)}
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
          <PpdbPeriodDetailContent
            detail={data}
            onOpen={handleOpen}
            onClose={handleClose}
            onArchive={handleArchive}
            isActionLoading={actionMutation.isLoading}
          />
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbPeriodDetail;
