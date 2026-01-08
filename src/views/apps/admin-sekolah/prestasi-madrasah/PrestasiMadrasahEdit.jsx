import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PrestasiMadrasahEditForm from "src/apps/admin-sekolah/prestasi-madrasah/Edit/PrestasiMadrasahEditForm";

const MAX_PDF_SIZE = 1 * 1024 * 1024;   // 1MB
const MAX_IMG_SIZE = 2 * 1024 * 1024;   // 2MB

// Fetch detail prestasi madrasah by ID
const fetchPrestasiMadrasahById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/admin-sekolah/prestasi-madrasah/${id}`
    );
    const data = response.data.data;

    return {
      id: data.id,
      nama_prestasi: data.nama_prestasi || "",
      kategori_sifat: data.kategori_sifat || "",
      kategori_bidang: data.kategori_bidang || "",
      tingkat: data.tingkat || "",
      peringkat: data.peringkat || "",
      penyelenggara: data.penyelenggara || "",
      lokasi: data.lokasi || "",
      link_berita: data.link_berita || "",
      deskripsi: data.deskripsi || "",
      tanggal_pencapaian: data.tanggal_pencapaian
        ? new Date(data.tanggal_pencapaian)
        : null,
      bukti_sertifikat_url: data.bukti_sertifikat_url || "",
      foto_kegiatan_url: data.foto_kegiatan_url || "",
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching prestasi madrasah:", error);
    }
    const msg =
      error.response?.data?.msg ||
      "Terjadi kesalahan saat mengambil data prestasi madrasah. Silakan coba lagi.";
    throw new Error(msg);
  }
};

const PrestasiMadrasahEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [prestasiData, setPrestasiData] = useState({
    id: "",
    nama_prestasi: "",
    kategori_sifat: "",
    kategori_bidang: "",
    tingkat: "",
    peringkat: "",
    penyelenggara: "",
    tanggal_pencapaian: null,
    lokasi: "",
    link_berita: "",
    deskripsi: "",
    bukti_sertifikat_url: "",
    foto_kegiatan_url: "",
  });

  // state untuk file baru (optional)
  const [filesState, setFilesState] = useState({
    bukti_sertifikat: null,
    foto_kegiatan: null,
  });

  const {
    data,
    isLoading: isFetching,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["PrestasiMadrasah", id],
    queryFn: () => fetchPrestasiMadrasahById(id),
    onError: (err) => {
      setError(err.message || "Terjadi kesalahan saat memuat data");
      setTimeout(() => setError(""), 3000);
    },
  });

  // Set state ketika data berhasil di-fetch
  useEffect(() => {
    if (data) {
      setPrestasiData(data);
      // reset file baru tiap kali data berganti
      setFilesState({
        bukti_sertifikat: null,
        foto_kegiatan: null,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.put(
        `/api/v1/admin-sekolah/prestasi-madrasah/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    },
    onSuccess: (response) => {
      const updated = response.data.data;
      setPrestasiData((prev) => ({
        ...prev,
        ...updated,
      }));
      setSuccess(response.data.msg || "Prestasi madrasah berhasil diperbarui");
      queryClient.invalidateQueries(["PrestasiMadrasah"]);
      queryClient.invalidateQueries(["PrestasiMadrasahList"]); 
      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/prestasi-institusi");
      }, 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg =
        error.response?.data?.msg ||
        "Terjadi kesalahan saat memperbarui data prestasi madrasah.";
      if (errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setTimeout(() => setError(""), 3000);
    },
  });

  // handleChange umum untuk input text/select
  const handleChange = (event) => {
    const { name, value } = event.target;
    setPrestasiData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle date untuk DatePicker
  const handleDateChange = (date) => {
    setPrestasiData((prev) => ({
      ...prev,
      tanggal_pencapaian: date || null,
    }));
  };

  // handle file untuk PDF & Image
  const handleFileChange = (fieldName, file) => {
    if (!file) {
      setFilesState((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      return;
    }

    // Validasi ukuran & tipe di FE biar user dapat feedback cepat
    if (fieldName === "bukti_sertifikat") {
      if (file.type !== "application/pdf") {
        setError("Bukti sertifikat wajib berupa file PDF.");
        setFilesState((prev) => ({ ...prev, [fieldName]: null }));
        setTimeout(() => setError(""), 3000);
        return;
      }
      if (file.size > MAX_PDF_SIZE) {
        setError("Ukuran file bukti sertifikat maksimal 1MB.");
        setFilesState((prev) => ({ ...prev, [fieldName]: null }));
        setTimeout(() => setError(""), 3000);
        return;
      }
    }

    if (fieldName === "foto_kegiatan") {
      if (!file.type.startsWith("image/")) {
        setError("Foto kegiatan wajib berupa file gambar (PNG/JPG/WEBP).");
        setFilesState((prev) => ({ ...prev, [fieldName]: null }));
        setTimeout(() => setError(""), 3000);
        return;
      }
      if (file.size > MAX_IMG_SIZE) {
        setError("Ukuran foto kegiatan maksimal 2MB.");
        setFilesState((prev) => ({ ...prev, [fieldName]: null }));
        setTimeout(() => setError(""), 3000);
        return;
      }
    }

    setFilesState((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!prestasiData) return;

    const {
      nama_prestasi,
      kategori_sifat,
      kategori_bidang,
      tingkat,
      peringkat,
      penyelenggara,
      tanggal_pencapaian,
      lokasi,
      link_berita,
      deskripsi,
    } = prestasiData;

    if (
      !nama_prestasi ||
      !kategori_sifat ||
      !kategori_bidang ||
      !tingkat ||
      !peringkat ||
      !penyelenggara ||
      !tanggal_pencapaian
    ) {
      setError("Lengkapi seluruh field wajib bertanda *.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const tanggalStr = tanggal_pencapaian
      ? new Date(tanggal_pencapaian).toISOString().split("T")[0]
      : "";

    const formData = new FormData();
    formData.append("nama_prestasi", nama_prestasi.trim());
    formData.append("kategori_sifat", kategori_sifat);
    formData.append("kategori_bidang", kategori_bidang);
    formData.append("tingkat", tingkat);
    formData.append("peringkat", peringkat);
    formData.append("penyelenggara", penyelenggara.trim());
    formData.append("tanggal_pencapaian", tanggalStr);
    formData.append("lokasi", lokasi || "");
    formData.append("link_berita", link_berita || "");
    formData.append("deskripsi", deskripsi || "");

    if (filesState.bukti_sertifikat) {
      formData.append("bukti_sertifikat", filesState.bukti_sertifikat);
    }
    if (filesState.foto_kegiatan) {
      formData.append("foto_kegiatan", filesState.foto_kegiatan);
    }

    mutation.mutate(formData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer
      title="Form Edit Prestasi Madrasah"
      description="Form Edit Prestasi Madrasah"
    >
      <ParentCard title="Form Edit Prestasi Madrasah">
        <Alerts
          error={error || (isError && queryError?.message)}
          success={success}
        />
        <PrestasiMadrasahEditForm
          prestasiData={prestasiData || {}}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          handleDateChange={handleDateChange}
          handleFileChange={handleFileChange}
          filesState={filesState}
          isLoading={isFetching || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PrestasiMadrasahEdit;
