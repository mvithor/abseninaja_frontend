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
import PpdbSesiRoomsTable from "src/apps/admin-sekolah/ppdb/ppdb-sesi-room/PpdbSesiRoomTable";

const fetchPpdbTestSessionRooms = async ({ ppdbTestSessionId, mode, q }) => {
  const params = new URLSearchParams();
  if (ppdbTestSessionId) params.set("ppdb_test_session_id", ppdbTestSessionId);
  if (mode) params.set("mode", mode);
  if (q) params.set("q", q);

  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-sesi-room${qs}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbSesiRoomList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const ppdbTestSessionId = searchParams.get("ppdb_test_session_id") || "";
  const modeParam = (searchParams.get("mode") || "").toUpperCase();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const safeMode = useMemo(() => {
    if (modeParam === "OFFLINE" || modeParam === "ONLINE") return modeParam;
    return "";
  }, [modeParam]);

  const queryKey = useMemo(
    () => ["ppdb-test-session-room", ppdbTestSessionId || "-", safeMode || "-", String(searchQuery || "").trim() || "-"],
    [ppdbTestSessionId, safeMode, searchQuery]
  );

  const {
    data: sessionRooms = [],
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey,
    queryFn: () => fetchPpdbTestSessionRooms({
      ppdbTestSessionId,
      mode: safeMode,
      q: String(searchQuery || "").trim()
    }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev ?? [],
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat mapping sesi ruangan tes");
      setTimeout(() => setError(""), 3000);
    }
  });

  useEffect(() => {
    setPage(0);
  }, [ppdbTestSessionId, safeMode]);

  useEffect(() => {
    setPage(0);
  }, [sessionRooms.length]);

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-sesi-room/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["ppdb-test-session-room"] });
      setSuccess(res.data?.msg || "Sesi ruangan tes berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus mapping sesi-room");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredRows = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase().trim();
    if (!q) return sessionRooms;

    return sessionRooms.filter((r) => {
      const sessionTitle = String(r?.Session?.title || "").toLowerCase();
      const mode = String(r?.mode || "").toLowerCase();

      const roomLabel = String(r?.room_label || "").toLowerCase();
      const onlineUrl = String(r?.online_url || "").toLowerCase();

      const roomCode = String(r?.Room?.code || "").toLowerCase();
      const roomNama = String(r?.Room?.nama || "").toLowerCase();
      const roomLokasi = String(r?.Room?.lokasi || "").toLowerCase();

      return (
        sessionTitle.includes(q) ||
        mode.includes(q) ||
        roomLabel.includes(q) ||
        onlineUrl.includes(q) ||
        roomCode.includes(q) ||
        roomNama.includes(q) ||
        roomLokasi.includes(q)
      );
    });
  }, [sessionRooms, searchQuery]);

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

  const headerMeta = useMemo(() => {
    const first = filteredRows?.[0];
    const sessionTitle = first?.Session?.title || "";
    const sessionStatus = first?.Session?.status || "";
    return { sessionTitle, sessionStatus };
  }, [filteredRows]);

  const sessionStatusUpper = String(headerMeta.sessionStatus || "").toUpperCase();
  const isArchived = sessionStatusUpper === "ARCHIVED";

  return (
    <PageContainer title="Sesi Ruangan Tes PMB" description="Sesi Ruangan Tes PMB">
      <ParentCard title="Sesi Ruangan Tes PMB">
        <Alerts
          error={
            error ||
            (isError && (queryError?.response?.data?.msg || queryError?.message || "Gagal memuat data"))
          }
          success={success}
        />

        {ppdbTestSessionId ? (
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: '0.95rem', opacity: 0.85 }}>
              Filter Session: <b>{headerMeta.sessionTitle || "-"}</b>
              {headerMeta.sessionStatus ? ` • Status: ${String(headerMeta.sessionStatus).toUpperCase()}` : ""}
            </Typography>
          </Box>
        ) : null}

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
            placeholder="Cari Session / Mode / Room / Lokasi / URL"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              disabled={isArchived}
              onClick={() =>
                navigate(
                  `/dashboard/admin-sekolah/ppdb-sesi-room/tambah?${new URLSearchParams({
                    ...(ppdbTestSessionId ? { ppdb_test_session_id: ppdbTestSessionId } : {}),
                    ...(safeMode ? { mode: safeMode } : {}),
                  }).toString()}`
                )
              }
            >
              Tambah Sesi Ruang
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbSesiRoomsTable
          rows={pagedRows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRows.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleDetail={(id) => navigate(`/dashboard/admin-sekolah/ppdb-sesi-room/detail/${id}`)}
          handleEdit={(id) => navigate(`/dashboard/admin-sekolah/ppdb-sesi-room/edit/${id}`)}
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
            Apakah Anda yakin ingin menghapus mapping sesi ruangan tes ini?
          </Typography>
          <Typography align="center" sx={{ opacity: 0.8 }}>
            Jika sesi ruangan sudah memiliki peserta terdaftar, Sistem akan menolak penghapusan.
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

export default PpdbSesiRoomList;