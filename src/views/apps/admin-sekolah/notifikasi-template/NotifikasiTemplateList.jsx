import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Chip,
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import DeleteButton from "src/components/button-group/DeleteButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import NotificationTemplateTable from "src/apps/admin-sekolah/notifikasi-template/List/NotifikasiTemplateTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchNotificationTemplate = async () => {
  const response = await axiosInstance.get("/api/v1/admin-sekolah/notification-template");
  // BE mengembalikan { data: [...], meta: {...} }
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

const NotificationTemplateList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const {
    data: notificationTemplate = [],
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey: ["notificationTemplate"],
    queryFn: fetchNotificationTemplate,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(msg);
    },
  });

  // Client-side filter + sort
  const filteredNotification = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    const arr = Array.isArray(notificationTemplate) ? notificationTemplate : [];
    return arr
      .filter((t) => (t.title || "").toLowerCase().includes(q))
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [notificationTemplate, searchQuery]);

  // Reset page kalau jumlah item berubah
  useEffect(() => {
    setPage(0);
  }, [filteredNotification.length]);

  // Delete mutation (fix URL typo)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/admin-sekolah/notification-template/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["notificationTemplate"]);
      setSuccess(data?.msg || "Template Notifikasi berhasil dihapus");
      setError("");
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      const details = err.response?.data?.errors || [];
      const msg = err.response?.data?.msg || "Terjadi kesalahan saat menghapus template notifikasi";
      setError(details.length ? details.join(", ") : msg);
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  // Handlers
  const handleSearchChange = (e) => setSearchQuery(e.target.value || "");

  const handleChangePage = (_evt, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleAdd = () => navigate("/dashboard/admin-sekolah/notifikasi-template/tambah");

  const handleEdit = (id) => navigate(`/dashboard/admin-sekolah/notifikasi-template/edit/${id}`);

  const handleOpenConfirmDialog = (id) => {
    setDeleteId(id);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  const handleDelete = () => {
    if (!deleteId) {
      setError("Template notifikasi tidak ditemukan");
      return;
    }
    deleteMutation.mutate(deleteId);
    handleCloseConfirmDialog();
  };

  // Preview handler: panggil /preview & tampilkan Title/Body
  const handlePreview = async (tpl) => {
    try {
      setPreviewOpen(true);
      setPreviewLoading(true);
      setPreviewError("");
      setPreviewData(null);

      // Kirim variables kosong; BE akan kembalikan missingVariables jika ada
      const res = await axiosInstance.post(
        "/api/v1/admin-sekolah/notification-template/preview",
        { templateKey: tpl.key, variables: {} }
      );

      setPreviewData(res.data);
    } catch (err) {
      const msg = err?.response?.data?.msg || "Gagal memuat preview";
      setPreviewError(msg);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <PageContainer title="Template Notifikasi" description="Template Notifikasi Mobile">
      <ParentCard title="Template Notifikasi">
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
            onChange={handleSearchChange}
            placeholder="Cari Template Notifikasi"
          />
          <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
            Tambah Template
          </AddButton>
          <FilterButton />
        </Box>

        <NotificationTemplateTable
          templates={filteredNotification}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleRowsPerPageChange}
          handleEdit={handleEdit}
          handleDelete={handleOpenConfirmDialog}
          handlePreview={handlePreview}   // <<< penting untuk tombol Preview di tabel
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>

      {/* Confirm Delete */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Apakah Anda yakin ingin menghapus template notifikasi?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={handleCloseConfirmDialog}>
            Batal
          </Button>
          <DeleteButton onClick={handleDelete} isLoading={deleteMutation.isLoading}>
            Hapus
          </DeleteButton>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Preview Template</DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Typography>Memuat preview…</Typography>
          ) : previewError ? (
            <Typography color="error">{previewError}</Typography>
          ) : previewData ? (
            <Box sx={{ display: "grid", gap: 1 }}>
              <Typography variant="subtitle2">Title</Typography>
              <Typography sx={{ mb: 1 }}>
                {previewData.payload?.notification?.title || "-"}
              </Typography>

              <Typography variant="subtitle2">Body</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {previewData.payload?.notification?.body || "-"}
              </Typography>

              {Array.isArray(previewData.missingVariables) &&
                previewData.missingVariables.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="warning.main">
                      Variabel belum terisi:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      {previewData.missingVariables.map((v) => (
                        <Chip key={v} size="small" label={v} color="warning" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
            </Box>
          ) : (
            <Typography>Tidak ada data preview.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default NotificationTemplateList;
