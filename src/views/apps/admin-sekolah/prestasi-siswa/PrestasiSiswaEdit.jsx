import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PrestasiSiswaEditForm from "src/apps/admin-sekolah/prestasi-siswa/Edit/PrestasiSiswaEditForm";

const MAX_PDF_SIZE = 1 * 1024 * 1024;   // 1MB
const MAX_IMG_SIZE = 2 * 1024 * 1024;   // 2MB

const fetchPrestasiSiswaById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/admin-sekolah/prestasi-siswa/${id}`
    );
    const data = response.data.data;

    return {
      id: data.id,
      nama_prestasi: data.nama_prestasi || "",
      jenis_peserta: data.jenis_peserta || "",
      kategori_sifat: data.kategori_sifat || "",
      kategori_bidang: data.kategori_bidang || "",
      tingkat: data.tingkat || "",
      peringkat: data.peringkat || "",
      penyelenggara: data.penyelenggara || "",
      deskripsi: data.deskripsi || "",
      ekskul_id: data.ekskul_id || "",

      tanggal_pencapaian: data.tanggal_pencapaian
        ? new Date(data.tanggal_pencapaian)
        : null,
      lokasi: data.lokasi || "",
      link_berita: data.link_berita || "",

      bukti_sertifikat_url: data.bukti_sertifikat_url || "",
      foto_kegiatan_url: data.foto_kegiatan_url || "",

      siswa_ids: (data.anggota || []).map((a) => a.siswa_id),
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching prestasi siswa:", error);
    }
    const msg =
      error.response?.data?.msg ||
      "Terjadi kesalahan saat mengambil data prestasi. Silakan coba lagi.";
    throw new Error(msg);
  }
};

const PrestasiSiswaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [prestasiData, setPrestasiData] = useState({
    id: "",
    nama_prestasi: "",
    jenis_peserta: "",
    kategori_sifat: "",
    kategori_bidang: "",
    tingkat: "",
    peringkat: "",
    penyelenggara: "",
    deskripsi: "",
    ekskul_id: "",
    siswa_ids: [],

    tanggal_pencapaian: null,
    lokasi: "",
    link_berita: "",
    bukti_sertifikat_url: "",
    foto_kegiatan_url: "",
  });

  const [filesState, setFilesState] = useState({
    bukti_sertifikat: null,
    foto_kegiatan: null,
  });

  const {
    data,
    isLoading: isFetching,
    isError,
    error: queryError
  } = useQuery({
    queryKey: ["PrestasiSiswa", id],
    queryFn: () => fetchPrestasiSiswaById(id),
    onError: (err) => {
      setError(err.message || "Terjadi kesalahan saat memuat data");
      setTimeout(() => setError(""), 3000);
    }
  });

  useEffect(() => {
    if (data) {
      setPrestasiData(data);
      setFilesState({
        bukti_sertifikat: null,
        foto_kegiatan: null,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.put(
        `/api/v1/admin-sekolah/prestasi-siswa/${id}`,
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
      setSuccess(response.data.msg || "Prestasi siswa berhasil diperbarui");
      queryClient.invalidateQueries(["PrestasiSiswa"]);
      queryClient.invalidateQueries(["PrestasiSiswaList"]);
      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/prestasi-siswa");
      }, 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg =
        error.response?.data?.msg ||
        "Terjadi kesalahan saat memperbarui data prestasi.";
      if (errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setTimeout(() => setError(""), 3000);
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPrestasiData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setPrestasiData((prev) => ({
      ...prev,
      tanggal_pencapaian: date || null,
    }));
  };

  const handleFileChange = (fieldName, file) => {
    if (!file) {
      setFilesState((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      return;
    }

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

    const siswaIds = prestasiData.siswa_ids || [];

    if (prestasiData.jenis_peserta === "INDIVIDU" && siswaIds.length !== 1) {
      setError("Prestasi individu harus memiliki tepat 1 siswa.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (prestasiData.jenis_peserta === "REGU" && siswaIds.length < 2) {
      setError("Prestasi regu minimal harus memiliki 2 siswa.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const tanggalStr = prestasiData.tanggal_pencapaian
      ? new Date(prestasiData.tanggal_pencapaian).toISOString().split("T")[0]
      : "";

    const formData = new FormData();
    formData.append("nama_prestasi", (prestasiData.nama_prestasi || "").trim());
    formData.append("jenis_peserta", prestasiData.jenis_peserta);
    formData.append("kategori_sifat", prestasiData.kategori_sifat);
    formData.append("kategori_bidang", prestasiData.kategori_bidang);
    formData.append("tingkat", prestasiData.tingkat);
    formData.append("peringkat", prestasiData.peringkat);
    formData.append("penyelenggara", (prestasiData.penyelenggara || "").trim());
    formData.append("deskripsi", (prestasiData.deskripsi || "").trim());
    formData.append("ekskul_id", prestasiData.ekskul_id || "");
    formData.append("tanggal_pencapaian", tanggalStr);
    formData.append("lokasi", prestasiData.lokasi || "");
    formData.append("link_berita", prestasiData.link_berita || "");

    // PENTING: multipart -> kirim siswa_ids sebagai JSON string
    formData.append("siswa_ids", JSON.stringify(siswaIds));

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
      title="Form Edit Prestasi Siswa"
      description="Form Edit Prestasi Siswa"
    >
      <ParentCard title="Form Edit Prestasi Siswa">
        <Alerts
          error={error || (isError && queryError?.message)}
          success={success}
        />
        <PrestasiSiswaEditForm
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

export default PrestasiSiswaEdit;
