import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress, Button, Stack } from "@mui/material";

import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbNilaiDetailContent from "src/apps/admin-sekolah/ppdb/ppdb-nilai/PpdbilaiDetailContent";

const fetchNilaiMonitorDetail = async (ppdb_application_id) => {
  const res = await axiosInstance.get(
    `/api/v1/admin-sekolah/ppdb-nilai-monitor/${ppdb_application_id}`
  );
  return res.data?.data;
};

const PpdbNilaiDetail = () => {
  const { id } = useParams(); // id = ppdb_application_id
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdbNilaiMonitorDetail", id],
    queryFn: () => fetchNilaiMonitorDetail(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Gagal memuat detail monitoring nilai";
      setError(String(msg));
      setTimeout(() => setError(""), 3500);
    },
  });

  return (
    <PageContainer
      title="Detail Monitoring Nilai"
      description="Detail Monitoring Nilai"
    >
      <ParentCard
        title="Detail Monitoring Nilai"
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Kembali
            </Button>
          </Stack>
        }
      >
        <Alerts
          error={error || (isError && (queryError?.message || "Gagal memuat data"))}
          success=""
        />

        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="60px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <PpdbNilaiDetailContent
            detail={data}
            onBack={() => navigate(-1)}
            isActionLoading={false}
          />
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbNilaiDetail;