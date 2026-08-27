import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import { validate as isUUID } from "uuid";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import MitraIndustriEditForm from "src/apps/kepala-jurusan/mitra-industri/Edit/MitraIndustriEditForm";

const fetchMitraIndustriById = async (id) => {
  try {
    if (!id || !isUUID(id)) {
      throw new Error("Mitra industri tidak ditemukan");
    }

    const response = await axiosInstance.get(`/api/v1/kepala-jurusan/mitra-industri/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching mitra industri:", error);
    }
    throw new Error("Terjadi kesalahan saat mengambil data mitra industri. Silakan coba lagi.");
  }
};

// Endpoint yang sama dipakai form Add — sudah scope ke jurusan Kajur ini +
// semester aktif dari backend. Satu query, dipakai bersama data industri
// (juga satu query) — total dua panggilan, bukan N+1.
const fetchSkkniOptions = async () => {
  const response = await axiosInstance.get("/api/v1/kepala-jurusan/skkni-unit");
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

const formatDateToYYYYMMDD = (date) => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const MitraIndustriEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mitraIndustriData, setMitraIndustriData] = useState({
    nama_industri: "",
    kapasitas_per_periode: "",
    tanggal_mulai_kemitraan: null,
    status_aktif: true,
    kemauan_membimbing_teknis: false,
    nama_kontak: "",
    telepon_kontak: "",
    email_kontak: "",
    alamat_industri: "",
  });
  const [selectedSkkni, setSelectedSkkni] = useState([]);

  const queryClient = useQueryClient();

  const safeId = useMemo(() => (id && isUUID(id) ? id : null), [id]);

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["mitra-industri", safeId],
    queryFn: () => fetchMitraIndustriById(safeId),
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

  const { data: skkniOptions = [], isLoading: isSkkniLoading } = useQuery({
    queryKey: ["skkni-unit-options"],
    queryFn: fetchSkkniOptions,
  });

  useEffect(() => {
    if (!safeId) {
      navigate("/dashboard/kepala-jurusan/mitra-industri");
    }
  }, [safeId, navigate]);

  useEffect(() => {
    if (data) {
      setMitraIndustriData((prev) => ({
        ...prev,
        ...data,
      }));
      // UnitKompetensi dari getMitraIndustriById sudah bentuk {id, kode_unit,
      // judul_unit, kategori} — cocok langsung sama shape skkniOptions,
      // gak perlu mapping tambahan buat Autocomplete.
      setSelectedSkkni(data.UnitKompetensi || []);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.put(`/api/v1/kepala-jurusan/mitra-industri/${safeId}`, payload);
    },
    onSuccess: async (response) => {
      setSuccess(response?.data?.msg || "Mitra industri berhasil diperbarui");

      await queryClient.invalidateQueries({ queryKey: ["mitra-industri", safeId] });
      await queryClient.invalidateQueries({ queryKey: ["mitra-industri-list"] });

      setTimeout(() => {
        navigate("/dashboard/kepala-jurusan/mitra-industri");
      }, 1500);
    },
    onError: (err) => {
      const errorDetails = err?.response?.data?.errors || [];
      const errorMsg =
        err?.response?.data?.msg ||
        err?.message ||
        "Terjadi kesalahan saat memperbarui mitra industri";

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

    setMitraIndustriData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setMitraIndustriData((prevState) => ({
      ...prevState,
      tanggal_mulai_kemitraan: date,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!mitraIndustriData || !safeId) return;

    const dataToSend = {
      nama_industri: String(mitraIndustriData.nama_industri || "").trim(),
      kapasitas_per_periode: Number(mitraIndustriData.kapasitas_per_periode),
      tanggal_mulai_kemitraan: formatDateToYYYYMMDD(mitraIndustriData.tanggal_mulai_kemitraan),
      status_aktif: Boolean(mitraIndustriData.status_aktif),
      kemauan_membimbing_teknis: Boolean(mitraIndustriData.kemauan_membimbing_teknis),
      nama_kontak: String(mitraIndustriData.nama_kontak || "").trim(),
      telepon_kontak: String(mitraIndustriData.telepon_kontak || "").trim(),
      email_kontak: mitraIndustriData.email_kontak ? String(mitraIndustriData.email_kontak).trim() : null,
      alamat_industri: String(mitraIndustriData.alamat_industri || "").trim(),
      // Selalu dikirim penuh (keadaan akhir), bukan cuma kalau diubah —
      // lihat catatan Joi updateSchema: array eksplisit (termasuk kosong)
      // BEDA dari tidak dikirim sama sekali.
      skkni_unit_ids: selectedSkkni.map((u) => u.id),
      // latitude/longitude/google_place_id SENGAJA tidak disertakan —
      // belum ada integrasi Maps, biar backend tidak menyentuh nilai yang
      // sudah ada (undefined = jangan ubah).
    };

    mutation.mutate(dataToSend);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Mitra Industri" description="Edit Data Mitra Industri PKL">
      <ParentCard title="Form Edit Mitra Industri">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <MitraIndustriEditForm
          mitraIndustriData={mitraIndustriData || {}}
          handleChange={handleChange}
          handleDateChange={handleDateChange}
          selectedSkkni={selectedSkkni}
          onSkkniChange={setSelectedSkkni}
          skkniOptions={skkniOptions}
          isSkkniLoading={isSkkniLoading}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isPending}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default MitraIndustriEdit;