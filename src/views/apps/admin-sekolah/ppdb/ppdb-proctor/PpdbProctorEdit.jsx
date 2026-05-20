import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbProctorEditForm from "src/apps/admin-sekolah/ppdb/ppdb-proctor/PpdbProctorEditForm";

const fetchProctorById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-proctor/${id}`);
  return res.data.data;
};

const PpdbProctorEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [proctorData, setProctorData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["ppdbProctor", id],
    queryFn: () => fetchProctorById(id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) setProctorData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.put(`/api/v1/admin-sekolah/ppdb-proctor/${id}`, payload);
    },
    onSuccess: (res) => {
      setSuccess(res.data.msg);
      queryClient.invalidateQueries({ queryKey: ["ppdbProctor", id] });
      // list invalidation (nama queryKey list kamu bisa beda, sesuaikan)
      queryClient.invalidateQueries({ queryKey: ["ppdbProctors"] });
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.msg ||
        "Gagal memperbarui role proctor";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProctorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend update schema hanya menerima: role
    const payload = {
      role: String(proctorData?.role || "").toUpperCase(),
    };

    if (!payload.role) {
      setError("role wajib diisi");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!["PROCTOR", "ASSISTANT"].includes(payload.role)) {
      setError("role harus salah satu dari: PROCTOR / ASSISTANT");
      setTimeout(() => setError(""), 3000);
      return;
    }

    mutation.mutate(payload);
  };

  return (
    <PageContainer title="Edit Proctor PPDB">
      <ParentCard title="Form Edit Proctor PPDB">
        <Alerts error={error} success={success} />
        <PpdbProctorEditForm
          proctorData={proctorData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => navigate(-1)}
          isLoading={isLoading || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbProctorEdit;