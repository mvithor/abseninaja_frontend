import { useState, useMemo } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import MataPelajaranTableDetail from "src/apps/admin-sekolah/mata-pelajaran/Detail/MataPelajaranTableDetail";

const fetchMataPelajaranDetailById = async (mapelId) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/mata-pelajaran/${mapelId}/detail`);
  return res.data.data;
};

const fetchKelasList = async () => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/kelas`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const MataPelajaranDetail = () => {
  const { id: mapelId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteOfferingId, setDeleteOfferingId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editOfferingId, setEditOfferingId] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);

  const offeringQuery = useQuery({
    queryKey: ["mapelDetail", String(mapelId)],
    queryFn: () => fetchMataPelajaranDetailById(mapelId),
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const kelasQuery = useQuery({
    queryKey: ["kelas-list"],
    queryFn: fetchKelasList,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ mapelId, offeringId }) => {
      const res = await axiosInstance.delete(
        `/api/v1/admin-sekolah/mata-pelajaran/${mapelId}/offering/${offeringId}?forceDetach=true`
      );
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["mapelDetail", String(mapelId)]);
      setSuccess(res?.msg || "Offering berhasil dihapus");
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      const details = err.response?.data?.errors || [];
      const msg = err.response?.data?.msg || "Gagal menghapus offering";
      setError(details.length ? details.join(", ") : msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ mapelId, offeringId, kelas_id }) => {
      const res = await axiosInstance.put(
        `/api/v1/admin-sekolah/mata-pelajaran/${mapelId}/offering/${offeringId}`,
        { kelas_id }
      );
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["mapelDetail", String(mapelId)]);
      setSuccess(res?.msg || "Offering berhasil diperbarui");
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      const details = err.response?.data?.errors || [];
      const msg = err.response?.data?.msg || "Gagal memperbarui offering";
      setError(details.length ? details.join(", ") : msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const filteredOfferings = useMemo(() => {
    const list = offeringQuery.data || [];
    if (!searchQuery) return list;
    return list.filter((o) =>
      (o.nama_kelas || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [offeringQuery.data, searchQuery]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleEditOpen = (offeringId) => {
    setEditOfferingId(offeringId);
    const currentOffering = (offeringQuery.data || []).find(o => o.id === offeringId);
    const currentKelas = currentOffering
      ? (kelasQuery.data || []).find(k => k.id === currentOffering.kelas_id) || null
      : null;
    setSelectedKelas(currentKelas);
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editOfferingId || !selectedKelas?.id) {
      setError("Silakan pilih kelas tujuan.");
      setTimeout(() => setError(""), 2500);
      return;
    }
    editMutation.mutate({ mapelId, offeringId: editOfferingId, kelas_id: selectedKelas.id });
    setEditDialogOpen(false);
    setEditOfferingId(null);
    setSelectedKelas(null);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditOfferingId(null);
    setSelectedKelas(null);
  };

  const handleDeleteOpen = (offeringId) => {
    setDeleteOfferingId(offeringId);
    setConfirmDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteOfferingId) {
      setError("Offering tidak ditemukan.");
      setTimeout(() => setError(""), 2500);
      return;
    }
    deleteMutation.mutate({ mapelId, offeringId: deleteOfferingId });
    setConfirmDialogOpen(false);
    setDeleteOfferingId(null);
  };

  const handleDeleteClose = () => {
    setConfirmDialogOpen(false);
    setDeleteOfferingId(null);
  };

  const handleChangePage = (_, newPage) => setPage(Number(newPage));
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const handleBack = () => navigate("/dashboard/admin-sekolah/mata-pelajaran");

  return (
    <PageContainer title="Detail Offering Mata Pelajaran" description="Penawaran mapel per kelas (semester aktif)">
      <ParentCard title="Detail Offering Mata Pelajaran">
        <Alerts error={error} success={success} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mb: 3,
            mt: 2,
          }}
        >
          <SearchButton
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari Nama Kelas"
          />
          <FilterButton />
        </Box>
        {offeringQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (offeringQuery.isError || !offeringQuery.data) ? (
          <Typography sx={{ mt: 2 }}>
            Terjadi kesalahan saat memuat data
          </Typography>
        ) : (
          <MataPelajaranTableDetail
            mapelDetail={filteredOfferings}       
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleEdit={handleEditOpen}
            handleDelete={handleDeleteOpen}
            isLoading={offeringQuery.isLoading}
            isError={offeringQuery.isError}
            errorMessage={"Terjadi kesalahan saat memuat data"}
          />
        )}
         <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleBack}
            sx={{ px: 3 }}
          >
            Kembali
          </Button>
        </Box>
      </ParentCard>
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Pindahkan Offering ke Kelas Lain
          </Typography>
          <Autocomplete
            options={kelasQuery.data || []}
            loading={kelasQuery.isLoading}
            value={selectedKelas}
            onChange={(_, val) => setSelectedKelas(val)}
            getOptionLabel={(opt) => opt?.nama_kelas || ""}
            renderInput={(params) => (
              <TextField {...params} label="Pilih Kelas Tujuan" placeholder="Mis. 7A" />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleEditClose}>
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={editMutation.isLoading}
            sx={{ ml: 1 }}
          >
            {editMutation.isLoading ? <CircularProgress size={24} /> : "Simpan"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDialogOpen} onClose={handleDeleteClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" align="center" sx={{ mt: 1, mb: 2 }}>
            Hapus offering? Jadwal terkait akan dilepas
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleDeleteClose}>
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
            sx={{ backgroundColor: "#F48C06", "&:hover": { backgroundColor: "#f7a944" } }}
          >
            {deleteMutation.isLoading ? <CircularProgress size={24} /> : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default MataPelajaranDetail;
