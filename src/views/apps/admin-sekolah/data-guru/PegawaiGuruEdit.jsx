import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PegawaiGuruEditForm from "src/apps/admin-sekolah/data-guru/Edit/PegawaiEditForm";

const toISODateOnly = (value) => {
  // backend contoh: "1984-08-03" (date only)
  if (!value) return null;

  // jika sudah string yyyy-mm-dd
  if (typeof value === "string") {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Date object
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
};

const fetchPegawaiGuruById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/pegawai/${id}`);
    const pegawai = response.data.data;

    // ✅ mapping sesuai response: AkunPegawai
    return {
      ...pegawai,
      name: pegawai?.AkunPegawai?.name || "",
      email: pegawai?.AkunPegawai?.email || "",
      current_password: "",
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching pegawai:", error);
    }
    throw new Error("Terjadi kesalahan saat mengambil data pegawai. Silakan coba lagi");
  }
};

const PegawaiGuruEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [guruData, setGuruData] = useState({
    name: "",
    email: "",
    current_password: "",
    nip: "",
    tempat_lahir: "",
    tanggal_lahir: null,
    alamat: "",
    nomor_telepon: "",
    kategori_pegawai_id: "",
    subkategori_pegawai_id: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["PegawaiGuru", id],
    queryFn: () => fetchPegawaiGuruById(id),
    onError: (err) => {
      const msg = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memuat data";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (data) {
      setGuruData(data);
      setOriginalData(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      // ✅ payload harus body object sesuai backend: { data: {...} } ATAU flat
      // backend kamu sudah support kedua bentuk (normalize payload). Kita tetap kirim flat yang bersih.
      const response = await axiosInstance.put(`/api/v1/admin-sekolah/pegawai/${id}`, payload);
      return response.data;
    },
    onSuccess: (res) => {
      setSuccess(res.msg || "Data pegawai berhasil diperbarui");
      queryClient.invalidateQueries(["PegawaiGuru", id]);
      queryClient.invalidateQueries(["pegawaiGuru"]);
      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/pegawai/guru");
      }, 1500);
    },
    onError: (err) => {
      const errorDetails = err?.response?.data?.errors || [];
      const errorMsg = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memperbarui data pegawai.";
      if (errorDetails.length > 0) setError(errorDetails.join(", "));
      else setError(errorMsg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setGuruData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!guruData) return;

    const originalEmail = String(originalData?.email || "").trim();
    const nextEmail = String(guruData?.email || "").trim();
    const isEmailChanged = originalData && nextEmail !== originalEmail;

    // ✅ schema backend: current_password wajib saat email berubah
    if (isEmailChanged && !String(guruData?.current_password || "").trim()) {
      setError("Password saat ini wajib diisi untuk mengubah email.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const payload = {
      kategori_pegawai_id: guruData.kategori_pegawai_id,
      subkategori_pegawai_id: guruData.subkategori_pegawai_id || null,
      nip: guruData.nip || null,
      tempat_lahir: guruData.tempat_lahir || null,
      tanggal_lahir: toISODateOnly(guruData.tanggal_lahir),
      alamat: guruData.alamat || null,
      nomor_telepon: guruData.nomor_telepon || null,

      User: {
        name: guruData.name,
        email: guruData.email,
        current_password: isEmailChanged ? guruData.current_password : "",
      },
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Form Edit Pegawai Guru" description="Form Edit Pegawai Guru">
      <ParentCard title="Form Edit Pegawai Guru">
        <Alerts error={error || (isError && queryError?.message)} success={success} />

        <PegawaiGuruEditForm
          guruData={guruData || {}}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
          originalEmail={originalData?.email || ""}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PegawaiGuruEdit;
