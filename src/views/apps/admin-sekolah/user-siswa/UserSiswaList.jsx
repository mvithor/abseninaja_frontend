// src/apps/admin-sekolah/user-siswa/list/UserSiswaList.jsx
import { useState } from "react";
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
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import UserSiswaTable from "src/apps/admin-sekolah/user-siswa/list/UserSiswaTable";
import NotificationPrefsDrawer from "src/apps/admin-sekolah/user-guru/prefs/NotificationPrefsDrawer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchUserSiswa = async () => {
  const response = await axiosInstance.get('/api/v1/admin-sekolah/users/siswa');
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

const UserSiswaList = () => {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteUserSiswa, setDeleteUserSiswa] = useState(null);

  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsUser, setPrefsUser] = useState({ id: null, name: "" });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: userSiswa = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['userSiswa'],
    queryFn: fetchUserSiswa,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      const response = await axiosInstance.delete(`/api/v1/admin-sekolah/users/${id}`, {
        params: { type },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['userSiswa']);
      setSuccess(data.msg || "Pengguna siswa berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      const details = err?.response?.data?.errors || [];
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat menghapus pengguna siswa";
      setError(details.length ? details.join(', ') : msg);
      setTimeout(() => setError(""), 3000);
    }
  });

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const filteredUserSiswa = (userSiswa || [])
    .filter((s) => (s?.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()))
    .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const handleEdit = (userId) => navigate(`#`);
  // const handleEdit = (userId) => navigate(`/dashboard/admin-sekolah/users/${userId}/edit`);

  const handleOpenPrefs = (userId, userName) => {
    setPrefsUser({ id: userId, name: userName || "" });
    setPrefsOpen(true);
  };
  const handleClosePrefs = () => setPrefsOpen(false);

  const handleOpenConfirmDialog = (userId) => { setDeleteUserSiswa(userId); setConfirmDialogOpen(true); };
  const handleCloseConfirmDialog = () => { setConfirmDialogOpen(false); setDeleteUserSiswa(null); };
  const handleDelete = () => {
    if (!deleteUserSiswa) {
      setError("Data tidak ditemukan");
      return;
    }
    deleteMutation.mutate({ id: deleteUserSiswa, type: 'siswa' });
    setConfirmDialogOpen(false);
  };

  return (
    <PageContainer title="Pengguna Siswa" description="Pengguna Siswa">
      <ParentCard title="Pengguna Siswa">
        <Alerts error={error} success={success} />

        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:2, width:'100%', mb:3 }}>
          <SearchButton value={searchQuery} onChange={handleSearchChange} placeholder="Cari Nama Siswa" />
          <FilterButton />
        </Box>

        <UserSiswaTable
          userSiswa={filteredUserSiswa}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleRowsPerPageChange}
          handleEdit={handleEdit}
          handleOpenPrefs={handleOpenPrefs}  
          handleDelete={handleOpenConfirmDialog}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>

      {/* dialog hapus */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Apakah Anda yakin ingin menghapus pengguna siswa ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleCloseConfirmDialog} sx={{ mr: 3 }}>
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
            sx={{ mr: 3, backgroundColor: "#F48C06", '&:hover': { backgroundColor: "#f7a944" } }}
          >
            {deleteMutation.isLoading ? <CircularProgress size={24} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* drawer preferensi notifikasi (reusable) */}
      <NotificationPrefsDrawer
        open={prefsOpen}
        onClose={handleClosePrefs}
        userId={prefsUser.id}
        userName={prefsUser.name}
        onSaved={() => {
          setSuccess('Preferensi notifikasi disimpan');
          setTimeout(() => setSuccess(''), 2500);
        }}
      />
    </PageContainer>
  );
};

export default UserSiswaList;
