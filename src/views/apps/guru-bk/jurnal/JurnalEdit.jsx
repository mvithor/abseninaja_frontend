import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import JurnalForm from "src/apps/guru-bk/jurnal/JurnalForm";
import { BK_API } from "src/components/pemetaan-siswa/pemetaanConfig";
import { invalidasiJurnal } from "src/components/jurnal-bk/jurnalConfig";
import { pesanGalat } from "src/components/perangkat-ajar/perangkatAjarConfig";
import axiosInstance from "src/utils/axiosInstance";

const URL_JURNAL = "/dashboard/guru-bk/jurnal";

const JurnalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const safeId = useMemo(() => (id && isUUID(id) ? id : null), [id]);

  useEffect(() => {
    if (!safeId) navigate(URL_JURNAL);
  }, [safeId, navigate]);

  const { data: entri, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["bk-jurnal-detail", safeId],
    queryFn: async () => (await axiosInstance.get(`${BK_API}/jurnal/${safeId}`)).data?.data,
    enabled: !!safeId,
  });

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.patch(`${BK_API}/jurnal/${safeId}`, payload)).data,
    onSuccess: (data) => {
      invalidasiJurnal(queryClient);
      setError("");
      setSuccess(data?.msg || "Catatan penanganan berhasil diperbarui");
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      setSuccess("");
      setError(pesanGalat(err, "Terjadi kesalahan saat memperbarui catatan"));
    },
  });

  return (
    <PageContainer title="Ubah Catatan Penanganan" description="Jurnal Harian Penanganan Siswa">
      <ParentCard title="Ubah Catatan Penanganan">
        <Alerts error={error || (isError && (queryError?.response?.data?.msg || queryError?.message))} success={success} />
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : entri && !entri.bisa_ubah ? (
          <Alert severity="warning">Hanya BK penulis ({entri.bk?.nama}) yang dapat mengubah catatan ini.</Alert>
        ) : entri ? (
          <JurnalForm
            key={entri.id}
            entri={entri}
            onSubmit={(payload) => mutation.mutate(payload)}
            onCancel={() => navigate(-1)}
            isSubmitting={mutation.isPending}
          />
        ) : null}
      </ParentCard>
    </PageContainer>
  );
};

export default JurnalEdit;
