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
import PpdbTrackTable from "src/apps/admin-sekolah/ppdb/ppdb-track/PpdbTrackTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchPpdbTrack = async (ppdbPeriodId) => {
  const q = ppdbPeriodId ? `?ppdb_period_id=${encodeURIComponent(ppdbPeriodId)}` : "";
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-track${q}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbTrackList = () => {
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

  const { data: tracks = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdb-track", ppdbPeriodId],
    queryFn: () => fetchPpdbTrack(ppdbPeriodId),
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat jalur PMB");
      setTimeout(() => setError(""), 3000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-track/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["ppdb-track", ppdbPeriodId] });
      setSuccess(res.data?.msg || "Jalur PMB berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus jalur PMB");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredTracks = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase().trim();
    if (!q) return tracks;

    return tracks.filter((t) => {
      const nama = String(t?.nama || "").toLowerCase();
      const kode = String(t?.kode || "").toLowerCase();
      const period = String(t?.PpdbPeriod?.nama || "").toLowerCase();
      const status = String(t?.PpdbPeriod?.status || "").toLowerCase();
      return (
        nama.includes(q) ||
        kode.includes(q) ||
        period.includes(q) ||
        status.includes(q)
      );
    });
  }, [tracks, searchQuery]);

  const pagedTracks = useMemo(() => {
    if (rowsPerPage === -1) return filteredTracks;
    const start = page * rowsPerPage;
    return filteredTracks.slice(start, start + rowsPerPage);
  }, [filteredTracks, page, rowsPerPage]);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <PageContainer title="Jalur Pendaftaran PMB" description="Jalur Pendaftaran PMB">
      <ParentCard title="Jalur Pendaftaran PMB">
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
            placeholder="Cari Jalur / Kode / Nama Periode / Status"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() =>
                navigate(
                  ppdbPeriodId
                    ? `/dashboard/admin-sekolah/ppdb-jalur/tambah-jalur?ppdb_period_id=${encodeURIComponent(ppdbPeriodId)}`
                    : "/dashboard/admin-sekolah/ppdb-jalur/tambah-jalur"
                )
              }
            >
              Tambah Jalur
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbTrackTable
          tracks={pagedTracks}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredTracks.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleEdit={(id) =>
            navigate(`/dashboard/admin-sekolah/ppdb-jalur/edit/${id}`)
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
            Apakah Anda yakin ingin menghapus jalur pendaftaran PMB ini?
          </Typography>
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            Jalur hanya bisa dihapus jika Period masih <b>DRAFT</b> dan belum dipakai pada pengaturan Gelombang.
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

export default PpdbTrackList;
