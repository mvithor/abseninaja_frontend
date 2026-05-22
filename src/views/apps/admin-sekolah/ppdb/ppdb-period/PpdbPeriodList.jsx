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
import PpdbPeriodTable from "src/apps/admin-sekolah/ppdb/ppdb-period/PpdbPeriodTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchPpdbPeriod = async () => {
  const res = await axiosInstance.get("/api/v1/admin-sekolah/ppdb-period");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbPeriodList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data: periods = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdb-period"],
    queryFn: fetchPpdbPeriod,
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat PPDB Period");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-period/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["ppdb-period"]);
      setSuccess(res.data?.msg || "Periode PPDB berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus periode PPDB");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredPeriods = useMemo(() => {
    return periods.filter((p) =>
      String(p?.nama || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [periods, searchQuery]);

  const pagedPeriods = useMemo(() => {
    if (rowsPerPage === -1) return filteredPeriods;
    const start = page * rowsPerPage;
    return filteredPeriods.slice(start, start + rowsPerPage);
  }, [filteredPeriods, page, rowsPerPage]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <PageContainer title="Periode PMB" description="Periode PMB">
      <ParentCard title="Periode PMB">
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
            placeholder="Cari Periode PMB"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() =>
                navigate("/dashboard/admin-sekolah/ppdb-period/tambah-period")
              }
            >
              Tambah Periode
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbPeriodTable
          periods={pagedPeriods}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredPeriods.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleDetail={(id) =>
            navigate(`/dashboard/admin-sekolah/ppdb-period/detail/${id}`)
          }
          handleEdit={(id) =>
            navigate(`/dashboard/admin-sekolah/ppdb-period/edit/${id}`)
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
            Apakah Anda yakin ingin menghapus periode PMB ini?
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: "text.secondary" }}>
            Catatan: Penghapusan hanya bisa dilakukan jika status masih <b>DRAFT</b> dan belum memiliki konfigurasi Gelombang/Jalur.
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

export default PpdbPeriodList;