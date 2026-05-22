import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbWaveTrackEditForm from "src/apps/admin-sekolah/ppdb/ppdb-wave-track/PpdbWaveTrackEditForm";

const fetchWaveTrackById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-wave-track/${id}`);
  return res.data.data;
};

const PpdbWaveTrackEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [waveTrackData, setWaveTrackData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["ppdbWaveTrack", id],
    queryFn: () => fetchWaveTrackById(id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) setWaveTrackData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.put(`/api/v1/admin-sekolah/ppdb-wave-track/${id}`, payload);
    },
    onSuccess: (res) => {
      setSuccess(res.data.msg);
      queryClient.invalidateQueries({ queryKey: ["ppdbWaveTrack", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdbWaveTracks"] });
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Gagal memperbarui mapping jalur-gelombang";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWaveTrackData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      is_open: waveTrackData.is_open,
      quota:
        waveTrackData.quota === "" || waveTrackData.quota === null
          ? null
          : Number.isNaN(Number(waveTrackData.quota))
            ? undefined
            : Number(waveTrackData.quota),
      open_at: waveTrackData.open_at || null,
      close_at: waveTrackData.close_at || null,
      sort_order:
        waveTrackData.sort_order === "" || waveTrackData.sort_order === null
          ? null
          : Number.isNaN(Number(waveTrackData.sort_order))
            ? undefined
            : Number(waveTrackData.sort_order),
    };

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    mutation.mutate(payload);
  };

  return (
    <PageContainer title="Edit Mapping Jalur-Gelombang PMB">
      <ParentCard title="Form Edit Mapping Jalur-Gelombang PMB">
        <Alerts error={error} success={success} />
        <PpdbWaveTrackEditForm
          waveTrackData={waveTrackData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => navigate(-1)}
          isLoading={isLoading || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbWaveTrackEdit;
