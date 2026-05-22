import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import PpdbWaveTable from "src/apps/admin-sekolah/ppdb/ppdb-wave/PpdbWaveTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchPpdbWave = async (ppdbPeriodId) => {
  const q = ppdbPeriodId ? `?ppdb_period_id=${encodeURIComponent(ppdbPeriodId)}` : "";
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-wave${q}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbWaveList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const ppdbPeriodId = searchParams.get("ppdb_period_id") || "";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data: waves = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdb-wave", ppdbPeriodId],
    queryFn: () => fetchPpdbWave(ppdbPeriodId),
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat gelombang PMB");
      setTimeout(() => setError(""), 3000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-wave/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["ppdb-wave", ppdbPeriodId] });
      setSuccess(res.data?.msg || "Gelombang PMB berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus gelombang PMB");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredWaves = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase().trim();
    if (!q) return waves;

    return waves.filter((w) => {
      const nama = String(w?.nama || "").toLowerCase();
      const period = String(w?.PpdbPeriod?.nama || "").toLowerCase();
      return nama.includes(q) || period.includes(q);
    });
  }, [waves, searchQuery]);

  const pagedWaves = useMemo(() => {
    if (rowsPerPage === -1) return filteredWaves;
    const start = page * rowsPerPage;
    return filteredWaves.slice(start, start + rowsPerPage);
  }, [filteredWaves, page, rowsPerPage]);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <PageContainer title="Gelombang PMB" description="Gelombang PMB">
      <ParentCard title="Gelombang PMB">
        <Alerts error={error || (isError && (queryError?.message || "Gagal memuat data"))} success={success} />

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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Cari Gelombang / Nama Periode"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() =>
                navigate(
                  ppdbPeriodId
                    ? `/dashboard/admin-sekolah/ppdb-gelombang/tambah-gelombang?ppdb_period_id=${encodeURIComponent(ppdbPeriodId)}`
                    : "/dashboard/admin-sekolah/ppdb-gelombang/tambah-gelombang"
                )
              }
            >
              Tambah Gelombang
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbWaveTable
          waves={pagedWaves}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredWaves.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleDetail={(id) =>
            navigate(`/dashboard/admin-sekolah/ppdb-gelombang/detail/${id}`)
          }
          handleEdit={(id) =>
            navigate(`/dashboard/admin-sekolah/ppdb-gelombang/edit/${id}`)
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
            Apakah Anda yakin ingin menghapus gelombang PMB ini?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button variant="outlined" onClick={() => setConfirmDialogOpen(false)}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? <CircularProgress size={22} /> : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PpdbWaveList;
