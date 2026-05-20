import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import PpdbProctorTable from "src/apps/admin-sekolah/ppdb/ppdb-proctor/PpdbProctorTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const buildQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null || String(v).trim() === "") return;
    params.set(k, String(v));
  });

  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const fetchPpdbProctors = async (filters = {}) => {
  const qs = buildQueryParams(filters);
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-proctor${qs}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbProctorList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialSessionId = urlParams.get("ppdb_test_session_id") || "";
  const initialRoomId = urlParams.get("ppdb_test_session_room_id") || "";
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters] = useState({
    ppdb_test_session_id: initialSessionId,
    ppdb_test_session_room_id: initialRoomId,

  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const queryKey = useMemo(() => ["ppdb-proctors", filters], [filters]);

  const { data: proctorList = [], isLoading, isError, error: queryError } = useQuery({
    queryKey,
    queryFn: () => fetchPpdbProctors(filters),
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat Pengawas");
      setTimeout(() => setError(""), 3000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-proctor/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(queryKey);
      setSuccess(res.data?.msg || "Pengawas berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus Pengawas");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredProctors = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return proctorList.filter((p) => {
      const name = String(p?.User?.name || "").toLowerCase();
      const email = String(p?.User?.email || "").toLowerCase();
      const role = String(p?.role || "").toLowerCase();

      const roomLabel = String(p?.SessionRoom?.room_label || p?.SessionRoom?.Room?.nama || "").toLowerCase();
      const sessionTitle = String(p?.SessionRoom?.Session?.title || "").toLowerCase();
      const sessionStatus = String(p?.SessionRoom?.Session?.status || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        roomLabel.includes(q) ||
        sessionTitle.includes(q) ||
        sessionStatus.includes(q)
      );
    });
  }, [proctorList, searchQuery]);

  const pagedProctors = useMemo(() => {
    if (rowsPerPage === -1) return filteredProctors;
    const start = page * rowsPerPage;
    return filteredProctors.slice(start, start + rowsPerPage);
  }, [filteredProctors, page, rowsPerPage]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  const subtitle = useMemo(() => {
    const bits = [];
    if (filters.ppdb_test_session_id) bits.push("Filtered by Session");
    if (filters.ppdb_test_session_room_id) bits.push("Filtered by Room");
    return bits.length ? `(${bits.join(" • ")})` : "";
  }, [filters]);

  return (
    <PageContainer title="Pengawas PMB" description="Pengawas PMB">
      <ParentCard title={`Pengawas PMB ${subtitle}`}>
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
            placeholder="Cari Pengawas"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() => navigate("/dashboard/admin-sekolah/ppdb-proctors/tambah")}
            >
              Tambah Pengawas
            </AddButton>

            <FilterButton />
          </Box>
        </Box>

        <PpdbProctorTable
          proctorList={pagedProctors}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredProctors.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleEdit={(id) => navigate(`/dashboard/admin-sekolah/ppdb-proctors/edit/${id}`)}
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
            Apakah Anda yakin ingin menghapus Pengawas ini?
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: -1 }}>
            Jika sesi ujian sudah Berjalan/Selesai/Dibatalkan, Sistem akan menolak penghapusan demi keamanan proses ujian.
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
            {deleteMutation.isLoading ? <CircularProgress size={22} /> : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PpdbProctorList;