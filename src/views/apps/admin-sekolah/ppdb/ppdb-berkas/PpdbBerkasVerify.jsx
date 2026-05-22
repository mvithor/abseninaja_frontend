import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PpdbBerkasVerifyForm from "src/apps/admin-sekolah/ppdb/ppdb-berkas/PpdbBerkasVerifyForm";

const fetchDetail = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-berkas/${id}`);
  return res.data?.data;
};

const PpdbBerkasVerify = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [localReviews, setLocalReviews] = useState({});

  const { data, isLoading, isError, error: qErr } = useQuery({
    queryKey: ["ppdb-berkas-detail", id],
    queryFn: () => fetchDetail(id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isError) {
      const msg = qErr?.response?.data?.msg || qErr?.message || "Gagal memuat detail verifikasi";
      setError(String(msg));
      setTimeout(() => setError(""), 3000);
    }
  }, [isError, qErr]);

  const mutationBulk = useMutation({
    mutationFn: async ({ ppdb_application_id, items }) => {
      const payload = { ppdb_application_id, items };
      const res = await axiosInstance.post(`/api/v1/admin-sekolah/ppdb-berkas/bulk-verify`, payload);
      return res.data;
    },
    onSuccess: async (res) => {
      setSuccess(res?.msg || "Review berkas berhasil disimpan");
      setError("");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ppdb-berkas-detail", id] }),
        queryClient.invalidateQueries({ queryKey: ["ppdb-berkas-queue"] }),
      ]);

      setTimeout(() => {
        setSuccess("");
        navigate("/dashboard/admin-sekolah/ppdb-berkas", { replace: true });
      }, 400);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Gagal menyimpan review";
      const details = err?.response?.data?.errors || [];
      setError(Array.isArray(details) && details.length ? details.join(", ") : String(msg));
      setSuccess("");
      setTimeout(() => setError(""), 3500);
    },
  });

  const onSubmitBulk = (items) => {
    setError("");
    setSuccess("");

    const appId = data?.applicant?.id || id;
    if (!appId) {
      setError("ppdb_application_id tidak ditemukan");
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      setError("Tidak ada perubahan review yang bisa disimpan");
      return;
    }

    mutationBulk.mutate({ ppdb_application_id: appId, items });
  };

  const mutationLoading =
    Boolean(mutationBulk?.isLoading) ||
    Boolean(mutationBulk?.isPending) ||
    Boolean(mutationBulk?.status === "pending");

  return (
    <PageContainer title="Verifikasi Berkas PPDB" description="Review berkas pendaftar PPDB">
      <ParentCard title="Form Verifikasi Berkas PPDB">
        <PpdbBerkasVerifyForm
          detail={data}
          localReviews={localReviews}
          setLocalReviews={setLocalReviews}
          onSubmitBulk={onSubmitBulk}
          onCancel={() => navigate("/dashboard/admin-sekolah/ppdb-berkas")}
          isLoading={isLoading || mutationLoading}
          error={error}
          success={success}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbBerkasVerify;
