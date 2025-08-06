import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import SiswaTable from "src/apps/admin-sekolah/data-siswa/List/SiswaTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchSiswa = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/siswa');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching siswa:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data siswa. Silakan coba lagi'); 
    }
};

const SiswaList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    // const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const { data: siswa = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['siswa'],
        queryFn: fetchSiswa,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    const filteredSiswa = siswa
        .filter((siswa) => 
          siswa.User.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.User.name.localeCompare(b.User.name));
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/siswa/tambah')
    }

    const handleEdit = (id) => {
        if (!id || !isUUID(id)) {
            return;
        }
        navigate(`/dashboard/admin-sekolah/siswa/edit/${id}`);  
    };
    

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Data Siswa" description="Data Siswa">
            <ParentCard title="Data Siswa">
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
                    placeholder="Cari Nama Siswa"
                />
                <AddButton
                    icon={<IconPlus size={20} color="white" />}
                    onClick={handleAdd}
                    >
                    Tambah Siswa
                </AddButton>
                <FilterButton/>
                </Box>
                <SiswaTable
                    siswa={filteredSiswa}
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

export default SiswaList;