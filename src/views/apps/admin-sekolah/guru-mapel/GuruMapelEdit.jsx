import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import GuruMapelEditForm from "src/apps/admin-sekolah/guru-mapel/Edit/GuruMapelEditForm";

const fetchGuruMapelById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/guru-mapel/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching guru mapel:", error);
    }
    throw new Error("Terjadi kesalahan saat mengambil guru mata pelajaran. Silakan coba lagi");
  }
};

const GuruMapelEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [guruMapelData, setGuruMapelData] = useState({
    pegawai_id: "",
    offering_id: "",
  });

  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["guruMapelById", id],
    queryFn: () => fetchGuruMapelById(id),
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (data) {
      setGuruMapelData({
        pegawai_id: data.pegawai?.id || "",
        offering_id: data.offering?.id || "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (guruMapel) => {
      return await axiosInstance.put(`/api/v1/admin-sekolah/guru-mapel/${id}`, guruMapel);
    },
    onSuccess: (response) => {
      setSuccess(response.data.msg);
      queryClient.invalidateQueries(["guruMapel"]);
      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/guru-mapel");
      }, 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg =
        error.response?.data?.msg || "Terjadi kesalahan saat memperbarui data guru mapel";
      if (errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setGuruMapelData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(guruMapelData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Guru Mapel" description="Edit Guru Mata Pelajaran">
      <ParentCard title="Edit Guru Mata Pelajaran">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <GuruMapelEditForm
          guruMapelData={guruMapelData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default GuruMapelEdit;
