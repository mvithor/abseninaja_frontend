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
import PpdbTestComponentsTable from "src/apps/admin-sekolah/ppdb/ppdb-test-component/PpdbTestComponentsTable";

const fetchPpdbTestComponents = async ({ ppdbPeriodId, isActive }) => {
  const params = new URLSearchParams();
  if (ppdbPeriodId) params.set("ppdb_period_id", ppdbPeriodId);
  if (isActive !== "" && isActive !== null && isActive !== undefined) params.set("is_active", String(isActive));

  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-test-component${q}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbTestComponentList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const ppdbPeriodId = searchParams.get("ppdb_period_id") || "";
  const isActive = searchParams.get("is_active");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const queryKey = useMemo(
    () => ["ppdb-test-components", ppdbPeriodId || "-", isActive ?? "-"],
    [ppdbPeriodId, isActive]
  );

  const {
    data: testComponents = [],
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey,
    queryFn: () => fetchPpdbTestComponents({ ppdbPeriodId, isActive }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev ?? [],
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal memuat Komponen Tes");
      setTimeout(() => setError(""), 3000);
    }
  });

  useEffect(() => {
    setPage(0);
  }, [ppdbPeriodId, isActive]);

  useEffect(() => {
    setPage(0);
  }, [testComponents.length]);

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-test-component/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["ppdb-test-components"] });
      setSuccess(res.data?.msg || "Komponen tes berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal menghapus komponen tes");
      setTimeout(() => setError(""), 3000);
    }
  });

  const filteredRows = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase().trim();
    if (!q) return testComponents;

    return testComponents.filter((r) => {
      const periodName = String(r?.PpdbPeriod?.nama || "").toLowerCase();
      const periodStatus = String(r?.PpdbPeriod?.status || "").toLowerCase();
      const code = String(r?.code || "").toLowerCase();
      const nama = String(r?.nama || "").toLowerCase();
      const type = String(r?.type || "").toLowerCase();
      const desc = String(r?.description || "").toLowerCase();

      return (
        periodName.includes(q) ||
        periodStatus.includes(q) ||
        code.includes(q) ||
        nama.includes(q) ||
        type.includes(q) ||
        desc.includes(q)
      );
    });
  }, [testComponents, searchQuery]);

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
    <PageContainer title="Komponen Tes PMB" description="Komponen Tes PMB">
      <ParentCard title="Komponen Tes PMB">
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
            placeholder="Cari Periode / Status / Code / Nama / Tipe / Deskripsi"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() =>
                navigate(
                  `/dashboard/admin-sekolah/ppdb-test-component/tambah?${new URLSearchParams({
                    ...(ppdbPeriodId ? { ppdb_period_id: ppdbPeriodId } : {}),
                  }).toString()}`
                )
              }
            >
              Tambah Komponen
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbTestComponentsTable
          rows={pagedRows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRows.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleEdit={(id) => navigate(`/dashboard/admin-sekolah/ppdb-test-component/edit/${id}`)}
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
            Apakah Anda yakin ingin menghapus komponen tes ini?
          </Typography>
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            Catatan: penghapusan hanya valid jika Period masih DRAFT
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

export default PpdbTestComponentList;