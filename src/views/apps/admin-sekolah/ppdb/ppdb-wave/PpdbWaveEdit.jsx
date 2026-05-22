import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbWaveEditForm from "src/apps/admin-sekolah/ppdb/ppdb-wave/PpdbWaveEditForm";

const fetchWaveById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-wave/${id}`);
  return res.data.data;
};

const PpdbWaveEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [waveData, setWaveData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["ppdbWave", id],
    queryFn: () => fetchWaveById(id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) setWaveData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.put(
        `/api/v1/admin-sekolah/ppdb-wave/${id}`,
        payload
      );
    },
    onSuccess: (res) => {
      setSuccess(res.data.msg);
      queryClient.invalidateQueries({ queryKey: ["ppdbWave", id] });
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memperbarui gelombang");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWaveData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      nama: waveData.nama,
      open_at: waveData.open_at || undefined,
      close_at: waveData.close_at || undefined,
      quota_global: waveData.quota_global ?? undefined,
    };

    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    mutation.mutate(payload);
  };

  return (
    <PageContainer title="Edit Gelombang PMB" description="Edit Gelombang PMB">
      <ParentCard title="Form Edit Gelombang PMB">
        <Alerts error={error} success={success} />
        <PpdbWaveEditForm
          waveData={waveData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => navigate(-1)}
          isLoading={isLoading || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbWaveEdit;
