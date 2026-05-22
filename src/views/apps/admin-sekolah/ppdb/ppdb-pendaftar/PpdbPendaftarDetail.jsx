import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, CircularProgress, Button, Stack } from "@mui/material";

import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";

import PpdbPendaftarDetailContent from "src/apps/admin-sekolah/ppdb/ppdb-pendaftar/PpdbPendaftarDetailContent";

const fetchPpdbApplicantDetail = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-pendaftar/${id}`);
  return res.data?.data;
};

const PpdbPendaftarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdbApplicantDetail", id],
    queryFn: () => fetchPpdbApplicantDetail(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Gagal memuat detail pendaftar";
      setError(String(msg));
      setTimeout(() => setError(""), 3500);
    },
  });

  const status = useMemo(() => String(data?.status || "").toUpperCase(), [data?.status]);

  // NOTE:
  // promote itu aksi admin sekolah (sesuai FYI kamu).
  // Endpoint-nya belum kamu kasih, jadi aku buat placeholder.
  // Kamu tinggal sesuaikan: POST /api/v1/admin-sekolah/ppdb/applicants/:id/promote
  const promoteMutation = useMutation({
    mutationFn: async (applicantId) => {
      const res = await axiosInstance.post(`/api/v1/admin-sekolah/ppdb/applicants/${applicantId}/promote`);
      return res.data;
    },
    onSuccess: (res) => {
      setSuccess(res?.msg || "Promote berhasil");
      queryClient.invalidateQueries({ queryKey: ["ppdbApplicantDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdbApplicants"] }); // list
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Promote gagal dilakukan";
      const details = err?.response?.data?.errors || [];
      if (Array.isArray(details) && details.length > 0) {
        setError(details.join(", "));
      } else {
        setError(String(msg));
      }
      setTimeout(() => setError(""), 3500);
    },
  });

  return (
    <PageContainer title="Detail Pendaftar" description="Detail Pendaftar">
      <ParentCard
        title="Detail Pendaftar"
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Kembali
            </Button>

            {/* contoh: tombol ini hanya logis kalau ada halaman edit DRAFT (opsional) */}
            <Button
              variant="outlined"
              onClick={() => navigate(`/dashboard/admin-sekolah/ppdb/pendaftar/edit/${id}`)}
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
          <PpdbPendaftarDetailContent
            detail={data}
            onBack={() => navigate(-1)}
            onPromote={(applicantId) => promoteMutation.mutate(applicantId)}
            isActionLoading={promoteMutation.isLoading}
          />
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbPendaftarDetail;
