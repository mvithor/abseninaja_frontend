import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PerizinanSiswaTable from "src/apps/admin-sekolah/perizinan-siswa/List/PerizinanSiswaTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchPerizinanSiswa = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/perizinan-siswa');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching perizinan siswa:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data perizinan siswa. Silakan coba lagi'); 
    }
};

const PerizinanSiswaList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { data: perizinan = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['perizinanSiswa'],
        queryFn: fetchPerizinanSiswa,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        },
        select: (data) => Array.isArray(data) ? data : [], 
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredPerizinanSiswa = (perizinan || [])
    .filter((perizinan) => perizinan.nama_siswa?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.nama_siswa?.localeCompare(b.nama_siswa));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/perizinan-siswa/edit/${id}`)
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Perizinan Siswa" description="Perizinan Siswa">
            <ParentCard title="Perizinan Siswa">
                <Alerts error={error}/>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2, 
                        width: '100%',
                        mb: 2,
                    }}
                    >
                <SearchButton
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari Siswa"
                />
                <FilterButton/>
                </Box>
                <PerizinanSiswaTable
                    perizinan={filteredPerizinanSiswa}
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

export default PerizinanSiswaList