import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import EkskulSiswaTable from "src/apps/admin-sekolah/anggota-ekskul/List/EkskulSiswaTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchEkskulSiswa = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/ekskul/count-siswa');
        return response.data.data
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching ekskul:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data ekskul. Silakan coba lagi.'); 
    }
};

const EkskulSiswaList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { data: ekskulSiswa = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['ekskulSiswa'],
        queryFn: fetchEkskulSiswa,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
          }
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    const filteredEkskulSiswa = ekskulSiswa.filter((ekskulSiswa) => 
        ekskulSiswa.nama_ekskul.toLowerCase().includes(searchQuery.toLowerCase())
    );
     
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDetail = (id) => {
        navigate(`/dashboard/admin-sekolah/anggota-ekskul/detail/${id}`)
    };

    return (
        <PageContainer title="Anggota Ekstrakurikuler" description="Anggota Ekstrakurikuler">
            <ParentCard title="Anggota Ekstrakurikuler">
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
                    placeholder="Cari Ekstrakurikuler"
                />
                <FilterButton/>
                </Box>
                <EkskulSiswaTable
                    ekskulSiswa={filteredEkskulSiswa}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}
                    handleDetail={handleDetail}
                    isLoading={isLoading}
                    isError={isError}
                    errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}  
                />
            </ParentCard>
        </PageContainer>
    )
};

export default EkskulSiswaList;