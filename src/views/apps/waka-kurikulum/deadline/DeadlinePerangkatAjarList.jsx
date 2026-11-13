import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import DeadlinePerangkatAjarTable from "src/apps/waka-kurikulum/deadline/List/DeadlinePerangkatAjarTable";
import PemilihSemester from "src/components/perangkat-ajar/PemilihSemester";
import { useSemesterTerpilih } from "src/components/perangkat-ajar/useSemesterTerpilih";
import { isKonflik, PESAN_SEMESTER_ARSIP, pesanGalat, WAKA_API } from "src/components/perangkat-ajar/perangkatAjarConfig";
import { useSchoolTimezone } from "src/hooks/useSchoolTimezone";
import axiosInstance from "src/utils/axiosInstance";

const fetchDeadlineList = async (semesterId) => {
  const res = await axiosInstance.get(`${WAKA_API}/perangkat-ajar/deadline`, {
    params: { semester_ajaran_id: semesterId },
  });
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const DeadlinePerangkatAjarList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timezone = useSchoolTimezone();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hapusId, setHapusId] = useState(null);
  const [search, setSearch] = useState("");

  const {
    options: semesterOptions,
    semesterId,
    setSemesterId,
    isArsip,
    isLoading: isSemesterLoading,
  } = useSemesterTerpilih(WAKA_API);

  const { data: deadlineList = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["waka-deadline-list", semesterId],
    queryFn: () => fetchDeadlineList(semesterId),
    enabled: !!semesterId,
    refetchOnWindowFocus: false,
  });

  // Jumlah deadline per semester kecil (satu per jenis), jadi pencarian cukup di sisi klien.
  const deadlineTampil = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deadlineList;
    return deadlineList.filter(
      (d) => (d.jenis?.label || "").toLowerCase().includes(q) || (d.keterangan || "").toLowerCase().includes(q),
    );
  }, [deadlineList, search]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`${WAKA_API}/perangkat-ajar/deadline/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data?.msg || "Deadline berhasil dihapus");
      setError("");
      setHapusId(null);
      queryClient.invalidateQueries({ queryKey: ["waka-deadline-list"] });
      // Status kunci & penanda terlambat dihitung ulang server
      queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-list"] });
      queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-detail"] });
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ["waka-deadline-list"] });
      setError(pesanGalat(err, "Terjadi kesalahan saat menghapus deadline"));
      setSuccess("");
      setHapusId(null);
      setTimeout(() => setError(""), 4000);
    },
  });

  const query = semesterId ? `?semester=${semesterId}` : "";
  const handleAdd = () => navigate(`/dashboard/waka-kurikulum/deadline/tambah${query}`);
  const handleEdit = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/waka-kurikulum/deadline/edit/${id}`);
  };

  return (
    <PageContainer title="Deadline Perangkat Ajar" description="Pengaturan Deadline Pengumpulan Perangkat Ajar">
      <ParentCard title="Deadline Pengumpulan Perangkat Ajar">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            width: "100%",
            mb: 3,
          }}
        >
          <SearchButton
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jenis / keterangan"
          />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <PemilihSemester
              options={semesterOptions}
              value={semesterId}
              onChange={setSemesterId}
              isLoading={isSemesterLoading}
            />
            {!isArsip && (
              <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
                Tambah Deadline
              </AddButton>
            )}
          </Box>
        </Box>

        {isArsip ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {PESAN_SEMESTER_ARSIP} Deadline semester ini tidak bisa ditambah, diubah, atau dihapus.
          </Alert>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Setelah deadline lewat, unggahan perangkat ajar untuk jenis tersebut otomatis terkunci.
          </Typography>
        )}

        <DeadlinePerangkatAjarTable
          deadlineList={deadlineTampil}
          emptyMessage={search.trim() ? "Tidak ada deadline yang cocok dengan pencarian" : undefined}
          timezone={timezone}
          handleEdit={handleEdit}
          handleDelete={setHapusId}
          bacaSaja={isArsip}
          isLoading={isLoading || isSemesterLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>

      <Dialog open={Boolean(hapusId)} onClose={() => setHapusId(null)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 1 }}>
            Apakah Anda yakin ingin menghapus deadline ini?
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Tanpa deadline, unggahan jenis perangkat ajar ini tidak akan terkunci otomatis.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={() => setHapusId(null)}>
            Batal
          </Button>
          <Button
            sx={{ mr: 3, backgroundColor: "#F48C06", "&:hover": { backgroundColor: "#f7a944" } }}
            variant="contained"
            onClick={() => deleteMutation.mutate(hapusId)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DeadlinePerangkatAjarList;
