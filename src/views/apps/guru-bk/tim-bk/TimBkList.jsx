import { useMemo, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TimBkTable from "src/apps/guru-bk/tim-bk/List/TimBkTable";
import TimBkFormDialog from "src/apps/guru-bk/tim-bk/TimBkFormDialog";
import { useKonteksBk } from "src/components/pemetaan-siswa/useKonteksBk";
import { BK_API } from "src/components/pemetaan-siswa/pemetaanConfig";
import { isKonflik, pesanGalat } from "src/components/perangkat-ajar/perangkatAjarConfig";
import axiosInstance from "src/utils/axiosInstance";

const fetchTim = async () => {
  const res = await axiosInstance.get(`${BK_API}/tim`);
  return { list: Array.isArray(res.data?.data) ? res.data.data : [], kelasTanpaBk: res.data?.meta?.kelas_tanpa_bk || [] };
};

const TimBkList = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  // form: undefined = tertutup, null = tambah, objek = atur kelas anggota itu
  const [form, setForm] = useState(undefined);
  const [konfirmasi, setKonfirmasi] = useState(null);

  const { data: konteks } = useKonteksBk();
  const bolehKelola = Boolean(konteks?.is_koordinator && konteks?.aktif);

  const { data, isLoading, isError, error: queryError } = useQuery({ queryKey: ["bk-tim"], queryFn: fetchTim });

  const timTampil = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = data?.list || [];
    if (!q) return list;
    return list.filter(
      (t) =>
        [t.pegawai?.nama, t.pegawai?.nip].some((v) => String(v || "").toLowerCase().includes(q)) ||
        t.kelas.some((k) => k.nama.toLowerCase().includes(q)),
    );
  }, [data, search]);

  const tampilkanSukses = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const aktifMutation = useMutation({
    mutationFn: async ({ id, aktif }) => (await axiosInstance.patch(`${BK_API}/tim/${id}`, { aktif })).data,
    onSuccess: (res) => {
      setKonfirmasi(null);
      ["bk-tim", "bk-referensi-kelas", "bk-pemetaan-ringkasan", "bk-pemetaan-siswa"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      tampilkanSukses(res?.msg || "Status akun BK diperbarui");
    },
    onError: (err) => {
      setKonfirmasi(null);
      if (isKonflik(err)) ["bk-tim", "bk-referensi-kelas"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      setError(pesanGalat(err, "Terjadi kesalahan saat mengubah status akun"));
      setTimeout(() => setError(""), 4000);
    },
  });

  // Mengaktifkan langsung; menonaktifkan minta konfirmasi karena BK itu kehilangan akses.
  const handleToggleAktif = (anggota) => {
    if (anggota.aktif) setKonfirmasi(anggota);
    else aktifMutation.mutate({ id: anggota.id, aktif: true });
  };

  const kelasTanpaBk = data?.kelasTanpaBk || [];

  return (
    <PageContainer title="Tim BK" description="Manajemen Akun BK per Tanggung Jawab Kelas">
      <ParentCard title="Tim BK & Tanggung Jawab Kelas">
        <Alerts error={error || (isError && (queryError?.response?.data?.msg || queryError?.message))} success={success} />

        {!bolehKelola && konteks && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Hanya koordinator BK yang dapat menambah anggota dan mengatur kelas tanggung jawab.
          </Alert>
        )}
        {kelasTanpaBk.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {kelasTanpaBk.length} kelas belum memiliki guru BK:{" "}
            <strong>{kelasTanpaBk.map((k) => `${k.nama} (${k.jumlah_siswa} siswa)`).join(", ")}</strong>.
            {bolehKelola && " Tugaskan lewat tombol atur kelas atau tambah anggota baru."}
          </Alert>
        )}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <SearchButton value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama / NIP / kelas" />
          {bolehKelola && (
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={() => setForm(null)}>
              Tambah Anggota
            </AddButton>
          )}
        </Box>

        <TimBkTable
          timList={timTampil}
          bolehKelola={bolehKelola}
          idSaya={konteks?.id}
          onAturKelas={setForm}
          onToggleAktif={handleToggleAktif}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat Tim BK"}
        />
      </ParentCard>

      {form !== undefined && (
        <TimBkFormDialog
          key={form?.id || "tambah"}
          anggota={form}
          onClose={() => setForm(undefined)}
          onSuccess={(msg) => {
            setForm(undefined);
            tampilkanSukses(msg);
          }}
        />
      )}

      <Dialog open={Boolean(konfirmasi)} onClose={() => setKonfirmasi(null)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 1 }}>
            Nonaktifkan akun BK {konfirmasi?.pegawai?.nama}?
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Akun ini tidak bisa lagi mengakses data pemetaan siswa. {konfirmasi?.kelas?.length || 0} kelas tanggung jawabnya
            akan tercatat tanpa guru BK sampai ditugaskan ke BK lain.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={() => setKonfirmasi(null)}>
            Batal
          </Button>
          <Button
            sx={{ mr: 3, backgroundColor: "#F48C06", "&:hover": { backgroundColor: "#f7a944" } }}
            variant="contained"
            onClick={() => aktifMutation.mutate({ id: konfirmasi.id, aktif: false })}
            disabled={aktifMutation.isPending}
          >
            {aktifMutation.isPending ? "Memproses..." : "Nonaktifkan"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default TimBkList;
