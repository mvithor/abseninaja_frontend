import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Autocomplete } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import axiosInstance from "src/utils/axiosInstance";

const TambahGuruMapelForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    pegawai_id: "",
    offering_id: "",
  });

  const { data: pegawaiOptions = [], isError: pegawaiError, isLoading: pegawaiLoading } = useQuery({
    queryKey: ["pegawaiOptions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/guru");
      return res.data?.data ?? [];
    },
  });

  const { data: offeringOptions = [], isError: offeringError, isLoading: offeringLoading } = useQuery({
    queryKey: ["offeringOptions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/mapel");
      return res.data?.data ?? [];
    },
  });

  const mutation = useMutation({
    mutationKey: ["tambahGuruMapel"],
    mutationFn: async (payload) => {
      const res = await axiosInstance.post("/api/v1/admin-sekolah/guru-mapel", payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg || "Berhasil menambahkan guru pengampu");
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/guru-mapel"), 2000);
    },
    onError: (error) => {
      const details = error.response?.data?.errors || [];
      const msg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan guru pengampu";
      setError(details.length ? details.join(", ") : msg);
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formState.pegawai_id || !formState.offering_id) {
      setError("Guru dan Offering wajib dipilih");
      setTimeout(() => setError(""), 3000);
      return;
    }
    mutation.mutate({
      pegawai_id: formState.pegawai_id,
      offering_id: formState.offering_id,
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (pegawaiError || offeringError) {
    return <div>Error loading data...</div>;
  }

  const selectedPegawai =
    pegawaiOptions.find((p) => String(p.id) === String(formState.pegawai_id)) || null;
  const selectedOffering =
    offeringOptions.find((o) => String(o.id) === String(formState.offering_id)) || null;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="pegawai_id" sx={{ mt: 1.85 }}>
            Nama Guru
          </CustomFormLabel>
          <Autocomplete
            id="pegawai_id"
            options={pegawaiOptions}
            loading={pegawaiLoading}
            value={selectedPegawai}
            onChange={(_e, val) =>
              setFormState((prev) => ({ ...prev, pegawai_id: val?.id ?? "" }))
            }
            isOptionEqualToValue={(opt, val) => String(opt.id) === String(val?.id)}
            getOptionLabel={(opt) => opt?.nama || ""}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Ketik untuk mencari guru…"
                inputProps={{
                  ...params.inputProps,
                  "aria-label": "Pilih Guru",
                }}
              />
            )}
            slotProps={{ listbox: { style: { maxHeight: 300 } } }}
            noOptionsText={pegawaiLoading ? "Memuat…" : "Tidak ada data"}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="offering_id" sx={{ mt: 1.85 }}>
            Mata Pelajaran
          </CustomFormLabel>
          <Autocomplete
            id="offering_id"
            options={offeringOptions}
            loading={offeringLoading}
            value={selectedOffering}
            onChange={(_e, val) =>
              setFormState((prev) => ({ ...prev, offering_id: val?.id ?? "" }))
            }
            isOptionEqualToValue={(opt, val) => String(opt.id) === String(val?.id)}
            getOptionLabel={(opt) =>
              opt?.label || `${opt?.nama_mapel || ""} (${opt?.kode_offering || ""}) — ${opt?.nama_kelas || ""}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={
                  offeringLoading
                    ? "Memuat mata pelajaran"
                    : offeringOptions.length
                    ? "Ketik untuk mencari mata pelajaran"
                    : "Tidak ada semester aktif / mata pelajaran"
                }
                inputProps={{
                  ...params.inputProps,
                  "aria-label": "Pilih Offering",
                }}
              />
            )}
            slotProps={{ listbox: { style: { maxHeight: 300 } } }}
            noOptionsText={offeringLoading ? "Memuat…" : "Tidak ada data"}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={mutation.isPending}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel} disabled={mutation.isPending}>
          Batal
        </CancelButton>
      </Box>
    </Box>
  );
};

export default TambahGuruMapelForm;
