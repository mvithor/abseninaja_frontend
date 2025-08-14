import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import UserWaliSiswaTable from "src/apps/admin-sekolah/user-wali-siswa/list/UserWaliSiswaTable";
import NotificationPrefsDrawer from "src/apps/admin-sekolah/user-wali-siswa/prefs/NotificationPrefsDrawer";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchUserWaliSiswa = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/users/wali-siswa');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching user wali siswa:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil pengguna wali siswa. Silakan coba lagi'); 
    }
};

const UserWaliSiswaList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [prefsUser, setPrefsUser] = useState({ id: null, name: '' });
    const navigate = useNavigate();

    const { data: userWaliSiswa = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['userWaliSiswa'],
        queryFn: fetchUserWaliSiswa,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const filteredUserWaliSiswa = (userWaliSiswa || [])
        .filter((item) => (item?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
        .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleEdit = () => {
        navigate(`#`);
    };

    const handleOpenPrefs = (userId, name) => {
        setPrefsUser({ id: userId, name: name || '' });
        setPrefsOpen(true);
    };

    const handleClosePrefs = () => {
        setPrefsOpen(false);
    };

    return (
        <PageContainer title="Pengguna Wali Siswa" description="Pengguna Wali Siswa">
            <ParentCard title="Pengguna Wali Siswa">
                <Alerts error={error} success={success}/>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2, 
                        width: '100%',
                        mb: 3,
                    }}
                >
                    <SearchButton
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Cari Wali Siswa"
                    />
                    <FilterButton />
                </Box>
                <UserWaliSiswaTable
                    userWaliSiswa={filteredUserWaliSiswa}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}
                    handleEdit={handleEdit}
                    handleOpenPrefs={handleOpenPrefs}
                    isLoading={isLoading}
                    isError={isError}
                    errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
                />
            </ParentCard>

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

export default UserWaliSiswaList;
