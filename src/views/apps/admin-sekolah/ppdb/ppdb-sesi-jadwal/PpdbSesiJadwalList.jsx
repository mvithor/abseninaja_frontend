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
import PpdbSesiJadwalTable from "src/apps/admin-sekolah/ppdb/ppdb-sesi-jadwal/PpdbSesiJadwalTable";

const safeText = (val) => {
  const s = String(val ?? "").trim();
  return s.length > 0 ? s : "";
};

const fetchPpdbSesiJadwal = async ({
  ppdbPeriodId,
  ppdbWaveTrackId,
  ppdbTestComponentId,
  status,
  mode,
  q,
}) => {
  const params = new URLSearchParams();

  if (ppdbPeriodId) params.set("ppdb_period_id", ppdbPeriodId);
  if (ppdbWaveTrackId) params.set("ppdb_wave_track_id", ppdbWaveTrackId);
  if (ppdbTestComponentId) params.set("ppdb_test_component_id", ppdbTestComponentId);
  if (status) params.set("status", status);
  if (mode) params.set("mode", mode);
  if (q) params.set("q", q);

  const qs = params.toString() ? `?${params.toString()}` : "";

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-sesi-jadwal${qs}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbSesiJadwalList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const ppdbPeriodId = searchParams.get("ppdb_period_id") || "";
  const ppdbWaveTrackId = searchParams.get("ppdb_wave_track_id") || "";
  const ppdbTestComponentId = searchParams.get("ppdb_test_component_id") || "";
  const status = searchParams.get("status") || "";
  const mode = searchParams.get("mode") || "";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const queryKey = useMemo(
    () => [
      "ppdb-sesi-jadwal",
      ppdbPeriodId || "-",
      ppdbWaveTrackId || "-",
      ppdbTestComponentId || "-",
      status || "-",
      mode || "-"
    ],
    [ppdbPeriodId, ppdbWaveTrackId, ppdbTestComponentId, status, mode]
  );

  const {
    data: sessions = [],
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey,
    queryFn: () =>
      fetchPpdbSesiJadwal({
        ppdbPeriodId,
        ppdbWaveTrackId,
        ppdbTestComponentId,
        status,
        mode,
        q: ""
      }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev ?? [],
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat Sesi / Jadwal Tes");
      setTimeout(() => setError(""), 3000);
    }
  });

  useEffect(() => {
    setPage(0);
  }, [ppdbPeriodId, ppdbWaveTrackId, ppdbTestComponentId, status, mode]);

  useEffect(() => {
    setPage(0);
  }, [sessions.length]);

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-sesi-jadwal/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["ppdb-sesi-jadwal"] });
      setSuccess(res.data?.msg || "Sesi jadwal tes berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus sesi jadwal tes");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredRows = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase().trim();
    if (!q) return sessions;

    return sessions.filter((r) => {
      const periodName = safeText(r?.PpdbPeriod?.nama).toLowerCase();
      const periodStatus = safeText(r?.PpdbPeriod?.status).toLowerCase();

      const scopeLabel = safeText(r?.scope_label).toLowerCase();
      const scopeType = safeText(r?.scope_type).toLowerCase();
      const waveTrackId = safeText(r?.ppdb_wave_track_id).toLowerCase();

      const waveName = safeText(r?.WaveTrack?.Wave?.nama).toLowerCase();
      const trackName = safeText(r?.WaveTrack?.Track?.nama).toLowerCase();
      const trackCode = safeText(r?.WaveTrack?.Track?.kode).toLowerCase();

      const compName = safeText(r?.Component?.nama).toLowerCase();
      const compCode = safeText(r?.Component?.code).toLowerCase();
      const compType = safeText(r?.Component?.type).toLowerCase();

      const title = safeText(r?.title).toLowerCase();
      const mode = safeText(r?.mode).toLowerCase();
      const status = safeText(r?.status).toLowerCase();
      const onlineUrl = safeText(r?.online_url).toLowerCase();

      const startAt = safeText(r?.start_at).toLowerCase();
      const endAt = safeText(r?.end_at).toLowerCase();

      const checkinOpen = safeText(r?.checkin_open_at).toLowerCase();
      const lateAfter = safeText(r?.late_after_at).toLowerCase();
      const checkinClose = safeText(r?.checkin_close_at).toLowerCase();

      const capacity = String(r?.capacity ?? "").toLowerCase();

      return (
        periodName.includes(q) ||
        periodStatus.includes(q) ||
        scopeLabel.includes(q) ||
        scopeType.includes(q) ||
        waveTrackId.includes(q) ||
        waveName.includes(q) ||
        trackName.includes(q) ||
        trackCode.includes(q) ||
        compName.includes(q) ||
        compCode.includes(q) ||
        compType.includes(q) ||
        title.includes(q) ||
        mode.includes(q) ||
        status.includes(q) ||
        onlineUrl.includes(q) ||
        startAt.includes(q) ||
        endAt.includes(q) ||
        checkinOpen.includes(q) ||
        lateAfter.includes(q) ||
        checkinClose.includes(q) ||
        capacity.includes(q)
      );
    });
  }, [sessions, searchQuery]);

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
    <PageContainer title="Sesi & Jadwal Tes PMB" description="Sesi & Jadwal Tes PMB">
      <ParentCard title="Sesi & Jadwal Tes PMB">
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
            placeholder="Cari Periode / Status / Scope / Wave / Track / Komponen / Judul / Mode / Status Sesi / Waktu / Kapasitas"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() =>
                navigate(
                  `/dashboard/admin-sekolah/ppdb-sesi-jadwal/tambah?${new URLSearchParams({
                    ...(ppdbPeriodId ? { ppdb_period_id: ppdbPeriodId } : {}),
                    ...(ppdbWaveTrackId ? { ppdb_wave_track_id: ppdbWaveTrackId } : {}),
                    ...(ppdbTestComponentId ? { ppdb_test_component_id: ppdbTestComponentId } : {}),
                    ...(status ? { status } : {}),
                    ...(mode ? { mode } : {}),
                  }).toString()}`
                )
              }
            >
              Tambah Sesi
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbSesiJadwalTable
          rows={pagedRows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRows.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleView={(id) => navigate(`/dashboard/admin-sekolah/ppdb-sesi-jadwal/detail/${id}`)}
          handleEdit={(id) => navigate(`/dashboard/admin-sekolah/ppdb-sesi-jadwal/edit/${id}`)}
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
            Apakah Anda yakin ingin menghapus sesi jadwal ini?
          </Typography>
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            Catatan: penghapusan hanya valid kalau sesi masih DRAFT dan belum dipakai (ruangan/participant).
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

export default PpdbSesiJadwalList;