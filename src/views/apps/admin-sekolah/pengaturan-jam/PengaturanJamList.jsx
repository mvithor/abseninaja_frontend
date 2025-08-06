import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PengaturanJamTable from "src/apps/admin-sekolah/pengaturan-jam/List/PengaturanJamTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchJam = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/pengaturan-jam');
        const data = response.data.data;

        if (!data) {
            throw new Error('Data pengaturan jam tidak ditemukan');
        }

        return [
            {
                id: data.id,
                jam_masuk: data.jam_masuk,
                jam_pulang: data.jam_pulang,
                jam_terlambat: data.jam_terlambat || 'Tidak ditemukan',
                jam_alpa: data.jam_alpa,
            },
        ];
    } catch (error) {
        console.error('Error fetching pengaturan jam:', error);
        throw new Error('Terjadi kesalahan saat mengambil pengaturan jam. Silakan coba lagi');
    }
};


const PengaturanJamList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { data: jam = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['jam'],
        queryFn: fetchJam,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
     const filteredJam = jam.filter((item) =>
        item.jam_masuk.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/pengaturan-jam/edit/${id}`)
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Pengaturan Jam" description="Pengaturan Jam">
            <ParentCard title="Pengaturan Jam">
                <Alerts error={error}/>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2, 
                        width: '100%',
                        mb: 3,
                        mt: -2
                    }}
                    >
                <SearchButton
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari Jam"
                />
                </Box>
                <PengaturanJamTable
                    jam={filteredJam}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}
                    handleEdit={handleEdit}
                    isLoading={isLoading}
                    isError={isError}
                    errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default PengaturanJamList;