import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import EkskulEditForm from "src/apps/admin-sekolah/ekskul/Edit/EkskulEditForm";

const fetchEkskulById = async (id) => {
  const response = await axiosInstance.get(`/api/v1/admin-sekolah/ekskul/${id}`);
  return response.data.data;
};

const EkskulEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ekskulData, setEkskulData] = useState({
    nama_ekskul: "",
    deskripsi: "",
    logo_url: "",
    pembinaTerpilih: [],
    logo_file: null,
  });

  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["ekskul", id],
    queryFn: () => fetchEkskulById(id),
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || "Gagal memuat data ekskul";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    },
  });

  const {
    data: pegawaiOptions = [],
    isLoading: isPegawaiLoading,
  } = useQuery({
    queryKey: ["pegawaiOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/guru");
      return response.data.data;
    },
  });

  useEffect(() => {
    if (data && pegawaiOptions.length > 0) {
      const pembinaTerpilih = pegawaiOptions.filter((pegawai) =>
        data.pembina_ids?.includes(parseInt(pegawai.id))
      );
      setEkskulData((prev) => ({
        ...prev,
        nama_ekskul: data.nama_ekskul || "",
        deskripsi: data.deskripsi || "",
        logo_url: data.logo_url || "",
        pembinaTerpilih,
      }));
    }
  }, [data, pegawaiOptions]);
  
  

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("nama_ekskul", payload.nama_ekskul);
      formData.append("deskripsi", payload.deskripsi);
      formData.append("pembina_ids", JSON.stringify(payload.pembina_ids));
      if (payload.logo_file) {
        formData.append("logo", payload.logo_file);
      }

      return await axiosInstance.put(`/api/v1/admin-sekolah/ekskul/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (response) => {
      setSuccess(response.data.msg);
      queryClient.invalidateQueries(["ekskul"]);
      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/ekskul");
      }, 3000);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.msg || "Gagal memperbarui ekskul";
      setError(errorMsg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEkskulData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({
      ...ekskulData,
      pembina_ids: ekskulData.pembinaTerpilih.map((p) => p.id),
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Ekstrakurikuler" description="Edit Ekstrakurikuler">
      <ParentCard title=" Form Edit Ekstrakurikuler">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <EkskulEditForm
          ekskulData={ekskulData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || isPegawaiLoading || mutation.isLoading}
          setEkskulData={setEkskulData}
          setError={setError}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default EkskulEdit;
