import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import { validate as isUUID } from "uuid";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import SiswaEditForm from "src/apps/admin-sekolah/data-siswa/Edit/SiswaEditForm";

const fetchSiswaById = async (id) => {
  try {
    if (!id || !isUUID(id)) {
      throw new Error("Data Siswa tidak ditemukan");
    }

    const response = await axiosInstance.get(`/api/v1/admin-sekolah/siswa/${id}`);
    const siswaData = response.data.data;

    return {
      ...siswaData,
      id: siswaData.id,
      name: siswaData?.User?.name || "",
      email: siswaData?.User?.email || "",
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching siswa:", error);
    }
    throw new Error("Terjadi kesalahan saat mengambil data siswa. Silakan coba lagi.");
  }
};

const formatDateToYYYYMMDD = (date) => {
  if (!date) return null;

  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const SiswaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [siswaData, setSiswaData] = useState({
    name: "",
    email: "",
    jenis_kelamin: "",
    nis: "",
    tempat_lahir: "",
    tanggal_lahir: null,
    alamat: "",
    nomor_telepon_siswa: "",
    kode_qr: "",
    kelas_id: "",
  });

  const queryClient = useQueryClient();

  const safeId = useMemo(() => (id && isUUID(id) ? id : null), [id]);

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["siswa", safeId],
    queryFn: () => fetchSiswaById(safeId),
    enabled: !!safeId,
    onError: (err) => {
      const errorMessage =
        err?.response?.data?.msg ||
        err?.message ||
        "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (!safeId) {
      navigate("/dashboard/admin-sekolah/siswa");
    }
  }, [safeId, navigate]);

  useEffect(() => {
    if (data) {
      setSiswaData((prev) => ({
        ...prev,
        ...data,
      }));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.put(`/api/v1/admin-sekolah/siswa/${safeId}`, payload);
    },
    onSuccess: async (response) => {
      setSuccess(response?.data?.msg || "Data siswa berhasil diperbarui");

      await queryClient.invalidateQueries(["siswa", safeId]);
      await queryClient.invalidateQueries(["siswa"]);

      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/siswa");
      }, 1500);
    },
    onError: (err) => {
      const errorDetails = err?.response?.data?.errors || [];
      const errorMsg =
        err?.response?.data?.msg ||
        err?.message ||
        "Terjadi kesalahan saat memperbarui data siswa";

      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }

      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSiswaData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!siswaData || !safeId) return;

    const dataToSend = {
      data: {
        id: siswaData.id, 
        jenis_kelamin: siswaData.jenis_kelamin || null,
        kelas_id: siswaData.kelas_id,
        nis: siswaData.nis || null,
        tempat_lahir: siswaData.tempat_lahir || null,
        tanggal_lahir: formatDateToYYYYMMDD(siswaData.tanggal_lahir),
        alamat: siswaData.alamat || null,
        nomor_telepon_siswa: siswaData.nomor_telepon_siswa || null,
        User: {
          name: siswaData.name,
          email: siswaData.email,
        },
      },
    };

    mutation.mutate(dataToSend);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Form Edit Siswa" description="Form Edit Siswa">
      <ParentCard title="Form Edit Siswa">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <SiswaEditForm
          siswaData={siswaData || {}}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default SiswaEdit;
