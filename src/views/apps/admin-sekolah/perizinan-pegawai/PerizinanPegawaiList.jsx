import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PerizinanPegawaiTable from "src/apps/admin-sekolah/perizinan-pegawai/List/PerizinanPegawaiTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchPerizinanPegawai = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/perizinan-pegawai');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching perizinan pegawai:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data perizinan pegawai. Silakan coba lagi'); 
    }
};

const PerizinanPegawaiList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { data: perizinan = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['perizinanPegawai'],
        queryFn: fetchPerizinanPegawai,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        },
        select: (data) => Array.isArray(data) ? data : [], 
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredPerizinanPegawai = (perizinan || [])
    .filter((perizinan) => perizinan.nama_pegawai?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.nama_pegawai?.localeCompare(b.nama_pegawai));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/perizinan-pegawai/edit/${id}`)
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer>
            <ParentCard>
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
                    placeholder="Cari Pegawai"
                />
                <FilterButton/>
                </Box>
                <PerizinanPegawaiTable
                    perizinan={filteredPerizinanPegawai}
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

export default PerizinanPegawaiList;
