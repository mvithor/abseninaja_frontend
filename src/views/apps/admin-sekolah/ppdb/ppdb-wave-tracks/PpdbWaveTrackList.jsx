import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PpdbWaveTracksTable from "src/apps/admin-sekolah/ppdb/ppdb-wave-track/PpdbWaveTracksTable";

const fetchPpdbWaveTrack = async ({ ppdbWaveId, ppdbPeriodId }) => {
  const params = new URLSearchParams();
  if (ppdbWaveId) params.set("ppdb_wave_id", ppdbWaveId);
  if (ppdbPeriodId) params.set("ppdb_period_id", ppdbPeriodId);

  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-wave-track${q}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbWaveTrackList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const ppdbWaveId = searchParams.get("ppdb_wave_id") || "";
  const ppdbPeriodId = searchParams.get("ppdb_period_id") || "";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const queryKey = useMemo(
    () => ["ppdb-wave-track", ppdbWaveId || "-", ppdbPeriodId || "-"],
    [ppdbWaveId, ppdbPeriodId]
  );

  const {
    data: waveTracks = [],
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey,
    queryFn: () => fetchPpdbWaveTrack({ ppdbWaveId, ppdbPeriodId }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev ?? [],
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat PMB jalur per gelombang");
      setTimeout(() => setError(""), 3000);
    }
  });

  useEffect(() => {
    setPage(0);
  }, [ppdbWaveId, ppdbPeriodId]);

  useEffect(() => {
    setPage(0);
  }, [waveTracks.length]);

  const headerMeta = useMemo(() => {
    const first = waveTracks?.[0];
    const periodName = first?.Wave?.PpdbPeriod?.nama || "";
    const periodStatus = first?.Wave?.PpdbPeriod?.status || "";
    const waveName = first?.Wave?.nama || "";
    return { periodName, periodStatus, waveName };
  }, [waveTracks]);

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-wave-track/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["ppdb-wave-track"] });
      setSuccess(res.data?.msg || "Mapping jalur pada gelombang berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus mapping jalur");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredWaveTracks = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase().trim();
    if (!q) return waveTracks;

    return waveTracks.filter((wt) => {
      const waveName = String(wt?.Wave?.nama || "").toLowerCase();
      const trackKode = String(wt?.Track?.kode || "").toLowerCase();
      const trackNama = String(wt?.Track?.nama || "").toLowerCase();
      const periodName = String(wt?.Wave?.PpdbPeriod?.nama || "").toLowerCase();
      return (
        waveName.includes(q) ||
        trackKode.includes(q) ||
        trackNama.includes(q) ||
        periodName.includes(q)
      );
    });
  }, [waveTracks, searchQuery]);

  const pagedWaveTracks = useMemo(() => {
    if (rowsPerPage === -1) return filteredWaveTracks;
    const start = page * rowsPerPage;
    return filteredWaveTracks.slice(start, start + rowsPerPage);
  }, [filteredWaveTracks, page, rowsPerPage]);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  const periodStatusUpper = String(headerMeta.periodStatus || "").toUpperCase();
  const isArchived = periodStatusUpper === "ARCHIVED";

  return (
    <PageContainer title="Jalur Per Gelombang PMB" description="Jalur Per Gelombang PMB">
      <ParentCard title="Jalur Per Gelombang PMB">
        <Alerts
          error={
            error ||
            (isError && (queryError?.response?.data?.msg || queryError?.message || "Gagal memuat data"))
          }
          success={success}
        />

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
            placeholder="Cari Gelombang / Kode Jalur / Nama Jalur / Periode"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              disabled={isArchived}
              onClick={() =>
                navigate(
                  `/dashboard/admin-sekolah/ppdb-jalur-gelombang/tambah-jalur-gelombang?${new URLSearchParams({
                    ...(ppdbWaveId ? { ppdb_wave_id: ppdbWaveId } : {}),
                    ...(ppdbPeriodId ? { ppdb_period_id: ppdbPeriodId } : {}),
                  }).toString()}`
                )
              }
            >
              Tambah Mapping
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbWaveTracksTable
          rows={pagedWaveTracks}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredWaveTracks.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleEdit={(id) => navigate(`/dashboard/admin-sekolah/ppdb-jalur-gelombang/edit/${id}`)}
          handleDelete={(id) => {
            setDeleteId(id);
            setConfirmDialogOpen(true);
          }}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.response?.data?.msg || queryError?.message}
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
            Apakah Anda yakin ingin menghapus mapping jalur pada gelombang ini?
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

export default PpdbWaveTrackList;
