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
import PpdbWaveTrackTestRequirementsTable from "src/apps/admin-sekolah/ppdb/ppdb-wave-track-requirement/PpdbWaveTrackRequirementTable";

const fetchPpdbWaveTrackTestRequirements = async ({ ppdbPeriodId, ppdbWaveTrackId, ppdbTestComponentId }) => {
  const params = new URLSearchParams();
  if (ppdbPeriodId) params.set("ppdb_period_id", ppdbPeriodId);
  if (ppdbWaveTrackId) params.set("ppdb_wave_track_id", ppdbWaveTrackId);
  if (ppdbTestComponentId) params.set("ppdb_test_component_id", ppdbTestComponentId);

  const q = params.toString() ? `?${params.toString()}` : "";

  // NOTE: pastikan route ini sesuai yang kamu expose di backend
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-wave-track-requirement${q}`);

  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbWaveTrackTestRequirementList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const ppdbPeriodId = searchParams.get("ppdb_period_id") || "";
  const ppdbWaveTrackId = searchParams.get("ppdb_wave_track_id") || "";
  const ppdbTestComponentId = searchParams.get("ppdb_test_component_id") || "";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const queryKey = useMemo(
    () => [
      "ppdb-wave-track-test-requirements",
      ppdbPeriodId || "-",
      ppdbWaveTrackId || "-",
      ppdbTestComponentId || "-"
    ],
    [ppdbPeriodId, ppdbWaveTrackId, ppdbTestComponentId]
  );

  const {
    data: requirements = [],
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey,
    queryFn: () => fetchPpdbWaveTrackTestRequirements({ ppdbPeriodId, ppdbWaveTrackId, ppdbTestComponentId }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev ?? [],
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat Test Requirement");
      setTimeout(() => setError(""), 3000);
    }
  });

  useEffect(() => {
    setPage(0);
  }, [ppdbPeriodId, ppdbWaveTrackId, ppdbTestComponentId]);

  useEffect(() => {
    setPage(0);
  }, [requirements.length]);

  const deleteMutation = useMutation({
    // NOTE: pastikan route ini sesuai yang kamu expose di backend
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-wave-track-requirement/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["ppdb-wave-track-test-requirements"] });
      setSuccess(res.data?.msg || "Persyaratan tes berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus persyaratan tes");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredRows = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase().trim();
    if (!q) return requirements;

    return requirements.filter((r) => {
      const periodName = String(r?.PpdbPeriod?.nama || "").toLowerCase();
      const periodStatus = String(r?.PpdbPeriod?.status || "").toLowerCase();

      const waveName = String(r?.WaveTrack?.Wave?.nama || "").toLowerCase();
      const waveTrackId = String(r?.ppdb_wave_track_id || "").toLowerCase();

      const compName = String(r?.Component?.nama || "").toLowerCase();
      const compCode = String(r?.Component?.code || "").toLowerCase();
      const compType = String(r?.Component?.type || "").toLowerCase();

      const isRequired = String(r?.is_required);
      const isElim = String(r?.is_elimination);
      const minScore = String(r?.min_score ?? "");
      const weight = String(r?.weight ?? "");
      const sortOrder = String(r?.sort_order ?? "");

      return (
        periodName.includes(q) ||
        periodStatus.includes(q) ||
        waveName.includes(q) ||
        waveTrackId.includes(q) ||
        compName.includes(q) ||
        compCode.includes(q) ||
        compType.includes(q) ||
        isRequired.includes(q) ||
        isElim.includes(q) ||
        minScore.includes(q) ||
        weight.includes(q) ||
        sortOrder.includes(q)
      );
    });
  }, [requirements, searchQuery]);

  const pagedRows = useMemo(() => {
    if (rowsPerPage === -1) return filteredRows;
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <PageContainer title="Persyaratan Tes PMB" description="Persyaratan Tes PMB">
      <ParentCard title="Persyaratan Tes PMB">
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
            placeholder="Cari Periode / Status / Wave / Komponen / Tipe / Required / Min Score / Bobot / Urutan"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() =>
                navigate(
                  `/dashboard/admin-sekolah/ppdb-persyaratan-tes/tambah?${new URLSearchParams({
                    ...(ppdbPeriodId ? { ppdb_period_id: ppdbPeriodId } : {}),
                    ...(ppdbWaveTrackId ? { ppdb_wave_track_id: ppdbWaveTrackId } : {}),
                    ...(ppdbTestComponentId ? { ppdb_test_component_id: ppdbTestComponentId } : {}),
                  }).toString()}`
                )
              }
            >
              Tambah Persyaratan
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbWaveTrackTestRequirementsTable
          rows={pagedRows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRows.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleEdit={(id) => navigate(`/dashboard/admin-sekolah/ppdb-persyaratan-tes/edit/${id}`)}
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
            Apakah Anda yakin ingin menghapus persyaratan ini?
          </Typography>
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            Catatan: penghapusan hanya valid kalau Period masih DRAFT dan persyaratan belum dipakai.
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

export default PpdbWaveTrackTestRequirementList;