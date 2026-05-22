import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PpdbPanitiaTable from "src/apps/admin-sekolah/ppdb/ppdb-panitia/PpdbPanitiaTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchPpdbPanitia = async () => {
  const res = await axiosInstance.get("/api/v1/admin-sekolah/ppdb-panitia");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbPanitiaList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data: panitiaList = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdb-panitia"],
    queryFn: fetchPpdbPanitia,
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat Petugas PMB");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-panitia/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["ppdb-panitia"]);
      setSuccess(res.data?.msg || "Petugas PMB berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus petugas PMB");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredPanitia = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return panitiaList.filter((p) => {
      const name = String(p?.AkunPanitia?.name || "").toLowerCase();
      const email = String(p?.AkunPanitia?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [panitiaList, searchQuery]);

  const pagedPanitia = useMemo(() => {
    if (rowsPerPage === -1) return filteredPanitia;
    const start = page * rowsPerPage;
    return filteredPanitia.slice(start, start + rowsPerPage);
  }, [filteredPanitia, page, rowsPerPage]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <PageContainer title="Petugas PMB" description="Petugas PMB">
      <ParentCard title="Petugas PMB">
        <Alerts error={error} success={success} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mb: 2,
          }}
        >
          <SearchButton
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Petugas (nama / email)"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() =>
                navigate("/dashboard/admin-sekolah/ppdb-panitia/tambah")
              }
            >
              Tambah Petugas
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbPanitiaTable
          panitiaList={pagedPanitia}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredPanitia.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleEdit={(id) =>
            navigate(`/dashboard/admin-sekolah/ppdb-panitia/edit/${id}`)
          }
          handleDelete={(id) => {
            setDeleteId(id);
            setConfirmDialogOpen(true);
          }}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message}
        />
      </ParentCard>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Apakah Anda yakin ingin menghapus petugas PMB ini?
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: -1 }}>
            Jika PMB Period sudah berjalan, sistem akan menonaktifkan panitia agar jejak audit tetap aman.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button variant="outlined" onClick={() => setConfirmDialogOpen(false)}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? (
              <CircularProgress size={22} />
            ) : (
              "Hapus"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PpdbPanitiaList;
